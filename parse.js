(function (root) {
  'use strict';

  const CURRENCY = '(?:US\\$|R\\$|C\\$|A\\$|S\\$|NZ\\$|HK\\$|\\$|€|£|₺|¥|₹|zł|kr|TL|TRY|EUR|USD|GBP|AED|SAR|EGP|SEK|PLN|JPY|INR|MXN|BRL|CAD|AUD|SGD|CHF)';
  const NUMBER = '(?:\\d{1,3}(?:[.,\\u00a0\\u202f ]\\d{3})+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?)';
  const PRICE_RE = new RegExp(
    '(' + CURRENCY + ')[\\u00a0 ]?(' + NUMBER + ')(?!\\w)|(' + NUMBER + ')[\\u00a0 ]?(' + CURRENCY + ')(?![A-Za-z])',
    'g'
  );

  const UP_RE = /artt?ırıldı|yükseldi|yükseltildi|zamlandı|increas|went up|risen|rose|erhöht|gestiegen|augment|aument|verhoogd|gestegen|wzros|ökat|höjts|上が|値上/i;
  const DOWN_RE = /azaltıldı|düşürüldü|düştü|indirildi|decreas|went down|dropped|fell|lowered|reduc|gesunken|gesenkt|diminu|baiss|disminu|bajad|verlaagd|gedaald|spad|obniż|minskat|sänkts|下が|値下/i;
  const SAVED_RE = /kayıtlı|saved|later|gespeichert|enregistr|guardad|salvat|opgeslagen|zapisan|sparad/i;
  const CART_RE = /sepet|cart|basket|warenkorb|panier|carrito|carrello|winkelwagen|koszyk|kundvagn/i;

  function round2(v) {
    return Math.round(v * 100) / 100;
  }

  function parseAmount(text) {
    const s = String(text == null ? '' : text).replace(/[\s  ]/g, '');
    if (!s) return null;
    const m = s.match(/[.,](\d+)$/);
    let whole = s;
    let frac = '';
    if (m && m[1].length <= 2) {
      whole = s.slice(0, m.index);
      frac = m[1];
    }
    const n = Number(whole.replace(/[.,]/g, '') + (frac ? '.' + frac : ''));
    return Number.isFinite(n) ? n : null;
  }

  function findPrices(text) {
    const out = [];
    const s = String(text == null ? '' : text);
    PRICE_RE.lastIndex = 0;
    let m;
    while ((m = PRICE_RE.exec(s))) {
      const prefix = m[1] != null;
      const amount = parseAmount(prefix ? m[2] : m[3]);
      if (amount == null) continue;
      out.push({
        raw: m[0],
        amount,
        currency: prefix ? m[1] : m[4],
        placement: prefix ? 'prefix' : 'suffix',
        index: m.index,
      });
    }
    return out;
  }

  function detectDirection(text) {
    const s = String(text == null ? '' : text);
    if (UP_RE.test(s)) return 'up';
    if (DOWN_RE.test(s)) return 'down';
    return null;
  }

  function parseChange(text) {
    const prices = findPrices(text);
    if (prices.length < 2) return null;
    const keyword = detectDirection(text);
    let oldPrice = prices[0].amount;
    let newPrice = prices[1].amount;
    if (keyword === 'up' && oldPrice > newPrice) [oldPrice, newPrice] = [newPrice, oldPrice];
    if (keyword === 'down' && oldPrice < newPrice) [oldPrice, newPrice] = [newPrice, oldPrice];
    const direction = newPrice > oldPrice ? 'up' : newPrice < oldPrice ? 'down' : 'same';
    return {
      oldPrice,
      newPrice,
      direction,
      keyword,
      currency: prices[0].currency,
      placement: prices[0].placement,
    };
  }

  function enrich(item) {
    const delta = round2(item.newPrice - item.oldPrice);
    const pct = item.oldPrice > 0 ? (delta / item.oldPrice) * 100 : null;
    return Object.assign({}, item, { delta, pct });
  }

  function summarize(items) {
    const ups = items.filter((i) => i.direction === 'up');
    const downs = items.filter((i) => i.direction === 'down');
    const sum = (arr) => round2(arr.reduce((acc, i) => acc + i.delta, 0));
    const biggest = (arr) => arr.slice().sort((a, b) => Math.abs(b.pct || 0) - Math.abs(a.pct || 0))[0] || null;
    return {
      total: items.length,
      upCount: ups.length,
      downCount: downs.length,
      upSum: sum(ups),
      downSum: sum(downs),
      net: sum(items),
      biggestUp: biggest(ups),
      biggestDown: biggest(downs),
      maxAbsPct: items.reduce((m, i) => Math.max(m, Math.abs(i.pct || 0)), 0),
    };
  }

  const SORTERS = {
    pct: (a, b) => (a.pct == null ? 0 : a.pct) - (b.pct == null ? 0 : b.pct),
    delta: (a, b) => a.delta - b.delta,
    newPrice: (a, b) => a.newPrice - b.newPrice,
    oldPrice: (a, b) => a.oldPrice - b.oldPrice,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  const DEFAULT_DIR = { pct: 'asc', delta: 'asc', newPrice: 'desc', oldPrice: 'desc', name: 'asc' };

  function defaultSortDir(key) {
    return DEFAULT_DIR[key] || 'asc';
  }

  function sortItems(items, key, dir) {
    const k = SORTERS[key] ? key : 'pct';
    const f = SORTERS[k];
    const d = dir || DEFAULT_DIR[k];
    return items.slice().sort(d === 'desc' ? (a, b) => f(b, a) : f);
  }

  function filterItems(items, filter) {
    if (filter === 'up' || filter === 'down') return items.filter((i) => i.direction === filter);
    return items.slice();
  }

  function groupKind(text) {
    const s = String(text == null ? '' : text);
    if (SAVED_RE.test(s)) return 'saved';
    if (CART_RE.test(s)) return 'cart';
    return '';
  }

  function formatNumber(value, locale, digits) {
    try {
      return new Intl.NumberFormat(locale || undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
    } catch (e) {
      return value.toFixed(digits);
    }
  }

  function signOf(value, signed) {
    if (value < 0) return '−';
    if (value > 0 && signed) return '+';
    return '';
  }

  function formatMoney(amount, currency, placement, locale, signed) {
    const num = formatNumber(Math.abs(amount), locale, 2);
    const sign = signOf(amount, signed);
    return placement === 'prefix' ? sign + currency + num : sign + num + ' ' + currency;
  }

  function formatPct(pct, locale, signed) {
    if (pct == null || !Number.isFinite(pct)) return '—';
    return signOf(pct, signed) + formatNumber(Math.abs(pct), locale, 1) + '%';
  }

  function toCSV(items) {
    const esc = (v) => {
      const s = String(v == null ? '' : v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const rows = [['Product', 'Old price', 'New price', 'Change', 'Change %', 'Currency', 'URL']];
    for (const i of items) {
      rows.push([i.name, i.oldPrice.toFixed(2), i.newPrice.toFixed(2), i.delta.toFixed(2), i.pct == null ? '' : i.pct.toFixed(2), i.currency, i.href || '']);
    }
    return rows.map((r) => r.map(esc).join(',')).join('\n');
  }

  const ASIN_RE = /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/product\/|[?&]asin=)([A-Z0-9]{10})(?![A-Z0-9])/i;

  function asinFrom(href) {
    const m = ASIN_RE.exec(String(href == null ? '' : href));
    return m ? m[1].toUpperCase() : null;
  }

  function recordHistory(history, item, now, limit) {
    const key = item.key || item.asin || item.href;
    if (!key) return null;
    const entry = history[key] || { name: item.name, points: [] };
    entry.name = item.name;
    entry.seen = now;
    if (item.href) entry.href = item.href;
    if (item.image) entry.image = item.image;
    if (item.group) entry.group = item.group;
    if (item.currency) {
      entry.currency = item.currency;
      entry.placement = item.placement || 'suffix';
    }
    const pts = entry.points;
    const last = pts[pts.length - 1];
    const recorded = pts.some((pt, i) => i > 0 && pts[i - 1].p === item.oldPrice && pt.p === item.newPrice);
    if (!recorded) {
      if (last && last.p === item.newPrice) {
        pts.splice(pts.length - 1, 0, { t: null, p: item.oldPrice });
      } else {
        if (!last || last.p !== item.oldPrice) pts.push({ t: null, p: item.oldPrice });
        pts.push({ t: now, p: item.newPrice });
      }
    }
    capPoints(pts, limit);
    history[key] = entry;
    return entry;
  }

  function capPoints(pts, limit) {
    const max = limit || 100;
    if (pts.length > max) pts.splice(0, pts.length - max);
  }

  function recordObservation(history, obs, now, limit) {
    const key = obs.key || obs.asin;
    if (!key || !Number.isFinite(obs.price) || obs.price <= 0) return null;
    const entry = history[key] || { name: obs.name, points: [] };
    if (obs.name && (!entry.name || obs.name.length >= entry.name.length)) entry.name = obs.name;
    entry.seen = now;
    if (obs.href) entry.href = obs.href;
    if (obs.image) entry.image = obs.image;
    if (obs.group) entry.group = obs.group;
    if (obs.currency) {
      entry.currency = obs.currency;
      entry.placement = obs.placement || 'suffix';
    }
    const pts = entry.points;
    const last = pts[pts.length - 1];
    if (!last || last.p !== obs.price) pts.push({ t: now, p: obs.price });
    capPoints(pts, limit);
    history[key] = entry;
    return entry;
  }

  const DAY = 86400000;

  function windowStart(key, now) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    const midnight = d.getTime();
    switch (key) {
      case 'today':
        return midnight;
      case '2d':
        return midnight - DAY;
      case '7d':
        return now - 7 * DAY;
      case '30d':
        return now - 30 * DAY;
      default:
        return -Infinity;
    }
  }

  function pruneHistory(history, now, maxAgeDays) {
    const maxAge = (maxAgeDays || 180) * 86400000;
    const out = {};
    for (const [key, entry] of Object.entries(history || {})) {
      if (!entry || !Array.isArray(entry.points)) continue;
      const seen = entry.seen == null ? now : entry.seen;
      if (now - seen > maxAge) continue;
      out[key] = entry;
    }
    return out;
  }

  function itemsFromHistory(history, now, start, fallbackMoney) {
    const out = [];
    const tOf = (pt) => (pt.t == null ? -Infinity : pt.t);
    for (const [key, entry] of Object.entries(history || {})) {
      const pts = entry && Array.isArray(entry.points) ? entry.points : [];
      if (pts.length < 2) continue;
      let first = pts.length;
      while (first > 0 && tOf(pts[first - 1]) >= start) first--;
      if (first === pts.length) continue;
      const before = first > 0 ? pts[first - 1] : null;
      const oldPt = before || pts[first];
      const last = pts[pts.length - 1];
      if (!before && pts.length - first < 2) continue;
      if (oldPt.p === last.p) continue;
      const changedAt = last.t == null ? entry.seen || 0 : last.t;
      out.push(
        enrich({
          key,
          name: entry.name || key,
          href: entry.href || '',
          image: entry.image || null,
          group: entry.group || '',
          oldPrice: oldPt.p,
          newPrice: last.p,
          changedAt,
          seen: entry.seen || changedAt,
          direction: last.p > oldPt.p ? 'up' : 'down',
          currency: entry.currency || (fallbackMoney && fallbackMoney.currency) || '',
          placement: entry.placement || (fallbackMoney && fallbackMoney.placement) || 'suffix',
          points: pts.length,
          steps: pts.length - first,
        })
      );
    }
    return out;
  }

  const HOST_CURRENCY = [
    ['.com.tr', 'TL', 'suffix'],
    ['.co.uk', '£', 'prefix'],
    ['.co.jp', '¥', 'prefix'],
    ['.com.au', '$', 'prefix'],
    ['.com.br', 'R$', 'prefix'],
    ['.com.mx', '$', 'prefix'],
    ['.com.be', '€', 'suffix'],
    ['.de', '€', 'suffix'],
    ['.fr', '€', 'suffix'],
    ['.it', '€', 'suffix'],
    ['.es', '€', 'suffix'],
    ['.nl', '€', 'suffix'],
    ['.se', 'kr', 'suffix'],
    ['.pl', 'zł', 'suffix'],
    ['.in', '₹', 'prefix'],
    ['.sg', 'S$', 'prefix'],
    ['.ae', 'AED', 'prefix'],
    ['.sa', 'SAR', 'prefix'],
    ['.eg', 'EGP', 'prefix'],
    ['.ca', '$', 'prefix'],
    ['.com', '$', 'prefix'],
  ];

  function currencyForHost(host) {
    const h = String(host || '').toLowerCase();
    for (const [suffix, currency, placement] of HOST_CURRENCY) if (h.endsWith(suffix)) return { currency, placement };
    return { currency: '', placement: 'suffix' };
  }

  function productImageFromHTML(html) {
    const s = String(html == null ? '' : html);
    const unescape = (u) => u.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
    const patterns = [
      /"hiRes"\s*:\s*"(https:[^"]+)"/,
      /"large"\s*:\s*"(https:[^"]+)"/,
      /id="landingImage"[^>]*?data-old-hires="([^"]+)"/,
      /data-old-hires="([^"]+)"[^>]*?id="landingImage"/,
      /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/,
      /id="landingImage"[^>]*?\ssrc="([^"]+)"/,
      /id="imgBlkFront"[^>]*?\ssrc="([^"]+)"/,
    ];
    for (const re of patterns) {
      const m = re.exec(s);
      if (m && m[1]) {
        const u = unescape(m[1]);
        if (/^https:\/\//.test(u)) return u;
      }
    }
    const dyn = /id="landingImage"[^>]*?data-a-dynamic-image="([^"]+)"/.exec(s) || /data-a-dynamic-image="([^"]+)"[^>]*?id="landingImage"/.exec(s);
    if (dyn) {
      try {
        const keys = Object.keys(JSON.parse(unescape(dyn[1])));
        if (keys.length && /^https:\/\//.test(keys[0])) return keys[0];
      } catch (e) {}
    }
    return null;
  }

  function lowestSeen(entry, price) {
    if (!entry || !Array.isArray(entry.points) || entry.points.length < 3) return false;
    return entry.points.every((pt) => price <= pt.p);
  }

  function sparkline(values, width, height, pad) {
    const p = pad == null ? 3 : pad;
    if (!values || values.length < 2) return { d: '', points: [] };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const stepX = (width - p * 2) / (values.length - 1);
    const points = values.map((v, i) => ({
      x: Number((p + i * stepX).toFixed(1)),
      y: Number((p + (1 - (v - min) / span) * (height - p * 2)).toFixed(1)),
    }));
    const d = points.map((pt, i) => (i ? 'L' : 'M') + pt.x + ' ' + pt.y).join(' ');
    return { d, points };
  }

  function newKeys(items, prevKeys) {
    if (!Array.isArray(prevKeys)) return [];
    const prev = new Set(prevKeys);
    return items.map((i) => i.key).filter((k) => k && !prev.has(k));
  }

  const api = {
    parseAmount,
    findPrices,
    detectDirection,
    parseChange,
    enrich,
    summarize,
    sortItems,
    defaultSortDir,
    filterItems,
    asinFrom,
    recordHistory,
    recordObservation,
    windowStart,
    pruneHistory,
    itemsFromHistory,
    currencyForHost,
    lowestSeen,
    productImageFromHTML,
    sparkline,
    newKeys,
    groupKind,
    formatMoney,
    formatPct,
    toCSV,
  };

  root.AmazonPriceChanges = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
