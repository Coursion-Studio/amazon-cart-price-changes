(function (root) {
  'use strict';

  function apc() {
    return root.AmazonPriceChanges || (typeof require === 'function' ? require('./parse.js') : null);
  }

  const NAMED = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };

  function decodeEntities(text) {
    return String(text == null ? '' : text).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
      if (code[0] === '#') {
        const n = code[1] === 'x' || code[1] === 'X' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      }
      const v = NAMED[code.toLowerCase()];
      return v == null ? m : v;
    });
  }

  function clean(text) {
    return decodeEntities(text).replace(/\s+/g, ' ').trim();
  }

  function attr(tag, name) {
    const re = new RegExp('\\s' + name + '\\s*=\\s*"([^"]*)"', 'i');
    const m = re.exec(tag);
    return m ? m[1] : null;
  }

  function textAfterClass(html, cls) {
    const re = new RegExp('class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>([^<]*)<', 'g');
    let m;
    while ((m = re.exec(html))) {
      const t = clean(m[1]);
      if (t) return t;
    }
    return '';
  }

  function textAfterId(html, id) {
    const re = new RegExp('id="' + id + '"[^>]*>([^<]*)<');
    const m = re.exec(html);
    return m ? clean(m[1]) : '';
  }

  function firstPrice(text) {
    const lib = apc();
    const prices = lib ? lib.findPrices(clean(text)) : [];
    const p = prices.find((x) => x.amount > 0);
    return p ? { amount: p.amount, currency: p.currency, placement: p.placement } : null;
  }

  function priceAfterClass(html, cls) {
    const re = new RegExp('class="[^"]*\\b' + cls + '\\b[^"]*"[^>]*>([^<]*)<', 'g');
    let m;
    while ((m = re.exec(html))) {
      const p = firstPrice(m[1]);
      if (p) return p;
    }
    return null;
  }

  const PLACEHOLDER_RE = /loading|spinner|transparent|pixel\.gif|\/images\/G\//i;

  function goodImage(url) {
    const u = decodeEntities(url || '').trim();
    return /^https:\/\//.test(u) && !PLACEHOLDER_RE.test(u) ? u : null;
  }

  function imageFromChunk(chunk) {
    const tags = chunk.match(/<img\b[^>]*>/gi) || [];
    for (const tag of tags) {
      const direct = goodImage(attr(tag, 'src')) || goodImage(attr(tag, 'data-src')) || goodImage(attr(tag, 'data-old-hires'));
      if (direct) return direct;
      const dyn = attr(tag, 'data-a-dynamic-image');
      if (dyn) {
        try {
          for (const key of Object.keys(JSON.parse(decodeEntities(dyn)))) {
            const u = goodImage(key);
            if (u) return u;
          }
        } catch (e) {}
      }
    }
    return null;
  }

  function altFromChunk(chunk) {
    const tags = chunk.match(/<img\b[^>]*>/gi) || [];
    for (const tag of tags) {
      const alt = clean(attr(tag, 'alt') || '');
      if (alt) return alt;
    }
    return '';
  }

  function cartItemsFromHTML(html) {
    const s = String(html == null ? '' : html);
    const lib = apc();
    const starts = [];
    const tagRe = /<[a-zA-Z][^>]*\bdata-asin="([A-Z0-9]{10})"[^>]*>/g;
    let m;
    while ((m = tagRe.exec(s))) {
      const cls = attr(m[0], 'class') || '';
      if (/sc-list-item/.test(cls)) starts.push({ index: m.index, tag: m[0], asin: m[1] });
    }
    const out = [];
    const seen = new Set();
    starts.forEach((start, i) => {
      if (seen.has(start.asin)) return;
      const end = i + 1 < starts.length ? starts[i + 1].index : s.length;
      const chunk = s.slice(start.index, end);
      let price = null;
      const dataPrice = attr(start.tag, 'data-price');
      const amount = dataPrice != null && lib ? lib.parseAmount(dataPrice) : null;
      const found = priceAfterClass(chunk, 'sc-product-price') || priceAfterClass(chunk, 'a-offscreen');
      if (amount != null && amount > 0) {
        price = { amount, currency: found ? found.currency : '', placement: found ? found.placement : 'suffix' };
      } else {
        price = found;
      }
      const name = textAfterClass(chunk, 'sc-product-title') || textAfterClass(chunk, 'a-truncate-full') || altFromChunk(chunk);
      if (!price || !name) return;
      seen.add(start.asin);
      out.push({
        asin: start.asin,
        name,
        price: price.amount,
        currency: price.currency,
        placement: price.placement,
        group: attr(start.tag, 'data-itemtype') === 'saved' ? 'saved' : 'cart',
        href: '/dp/' + start.asin,
        image: imageFromChunk(chunk),
      });
    });
    return out;
  }

  const SUFFIX_SYMBOLS = ['TL', '€', 'kr', 'zł'];

  function priceFromProductHTML(html) {
    const s = String(html == null ? '' : html);
    const amountMatch = /"priceAmount"\s*:\s*(\d+(?:\.\d+)?)/.exec(s);
    const symbolMatch = /"currencySymbol"\s*:\s*"([^"]+)"/.exec(s);
    if (amountMatch && symbolMatch) {
      const amount = Number(amountMatch[1]);
      const currency = decodeEntities(symbolMatch[1]).trim();
      if (amount > 0 && currency) {
        const shown = priceAfterClass(s, 'a-offscreen');
        const placement = shown && shown.currency === currency ? shown.placement : SUFFIX_SYMBOLS.includes(currency) ? 'suffix' : 'prefix';
        return { amount, currency, placement };
      }
    }
    for (const id of ['corePriceDisplay_desktop_feature_div', 'corePrice_feature_div', 'apex_desktop']) {
      const at = s.indexOf('id="' + id + '"');
      if (at < 0) continue;
      const p = priceAfterClass(s.slice(at), 'a-offscreen');
      if (p) return p;
    }
    for (const id of ['priceblock_ourprice', 'price_inside_buybox']) {
      const t = textAfterId(s, id);
      const p = t ? firstPrice(t) : null;
      if (p) return p;
    }
    return priceAfterClass(s, 'a-offscreen');
  }

  function productFromHTML(html) {
    const s = String(html == null ? '' : html);
    const lib = apc();
    const m = /id="productTitle"[^>]*>([\s\S]*?)</.exec(s);
    return {
      name: m ? clean(m[1]) : '',
      image: lib ? lib.productImageFromHTML(s) : null,
    };
  }

  const api = {
    decodeEntities,
    cartItemsFromHTML,
    priceFromProductHTML,
    productFromHTML,
  };

  root.AmazonScan = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
