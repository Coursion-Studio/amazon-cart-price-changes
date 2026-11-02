(function () {
  'use strict';

  const APC = window.AmazonPriceChanges;
  if (!APC || window.__amazonPriceChangesInstalled) return;
  window.__amazonPriceChangesInstalled = true;

  const PANEL_ID = 'apc-panel';
  const PREFS_KEY = 'apc:prefs';
  const SEEN_KEY = 'apc:seen';
  const HISTORY_KEY = 'apc:history';
  const ALERTISH = '.a-alert, .a-alert-inline, [class*="alert" i]';
  const SORT_KEYS = ['name', 'oldPrice', 'newPrice', 'delta', 'pct', 'changedAt'];
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const CART_RE = /(^|\/)(cart|gp\/cart|gp\/aw\/c)(\/|$)/;
  const WINDOWS = ['today', '2d', '7d', '30d', 'all'];
  const LIST_SCOPE = '#sc-active-cart, #sc-saved-cart, #activeCartViewForm, #sc-saved-cart-items, [data-name="Active Items"], [data-name="Saved Items"], .sc-list-body';

  const lang = (document.documentElement.getAttribute('lang') || navigator.language || 'en').toLowerCase();
  const locale = /^[a-z]{2}(-[a-z0-9]+)?$/.test(lang) ? lang : 'en';
  const pageMoney = APC.currencyForHost(location.hostname);

  const STRINGS = {
    en: {
      title: 'Price changes',
      all: 'All',
      drops: 'Drops',
      increases: 'Increases',
      search: 'Filter products',
      product: 'Product',
      was: 'Was',
      now: 'Now',
      change: 'Change',
      when: 'When',
      dropped: 'Dropped',
      increased: 'Increased',
      combined: 'combined',
      biggestDrop: 'Biggest drop',
      biggestIncrease: 'Biggest increase',
      items: (n) => (n === 1 ? '1 item' : n + ' items'),
      newSince: (n, d) => (n === 1 ? '1 new' : n + ' new') + ' since ' + d,
      remembered: 'Remembered from earlier visits',
      tracking: (n) => (n === 1 ? '1 item tracked' : n + ' items tracked'),
      noChanges: 'No price changes in this period',
      winToday: 'Today',
      win2d: '2 days',
      win7d: '7 days',
      win30d: '30 days',
      winAll: 'All time',
      cards: 'Cards',
      list: 'List',
      period: 'Period',
      sort: 'Sort',
      sortDropFirst: 'Biggest drop first',
      sortRiseFirst: 'Biggest rise first',
      sortNewest: 'Newest first',
      sortSaving: 'Biggest saving',
      sortPriceHigh: 'Price: high to low',
      sortPriceLow: 'Price: low to high',
      sortName: 'Name A–Z',
      none: '—',
      showAll: 'Show all time',
      diag: 'Copy diagnostics',
      diagDone: 'Diagnostics copied',
      isNew: 'New',
      lowest: 'Lowest seen',
      today: 'today',
      empty: 'Nothing matches',
      net: 'Net',
      history: 'Price history',
      seen: (n) => n + ' prices seen',
      earlier: 'earlier',
      open: 'Open product',
      forget: 'Forget this item',
      details: 'Details',
      collapse: 'Collapse',
      expand: 'Expand',
      copy: 'Copy CSV',
      copied: 'Copied',
      clear: 'Clear history',
      clearConfirm: 'Click again to clear',
      showOriginal: "Show Amazon's list",
      hideOriginal: "Hide Amazon's list",
      saved: 'Saved',
      cart: 'Cart',
    },
    tr: {
      title: 'Fiyat değişiklikleri',
      all: 'Tümü',
      drops: 'Düşenler',
      increases: 'Artanlar',
      search: 'Ürün ara',
      product: 'Ürün',
      was: 'Eski',
      now: 'Yeni',
      change: 'Değişim',
      when: 'Tarih',
      dropped: 'Düşen',
      increased: 'Artan',
      combined: 'toplam',
      biggestDrop: 'En büyük düşüş',
      biggestIncrease: 'En büyük artış',
      items: (n) => n + ' ürün',
      newSince: (n, d) => d + "'den beri " + n + ' yeni',
      remembered: 'Önceki ziyaretlerden hatırlanıyor',
      tracking: (n) => n + ' ürün izleniyor',
      noChanges: 'Bu dönemde fiyat değişikliği yok',
      winToday: 'Bugün',
      win2d: '2 gün',
      win7d: '7 gün',
      win30d: '30 gün',
      winAll: 'Tüm zamanlar',
      cards: 'Kartlar',
      list: 'Liste',
      period: 'Dönem',
      sort: 'Sırala',
      sortDropFirst: 'En çok düşen önce',
      sortRiseFirst: 'En çok artan önce',
      sortNewest: 'En yeni önce',
      sortSaving: 'En çok tasarruf',
      sortPriceHigh: 'Fiyat: yüksekten düşüğe',
      sortPriceLow: 'Fiyat: düşükten yükseğe',
      sortName: 'Ad A–Z',
      none: '—',
      showAll: 'Tüm zamanları göster',
      diag: 'Teşhis kopyala',
      diagDone: 'Teşhis kopyalandı',
      isNew: 'Yeni',
      lowest: 'En düşük',
      today: 'bugün',
      empty: 'Eşleşen ürün yok',
      net: 'Net',
      history: 'Fiyat geçmişi',
      seen: (n) => n + ' fiyat görüldü',
      earlier: 'önce',
      open: 'Ürüne git',
      forget: 'Bu ürünü unut',
      details: 'Ayrıntılar',
      collapse: 'Daralt',
      expand: 'Genişlet',
      copy: 'CSV kopyala',
      copied: 'Kopyalandı',
      clear: 'Geçmişi temizle',
      clearConfirm: 'Temizlemek için tekrar tıkla',
      showOriginal: 'Amazon listesini göster',
      hideOriginal: 'Amazon listesini gizle',
      saved: 'Kayıtlı',
      cart: 'Sepet',
    },
  };
  const T = STRINGS[lang.slice(0, 2)] || STRINGS.en;

  const store = {
    get(key, fallback) {
      try {
        const v = JSON.parse(localStorage.getItem(key));
        return v == null ? fallback : v;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
  };

  const prefs = Object.assign({ sort: 'pct', dir: 'asc', filter: 'all', window: 'all', view: 'cards', showOriginal: false, collapsed: false }, store.get(PREFS_KEY, {}));
  if (prefs.view !== 'cards' && prefs.view !== 'list') prefs.view = 'cards';
  if (!SORT_KEYS.includes(prefs.sort)) prefs.sort = 'pct';
  if (!WINDOWS.includes(prefs.window)) prefs.window = 'all';
  if (prefs.dir !== 'asc' && prefs.dir !== 'desc') prefs.dir = APC.defaultSortDir(prefs.sort);
  const savePrefs = () => store.set(PREFS_KEY, prefs);
  const prevSeen = store.get(SEEN_KEY, null);
  let history = APC.pruneHistory(store.get(HISTORY_KEY, {}), Date.now(), 365);

  const state = {
    items: [],
    live: [],
    summary: null,
    signature: '',
    anchor: { node: null, whole: false, after: false },
    hidden: [],
    expanded: new Set(),
    query: '',
    showTags: false,
    tracked: 0,
    ui: {},
  };

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'style') node.style.cssText = v;
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat(Infinity)) {
      if (c == null || c === false) continue;
      node.append(c.nodeType ? c : document.createTextNode(String(c)));
    }
    return node;
  }

  function svg(tag, attrs) {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs || {})) if (v != null) node.setAttribute(k, v);
    return node;
  }

  function squash(text) {
    return String(text || '').replace(/\s+/g, ' ').trim();
  }

  function lineText(li) {
    const clone = li.cloneNode(true);
    clone.querySelectorAll('a').forEach((a) => a.replaceWith(' '));
    return squash(clone.textContent);
  }

  function isToday(t) {
    return t != null && new Date(t).toDateString() === new Date().toDateString();
  }

  function formatDate(t) {
    if (t == null) return T.earlier;
    if (isToday(t)) return T.today;
    const d = new Date(t);
    const opts = { day: 'numeric', month: 'short' };
    if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
    try {
      return new Intl.DateTimeFormat(locale, opts).format(d);
    } catch (e) {
      return d.toLocaleDateString();
    }
  }

  function money(amount, item, signed) {
    return APC.formatMoney(amount, item.currency, item.placement, locale, signed);
  }

  function productHref(item) {
    if (item.href) return item.href;
    if (/^[A-Z0-9]{10}$/.test(item.key)) return location.origin + '/dp/' + item.key;
    return null;
  }

  function groupHeading(ul) {
    let node = ul;
    for (let depth = 0; depth < 6 && node; depth++) {
      let sib = node.previousElementSibling;
      while (sib) {
        const bold = sib.matches('.a-text-bold, b, strong, h1, h2, h3, h4, h5')
          ? sib
          : sib.querySelector('.a-text-bold, b, strong, h4, h5');
        if (bold && squash(bold.textContent)) return squash(bold.textContent);
        sib = sib.previousElementSibling;
      }
      node = node.parentElement;
      if (!node || node === document.body || node.matches(ALERTISH)) break;
    }
    return '';
  }

  const BAD_IMAGE_RE = /loading|spinner|transparent|pixel\.gif|placeholder|grey-pixel|\/images\/G\/|\/x-locale\//i;

  function isGoodImageURL(url) {
    if (!url || typeof url !== 'string') return false;
    if (!/^(https?:|data:image\/(png|jpe?g|webp|svg))/i.test(url)) return false;
    return !BAD_IMAGE_RE.test(url);
  }

  function imageSource(img) {
    if (!img || img.closest('#' + PANEL_ID)) return null;
    const candidates = [];
    const dynamic = img.getAttribute('data-a-dynamic-image');
    if (dynamic) {
      try {
        candidates.push(...Object.keys(JSON.parse(dynamic)));
      } catch (e) {}
    }
    for (const attr of ['data-old-hires', 'data-src', 'data-lazy-src', 'data-a-hires', 'data-original']) {
      const v = img.getAttribute(attr);
      if (v) candidates.push(v);
    }
    const srcset = img.getAttribute('srcset');
    if (srcset) candidates.push(srcset.split(',')[0].trim().split(/\s+/)[0]);
    candidates.push(img.currentSrc, img.src);
    for (const c of candidates) {
      if (!isGoodImageURL(c)) continue;
      const isLive = c === img.currentSrc || c === img.src;
      if (isLive && img.complete && img.naturalWidth > 0 && img.naturalWidth < 40) continue;
      return c;
    }
    return null;
  }

  function asinImageURL(asin) {
    return 'https://images-na.ssl-images-amazon.com/images/P/' + asin + '.01._SL320_.jpg';
  }

  function findImage(asin) {
    if (!asin) return null;
    const selectors = [
      '[data-asin="' + asin + '"] img',
      'img[data-asin="' + asin + '"]',
      '[data-itemid="' + asin + '"] img',
      'a[href*="/' + asin + '"] img',
      'a[href*="/' + asin.toLowerCase() + '"] img',
    ];
    for (const sel of selectors) {
      for (const img of document.querySelectorAll(sel)) {
        const src = imageSource(img);
        if (src) return src;
      }
    }
    return null;
  }

  function collect() {
    const byKey = new Map();
    const items = [];
    for (const li of document.querySelectorAll('li')) {
      if (li.closest('#' + PANEL_ID)) continue;
      const link = li.querySelector('a[href]');
      if (!link) continue;
      if (APC.findPrices(li.textContent).length < 2) continue;
      const change = APC.parseChange(lineText(li));
      if (!change) continue;
      if (!change.keyword && !li.closest(ALERTISH)) continue;
      const name = squash(link.textContent);
      if (!name) continue;
      const asin = APC.asinFrom(link.href);
      const key = asin || link.href;
      const dedupe = key + '|' + change.oldPrice + '|' + change.newPrice;
      const existing = byKey.get(dedupe);
      if (existing) {
        existing.nodes.push(li);
        continue;
      }
      const ul = li.closest('ul, ol') || li.parentElement;
      const item = APC.enrich(
        Object.assign(
          { name, href: link.href, asin, key, li, ul, nodes: [li], group: APC.groupKind(groupHeading(ul)), image: findImage(asin) },
          change
        )
      );
      byKey.set(dedupe, item);
      items.push(item);
    }
    return items;
  }

  function scanListItems() {
    const out = [];
    const seen = new Set();
    for (const node of document.querySelectorAll('[data-asin]')) {
      if (node.closest('#' + PANEL_ID)) continue;
      if (!node.matches('.sc-list-item') && !node.closest(LIST_SCOPE)) continue;
      const asin = (node.getAttribute('data-asin') || '').toUpperCase();
      if (!/^[A-Z0-9]{10}$/.test(asin) || seen.has(asin)) continue;
      if (node.querySelector('[data-asin]')) continue;
      let price = APC.parseAmount(node.getAttribute('data-price') || '');
      let currency = pageMoney.currency;
      let placement = pageMoney.placement;
      if (!Number.isFinite(price) || price <= 0) {
        const priceNode = node.querySelector('.sc-product-price, .sc-price, .a-price .a-offscreen, .a-color-price');
        const found = priceNode ? APC.findPrices(priceNode.textContent) : [];
        if (!found.length) continue;
        price = found[0].amount;
        currency = found[0].currency;
        placement = found[0].placement;
      }
      const link = node.querySelector('a.sc-product-link, a.sc-product-title, a[href*="/dp/"], a[href*="/gp/product/"]');
      const titleNode = node.querySelector('.sc-product-title, .a-truncate-full, .sc-product-title-link, .sc-item-content-group .a-text-bold, [data-asin] h2, h2 a, h3 a');
      const img = node.querySelector('img');
      const known = history[asin];
      const name =
        squash(titleNode ? titleNode.textContent : '') ||
        squash(link ? link.textContent : '') ||
        squash(img ? img.getAttribute('alt') : '') ||
        (known && known.name) ||
        '';
      if (!name) continue;
      const saved = /saved/i.test(node.getAttribute('data-itemtype') || '') || node.closest('#sc-saved-cart, #sc-saved-cart-items, [data-name="Saved Items"]');
      out.push({
        key: asin,
        asin,
        name,
        href: link ? link.href : location.origin + '/dp/' + asin,
        image: imageSource(img),
        price,
        currency,
        placement,
        group: saved ? 'saved' : 'cart',
      });
      seen.add(asin);
    }
    if (!out.length) {
      for (const a of document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')) {
        if (a.closest('#' + PANEL_ID) || !a.closest(LIST_SCOPE)) continue;
        const asin = APC.asinFrom(a.href);
        if (!asin || seen.has(asin)) continue;
        const box = a.closest('.sc-list-item, [class*="list-item"], [class*="item-container"], li') || a.parentElement;
        if (!box || box.textContent.length > 2500) continue;
        const priceNode = box.querySelector('.sc-product-price, .sc-price, .a-price .a-offscreen, .a-color-price');
        const found = APC.findPrices(priceNode ? priceNode.textContent : box.textContent);
        if (!found.length) continue;
        const img = box.querySelector('img');
        const titleNode = box.querySelector('.sc-product-title, .a-truncate-full, .sc-product-title-link');
        const known = history[asin];
        const name = squash(titleNode ? titleNode.textContent : '') || squash(a.textContent) || squash(img ? img.getAttribute('alt') : '') || (known && known.name) || '';
        if (!name) continue;
        out.push({
          key: asin,
          asin,
          name,
          href: a.href,
          image: imageSource(img),
          price: found[0].amount,
          currency: found[0].currency,
          placement: found[0].placement,
          group: box.closest('#sc-saved-cart, #sc-saved-cart-items, [data-name="Saved Items"]') ? 'saved' : 'cart',
        });
        seen.add(asin);
      }
    }
    return out;
  }

  function anchorFor(live) {
    const parsed = new Set(live.flatMap((i) => i.nodes));
    const ownText = live.reduce((n, i) => n + i.nodes.reduce((m, li) => m + li.textContent.length, 0), 0);
    let node = live[0].li.parentElement;
    let best = null;
    let whole = false;
    while (node && node !== document.body) {
      if (node.matches(ALERTISH)) {
        const lis = Array.from(node.querySelectorAll('li'));
        const clean = lis.length > 0 && lis.every((li) => parsed.has(li)) && node.textContent.length <= ownText * 2 + 600;
        if (clean) {
          best = node;
          whole = true;
        } else {
          if (!best) best = node;
          break;
        }
      }
      node = node.parentElement;
    }
    return { node: best || live[0].ul, whole, after: false };
  }

  function fallbackAnchor() {
    const before = ['#sc-active-cart', '#activeCartViewForm', '#sc-cart-above-actions', '.sc-list-body', 'div[data-name="Active Items"]', '#sc-saved-cart'];
    for (const sel of before) {
      const node = document.querySelector(sel);
      if (node) return { node, whole: false, after: false };
    }
    const h1 = document.querySelector('#a-page h1, main h1, h1');
    if (h1) return { node: h1, whole: false, after: true };
    const main = document.querySelector('#a-page, main') || document.body;
    return { node: main.firstElementChild || main, whole: false, after: false };
  }

  function hideOriginals(live, anchor) {
    const parsed = new Set(live.flatMap((i) => i.nodes));
    const targets = [];
    if (anchor.node && anchor.whole) {
      targets.push(anchor.node);
    } else {
      for (const ul of new Set(live.map((i) => i.ul))) {
        const own = Array.from(ul.querySelectorAll(':scope > li'));
        if (own.length && own.every((li) => parsed.has(li))) targets.push(ul);
        else own.filter((li) => parsed.has(li)).forEach((li) => targets.push(li));
      }
    }
    for (const node of targets) state.hidden.push({ node, display: node.style.display });
    setOriginalVisible(prefs.showOriginal);
  }

  function setOriginalVisible(show) {
    for (const h of state.hidden) h.node.style.display = show ? h.display : 'none';
    if (state.ui.toggleBtn) state.ui.toggleBtn.textContent = show ? T.hideOriginal : T.showOriginal;
  }

  function restoreOriginals() {
    for (const h of state.hidden) h.node.style.display = h.display;
    state.hidden = [];
  }

  function thumb(item, cls) {
    const empty = () => el('span', { class: cls + ' apc-thumb-empty', 'aria-hidden': 'true' });
    if (item.image) return el('img', { class: cls, src: item.image, alt: '', loading: 'lazy', decoding: 'async' });
    const asin = /^[A-Z0-9]{10}$/.test(item.key) ? item.key : null;
    if (!asin || location.protocol === 'file:') return empty();
    const img = el('img', { class: cls, src: asinImageURL(asin), alt: '', loading: 'lazy', decoding: 'async' });
    const fail = () => {
      if (img.isConnected) img.replaceWith(empty());
    };
    img.addEventListener('error', fail);
    img.addEventListener('load', () => {
      if (img.naturalWidth <= 1) fail();
    });
    return img;
  }

  function chip(text, cls, title) {
    return el('span', { class: 'apc-chip ' + (cls || ''), title: title || null }, text);
  }

  function statTile(key, label, value, sub, extra) {
    const active = prefs.filter === key;
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-stat ' + key + (active ? ' active' : ''),
        'data-filter': key,
        'aria-pressed': active ? 'true' : 'false',
        onclick: () => {
          prefs.filter = key;
          savePrefs();
          refreshRows();
        },
      },
      el('div', { class: 'apc-stat-label' }, label),
      el('div', { class: 'apc-stat-value' }, value),
      sub ? el('div', { class: 'apc-stat-sub' }, sub) : null,
      extra || null
    );
  }

  function spreadBar(s) {
    const total = s.downCount + s.upCount;
    if (!total) return null;
    const down = (s.downCount / total) * 100;
    return el(
      'div',
      { class: 'apc-spread', title: T.drops + ' ' + s.downCount + ' · ' + T.increases + ' ' + s.upCount, 'aria-hidden': 'true' },
      s.downCount ? el('i', { class: 'down', style: 'width:' + down.toFixed(1) + '%' }) : null,
      s.upCount ? el('i', { class: 'up', style: 'width:' + (100 - down).toFixed(1) + '%' }) : null
    );
  }

  function highlight(label, item, cls) {
    if (!item) {
      return el('div', { class: 'apc-hl empty' }, el('div', { class: 'apc-hl-body' }, el('div', { class: 'apc-stat-label' }, label), el('div', { class: 'apc-stat-value' }, T.none)));
    }
    return el(
      'button',
      { type: 'button', class: 'apc-hl ' + cls, title: item.name, onclick: () => jumpTo(item.key) },
      thumb(item, 'apc-hl-thumb'),
      el(
        'div',
        { class: 'apc-hl-body' },
        el('div', { class: 'apc-stat-label' }, label),
        el('div', { class: 'apc-stat-value ' + cls }, APC.formatPct(item.pct, locale, true)),
        el('div', { class: 'apc-stat-sub' }, item.name)
      )
    );
  }

  function periodLabel() {
    return T['win' + prefs.window.charAt(0).toUpperCase() + prefs.window.slice(1)] || prefs.window;
  }

  function tiles(s, ref) {
    return el(
      'div',
      { class: 'apc-kpis' },
      statTile('all', periodLabel(), T.items(s.total), T.net + ' ' + money(s.net, ref, true), spreadBar(s)),
      statTile('down', T.dropped, T.items(s.downCount), s.downCount ? money(s.downSum, ref, true) + ' ' + T.combined : T.none),
      statTile('up', T.increased, T.items(s.upCount), s.upCount ? money(s.upSum, ref, true) + ' ' + T.combined : T.none),
      highlight(T.biggestDrop, s.biggestDown, 'down'),
      highlight(T.biggestIncrease, s.biggestUp, 'up')
    );
  }

  const SORT_OPTIONS = [
    ['pct:asc', 'sortDropFirst'],
    ['pct:desc', 'sortRiseFirst'],
    ['changedAt:desc', 'sortNewest'],
    ['delta:asc', 'sortSaving'],
    ['newPrice:desc', 'sortPriceHigh'],
    ['newPrice:asc', 'sortPriceLow'],
    ['name:asc', 'sortName'],
  ];

  function sortSelect() {
    return el(
      'select',
      {
        class: 'apc-select',
        'aria-label': T.sort,
        onchange: (e) => {
          const [key, dir] = e.target.value.split(':');
          prefs.sort = key;
          prefs.dir = dir;
          savePrefs();
          refreshRows();
        },
      },
      SORT_OPTIONS.map(([value, label]) => el('option', { value }, T[label]))
    );
  }

  function sparklineSVG(entry, dir, width, height) {
    const values = entry.points.map((p) => p.p);
    const W = width || 150;
    const H = height || 40;
    const { d, points } = APC.sparkline(values, W, H, 5);
    const root = svg('svg', { class: 'apc-spark', width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true' });
    if (!d) return root;
    root.append(svg('path', { d, fill: 'none', stroke: '#898781', 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    for (const pt of points.slice(0, -1)) root.append(svg('circle', { cx: pt.x, cy: pt.y, r: 2.5, fill: '#c3c2b7' }));
    const last = points[points.length - 1];
    root.append(svg('circle', { cx: last.x, cy: last.y, r: 4, fill: dir === 'up' ? '#d03b3b' : dir === 'down' ? '#0ca30c' : '#898781', stroke: '#ffffff', 'stroke-width': 2 }));
    return root;
  }

  function pointsList(entry, item) {
    const pts = entry.points.slice(-8);
    const nodes = [];
    pts.forEach((pt, i) => {
      if (i) nodes.push(el('span', { class: 'apc-pt-arrow', 'aria-hidden': 'true' }, '→'));
      nodes.push(
        el(
          'span',
          { class: 'apc-pt' + (i === pts.length - 1 ? ' current' : '') },
          el('span', { class: 'apc-pt-t' }, formatDate(pt.t)),
          el('span', { class: 'apc-pt-p' }, money(pt.p, item))
        )
      );
    });
    return el('div', { class: 'apc-points' }, nodes);
  }

  function forgetItem(key) {
    delete history[key];
    store.set(HISTORY_KEY, history);
    state.expanded.delete(key);
    teardown();
    run();
  }

  function clearHistory() {
    history = {};
    store.remove(HISTORY_KEY);
    store.remove(SEEN_KEY);
    state.expanded.clear();
    teardown();
    run();
  }

  function detailsRow(item) {
    const entry = item.hist;
    const dir = item.direction;
    const href = productHref(item);
    const meta = el(
      'div',
      { class: 'apc-detail-meta' },
      el('span', { class: 'apc-detail-was' }, T.was + ' ' + money(item.oldPrice, item)),
      el('span', { class: 'apc-pt-arrow', 'aria-hidden': 'true' }, '→'),
      el('span', { class: 'apc-detail-now' }, T.now + ' ' + money(item.newPrice, item)),
      el('span', { class: 'apc-detail-delta ' + dir }, (dir === 'up' ? '▲ ' : dir === 'down' ? '▼ ' : '') + money(item.delta, item, true) + ' (' + APC.formatPct(item.pct, locale, true) + ')'),
      el('span', { class: 'apc-detail-when' }, '· ' + formatDate(item.changedAt))
    );
    const historyBlock = entry
      ? el(
          'div',
          { class: 'apc-detail-history' },
          el('div', { class: 'apc-detail-label' }, T.history, el('span', { class: 'apc-detail-count' }, T.seen(entry.points.length))),
          el('div', { class: 'apc-detail-history-row' }, sparklineSVG(entry, dir), pointsList(entry, item))
        )
      : null;
    const actions = el(
      'div',
      { class: 'apc-detail-actions' },
      href ? el('a', { class: 'apc-btn', href }, T.open + ' ↗') : null,
      item.live ? null : el('button', { type: 'button', class: 'apc-linkbtn apc-forget', onclick: () => forgetItem(item.key) }, T.forget)
    );
    const title = href ? el('a', { class: 'apc-detail-title', href }, item.name) : el('span', { class: 'apc-detail-title' }, item.name);
    return el(
      'tr',
      { class: 'apc-details', 'data-key': item.key },
      el('td', { colspan: '8' }, el('div', { class: 'apc-detail' }, thumb(item, 'apc-detail-img'), el('div', { class: 'apc-detail-main' }, title, meta, historyBlock), actions))
    );
  }

  function toggleExpand(key) {
    if (state.expanded.has(key)) state.expanded.delete(key);
    else state.expanded.add(key);
    refreshRows();
  }

  function row(item, s) {
    const dir = item.direction;
    const expanded = state.expanded.has(item.key);
    const share = s.maxAbsPct > 0 ? (Math.abs(item.pct || 0) / s.maxAbsPct) * 50 : 0;
    const pctText = APC.formatPct(item.pct, locale, true);
    const href = productHref(item);
    const chips = [];
    if (item.lowest) chips.push(chip(T.lowest, 'lowest'));
    if (state.showTags && item.group) chips.push(chip(T[item.group], 'group'));
    const nameNode = href
      ? el('a', { href, title: item.name }, item.name)
      : el('span', { class: 'apc-name-text', title: item.name }, item.name);
    const tr = el(
      'tr',
      {
        class: 'apc-row ' + dir + (expanded ? ' expanded' : '') + (item.isNew ? ' is-new' : '') + (item.live ? ' live' : ' remembered'),
        'data-key': item.key,
        onclick: (e) => {
          if (e.target.closest('a, button')) return;
          toggleExpand(item.key);
        },
      },
      el('td', { class: 'apc-thumb' }, thumb(item, 'apc-thumb-img')),
      el(
        'td',
        { class: 'apc-name' },
        el('div', { class: 'apc-name-wrap' }, item.isNew ? el('i', { class: 'apc-newdot', title: T.isNew }) : null, nameNode, chips)
      ),
      el('td', { class: 'apc-num apc-was' }, money(item.oldPrice, item)),
      el('td', { class: 'apc-num apc-now' }, money(item.newPrice, item)),
      el(
        'td',
        { class: 'apc-num apc-delta ' + dir },
        el('span', { class: 'apc-arrow', 'aria-hidden': 'true' }, dir === 'up' ? '▲' : dir === 'down' ? '▼' : '•'),
        ' ' + money(item.delta, item, true),
        el('span', { class: 'apc-pct' }, pctText)
      ),
      el(
        'td',
        { class: 'apc-bar', title: money(item.oldPrice, item) + ' → ' + money(item.newPrice, item) + ' (' + pctText + ')' },
        el('div', { class: 'apc-track' }, dir === 'same' ? null : el('i', { class: 'apc-fill ' + dir, style: 'width:' + share.toFixed(2) + '%' }))
      ),
      el('td', { class: 'apc-when' }, formatDate(item.changedAt)),
      el(
        'td',
        { class: 'apc-more' },
        el(
          'button',
          { type: 'button', class: 'apc-chevron', 'aria-expanded': expanded ? 'true' : 'false', 'aria-label': T.details, onclick: () => toggleExpand(item.key) },
          '›'
        )
      )
    );
    return expanded ? [tr, detailsRow(item)] : [tr];
  }

  function visibleItems() {
    let list = APC.filterItems(state.items, prefs.filter);
    const q = state.query.trim().toLocaleLowerCase(locale);
    if (q) list = list.filter((i) => i.name.toLocaleLowerCase(locale).includes(q));
    if (prefs.sort === 'changedAt') {
      list = list.slice().sort((a, b) => a.changedAt - b.changedAt);
      if (prefs.dir === 'desc') list.reverse();
      return list;
    }
    return APC.sortItems(list, prefs.sort, prefs.dir);
  }

  function emptyState() {
    const text = state.items.length ? T.empty : T.noChanges;
    const widen =
      !state.items.length && prefs.window !== 'all'
        ? el(
            'button',
            {
              type: 'button',
              class: 'apc-linkbtn',
              onclick: () => {
                prefs.window = 'all';
                savePrefs();
                build(state.live, Date.now(), false);
              },
            },
            T.showAll
          )
        : null;
    return el('div', { class: 'apc-empty-state' }, el('span', null, text), widen);
  }

  function cardDetails(item) {
    const entry = item.hist;
    return el(
      'div',
      { class: 'apc-card-details' },
      entry ? pointsList(entry, item) : null,
      item.live ? null : el('button', { type: 'button', class: 'apc-linkbtn apc-forget', onclick: () => forgetItem(item.key) }, T.forget)
    );
  }

  function card(item) {
    const dir = item.direction;
    const href = productHref(item);
    const entry = item.hist;
    const expanded = state.expanded.has(item.key);
    const pctText = APC.formatPct(item.pct, locale, true);
    const media = el(
      href ? 'a' : 'div',
      { class: 'apc-card-media', href: href || null, title: item.name },
      thumb(item, 'apc-card-img'),
      item.isNew ? el('i', { class: 'apc-newdot apc-card-new', title: T.isNew }) : null,
      item.lowest ? chip(T.lowest, 'lowest apc-card-ribbon') : null
    );
    const title = el(href ? 'a' : 'span', { class: 'apc-card-title', href: href || null, title: item.name }, item.name);
    const prices = el(
      'div',
      { class: 'apc-card-prices' },
      el('span', { class: 'apc-card-now' }, money(item.newPrice, item)),
      el('span', { class: 'apc-card-was' }, money(item.oldPrice, item))
    );
    const pill = el(
      'span',
      { class: 'apc-pill ' + dir },
      el('span', { class: 'apc-arrow', 'aria-hidden': 'true' }, dir === 'up' ? '▲' : '▼'),
      ' ' + money(item.delta, item, true),
      el('span', { class: 'apc-pill-pct' }, pctText)
    );
    const when = el('span', { class: 'apc-card-when' }, formatDate(item.changedAt));
    const more = el(
      'button',
      { type: 'button', class: 'apc-chevron apc-card-more', 'aria-expanded': expanded ? 'true' : 'false', 'aria-label': T.details, onclick: () => toggleExpand(item.key) },
      '›'
    );
    const meta = el(
      'div',
      { class: 'apc-card-meta' },
      entry ? el('span', { class: 'apc-card-spark', title: T.seen(entry.points.length) }, sparklineSVG(entry, dir, 110, 26)) : null,
      when,
      more
    );
    return el(
      'article',
      { class: 'apc-card ' + dir + (item.isNew ? ' is-new' : '') + (expanded ? ' expanded' : ''), 'data-key': item.key },
      media,
      el('div', { class: 'apc-card-body' }, title, prices, pill, meta),
      expanded ? cardDetails(item) : null
    );
  }

  function jumpTo(key) {
    const item = state.items.find((i) => i.key === key);
    if (!item) return;
    let changed = false;
    if (prefs.filter !== 'all' && item.direction !== prefs.filter) {
      prefs.filter = 'all';
      changed = true;
    }
    if (state.query) {
      state.query = '';
      if (state.ui.search) state.ui.search.value = '';
      changed = true;
    }
    if (prefs.collapsed) {
      setCollapsed(false);
      changed = true;
    }
    if (!state.expanded.has(key)) {
      state.expanded.add(key);
      changed = true;
    }
    if (changed) {
      savePrefs();
      refreshRows();
    }
    const node = state.ui.panel && state.ui.panel.querySelector('.apc-card[data-key="' + key + '"], .apc-row[data-key="' + key + '"]');
    if (!node) return;
    node.scrollIntoView({ block: 'center', behavior: 'smooth' });
    node.classList.add('flash');
    setTimeout(() => node.classList.remove('flash'), 1400);
  }

  function viewButton(key, label) {
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-segbtn' + (prefs.view === key ? ' active' : ''),
        'data-view': key,
        title: label,
        onclick: () => {
          if (prefs.view === key) return;
          prefs.view = key;
          savePrefs();
          refreshRows();
        },
      },
      label
    );
  }

  function diagnostics() {
    const probes = ['.sc-list-item', '[data-asin]', '[data-asin][data-price]', '[data-itemtype]', '#sc-active-cart', '#sc-saved-cart', '#activeCartViewForm', '.sc-list-body', '.a-alert', 'a[href*="/dp/"]', 'a[href*="/gp/product/"]', '.sc-product-price', '.a-price .a-offscreen', 'img.sc-product-image'];
    const lines = ['Amazon Cart Price Changes · diagnostics', 'url: ' + location.origin + location.pathname, 'lang: ' + lang, 'tracked: ' + state.tracked + ' · live: ' + state.live.length + ' · history: ' + Object.keys(history).length + ' · shown: ' + state.items.length];
    for (const p of probes) lines.push(p + ': ' + document.querySelectorAll(p).length);
    const sample = document.querySelector('.sc-list-item, [data-asin][data-price], #sc-saved-cart [data-asin], #sc-active-cart [data-asin]');
    if (sample) lines.push('', 'sample list item:', sample.outerHTML.replace(/\s+/g, ' ').slice(0, 5000));
    const link = Array.from(document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]')).find((a) => !a.closest('#' + PANEL_ID));
    if (link && (!sample || !sample.contains(link))) {
      const box = link.closest('li, [class*="item"], .a-row') || link.parentElement;
      lines.push('', 'sample product link context:', (box ? box.outerHTML : link.outerHTML).replace(/\s+/g, ' ').slice(0, 3000));
    }
    return lines.join('\n');
  }

  function refreshRows() {
    const ui = state.ui;
    if (!ui.tbody || !ui.grid) return;
    const visible = visibleItems();
    const cards = prefs.view === 'cards';
    ui.panel.classList.toggle('view-cards', cards);
    ui.panel.classList.toggle('view-list', !cards);
    if (ui.viewSeg) for (const b of ui.viewSeg.querySelectorAll('button')) b.classList.toggle('active', b.dataset.view === prefs.view);
    if (cards) {
      ui.grid.replaceChildren(...(visible.length ? visible.map(card) : [emptyState()]));
      ui.tbody.replaceChildren();
    } else {
      ui.grid.replaceChildren();
      const rows = visible.length ? visible.flatMap((i) => row(i, state.summary)) : [el('tr', { class: 'apc-empty' }, el('td', { colspan: '8' }, emptyState()))];
      ui.tbody.replaceChildren(...rows);
    }
    if (ui.panel) {
      for (const b of ui.panel.querySelectorAll('.apc-stat')) {
        const active = b.dataset.filter === prefs.filter;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      }
    }
    if (ui.sortSelect) {
      const value = prefs.sort + ':' + prefs.dir;
      ui.sortSelect.value = SORT_OPTIONS.some(([v]) => v === value) ? value : '';
    }
    for (const b of ui.sortButtons || []) {
      const active = b.dataset.sort === prefs.sort;
      b.classList.toggle('active', active);
      b.querySelector('.apc-sortmark').textContent = active ? (prefs.dir === 'asc' ? '↑' : '↓') : '';
    }
  }

  function sortButton(key, label, cls) {
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-th ' + (cls || ''),
        'data-sort': key,
        onclick: () => {
          if (prefs.sort === key) prefs.dir = prefs.dir === 'asc' ? 'desc' : 'asc';
          else {
            prefs.sort = key;
            prefs.dir = key === 'changedAt' ? 'desc' : APC.defaultSortDir(key);
          }
          savePrefs();
          refreshRows();
        },
      },
      label,
      el('span', { class: 'apc-sortmark', 'aria-hidden': 'true' })
    );
  }

  function setCollapsed(collapsed) {
    prefs.collapsed = collapsed;
    savePrefs();
    const ui = state.ui;
    if (ui.panel) ui.panel.classList.toggle('collapsed', collapsed);
    if (ui.collapseBtn) {
      ui.collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      ui.collapseBtn.setAttribute('aria-label', collapsed ? T.expand : T.collapse);
      ui.collapseBtn.title = collapsed ? T.expand : T.collapse;
    }
  }

  function winButton(key) {
    const label = T['win' + key.charAt(0).toUpperCase() + key.slice(1)] || key;
    return el(
      'button',
      {
        type: 'button',
        class: 'apc-segbtn' + (prefs.window === key ? ' active' : ''),
        'data-window': key,
        onclick: () => {
          if (prefs.window === key) return;
          prefs.window = key;
          savePrefs();
          build(state.live, Date.now(), false);
        },
      },
      label
    );
  }

  function render(items, s) {
    const ui = state.ui;
    const ref = items[0] || pageMoney;
    const groups = new Set(items.map((i) => i.group).filter(Boolean));
    state.showTags = groups.size > 1;
    const newCount = items.filter((i) => i.isNew).length;

    ui.collapseBtn = el('button', { type: 'button', class: 'apc-chevron apc-collapse', onclick: () => setCollapsed(!prefs.collapsed) }, '›');

    ui.win = el('div', { class: 'apc-seg apc-win', role: 'group' }, WINDOWS.map(winButton));
    ui.viewSeg = el('div', { class: 'apc-seg apc-viewseg', role: 'group' }, viewButton('cards', '▦ ' + T.cards), viewButton('list', '☰ ' + T.list));

    ui.sortSelect = sortSelect();

    ui.search =
      items.length > 5
        ? el('input', {
            type: 'search',
            class: 'apc-search',
            placeholder: T.search,
            'aria-label': T.search,
            oninput: (e) => {
              state.query = e.target.value;
              refreshRows();
            },
          })
        : null;

    const subtitleParts = [];
    if (state.tracked) subtitleParts.push(T.tracking(state.tracked));
    if (!state.live.length && items.length) subtitleParts.push(T.remembered);
    if (newCount) subtitleParts.push(T.newSince(newCount, formatDate(prevSeen && prevSeen.t)));
    const subtitle = subtitleParts.length
      ? el('div', { class: 'apc-subtitle' }, newCount ? el('i', { class: 'apc-newdot', 'aria-hidden': 'true' }) : null, subtitleParts.join(' · '))
      : null;

    ui.sortButtons = [
      sortButton('name', T.product),
      sortButton('oldPrice', T.was, 'num'),
      sortButton('newPrice', T.now, 'num'),
      sortButton('delta', T.change, 'num'),
      sortButton('pct', '%', 'pct'),
      sortButton('changedAt', T.when),
    ];

    ui.grid = el('div', { class: 'apc-grid' });
    ui.tbody = el('tbody');
    ui.table = el(
      'table',
      { class: 'apc-table animate' },
      el(
        'thead',
        null,
        el(
          'tr',
          null,
          el('th', { class: 'apc-thumb' }),
          el('th', { class: 'apc-name' }, ui.sortButtons[0]),
          el('th', { class: 'apc-num' }, ui.sortButtons[1]),
          el('th', { class: 'apc-num' }, ui.sortButtons[2]),
          el('th', { class: 'apc-num' }, ui.sortButtons[3]),
          el('th', { class: 'apc-bar' }, el('span', { class: 'apc-axis' }, ui.sortButtons[4])),
          el('th', { class: 'apc-when' }, ui.sortButtons[5]),
          el('th', { class: 'apc-more' })
        )
      ),
      ui.tbody
    );
    setTimeout(() => ui.table && ui.table.classList.remove('animate'), 800);

    const copyBtn = el(
      'button',
      {
        type: 'button',
        class: 'apc-linkbtn',
        onclick: () => {
          const csv = APC.toCSV(visibleItems());
          const done = () => {
            copyBtn.textContent = T.copied;
            setTimeout(() => (copyBtn.textContent = T.copy), 1500);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(csv).then(done, done);
        },
      },
      T.copy
    );

    ui.toggleBtn = state.live.length
      ? el(
          'button',
          {
            type: 'button',
            class: 'apc-linkbtn',
            onclick: () => {
              prefs.showOriginal = !prefs.showOriginal;
              savePrefs();
              setOriginalVisible(prefs.showOriginal);
            },
          },
          prefs.showOriginal ? T.hideOriginal : T.showOriginal
        )
      : null;

    let clearArmed = null;
    const clearBtn = el(
      'button',
      {
        type: 'button',
        class: 'apc-linkbtn apc-clear',
        onclick: () => {
          if (clearArmed) {
            clearTimeout(clearArmed);
            clearHistory();
            return;
          }
          clearBtn.textContent = T.clearConfirm;
          clearArmed = setTimeout(() => {
            clearArmed = null;
            clearBtn.textContent = T.clear;
          }, 3000);
        },
      },
      T.clear
    );

    const diagBtn = el(
      'button',
      {
        type: 'button',
        class: 'apc-linkbtn apc-diag',
        onclick: () => {
          const done = () => {
            diagBtn.textContent = T.diagDone;
            setTimeout(() => (diagBtn.textContent = T.diag), 1500);
          };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(diagnostics()).then(done, done);
        },
      },
      T.diag
    );

    const netDir = s.net > 0 ? 'up' : s.net < 0 ? 'down' : 'same';
    const footParts = [copyBtn];
    if (ui.toggleBtn) footParts.push(el('span', { class: 'apc-sep' }, '·'), ui.toggleBtn);
    footParts.push(el('span', { class: 'apc-sep' }, '·'), clearBtn, el('span', { class: 'apc-sep' }, '·'), diagBtn);

    ui.panel = el(
      'section',
      { id: PANEL_ID, class: 'apc', lang: locale },
      el(
        'header',
        { class: 'apc-head' },
        el(
          'div',
          { class: 'apc-title-wrap' },
          ui.collapseBtn,
          el('div', null, el('div', { class: 'apc-title' }, T.title, el('span', { class: 'apc-badge' }, s.total)), subtitle)
        ),
        el('div', { class: 'apc-controls' }, ui.search, ui.viewSeg)
      ),
      tiles(s, ref),
      el(
        'div',
        { class: 'apc-toolbar' },
        el('div', { class: 'apc-toolbar-left' }, el('span', { class: 'apc-toolbar-label' }, T.period), ui.win),
        el('label', { class: 'apc-sort' }, T.sort, ui.sortSelect)
      ),
      ui.grid,
      ui.table,
      el(
        'footer',
        { class: 'apc-foot' },
        el('span', { class: 'apc-legend' }, el('i', { class: 'apc-dot down' }), T.drops, el('i', { class: 'apc-dot up' }), T.increases),
        el('span', { class: 'apc-net' }, T.net + ' ', el('b', { class: netDir }, money(s.net, ref, true))),
        el('span', { class: 'apc-spacer' }),
        footParts
      )
    );
    setCollapsed(!!prefs.collapsed);
    refreshRows();
    return ui.panel;
  }

  function teardown() {
    const existing = document.getElementById(PANEL_ID);
    if (existing) existing.remove();
    restoreOriginals();
    state.items = [];
    state.live = [];
    state.summary = null;
    state.signature = '';
    state.anchor = { node: null, whole: false, after: false };
    state.ui = {};
  }

  function fresh(existing, items, signature) {
    if (!existing || !existing.isConnected) return false;
    if (signature !== state.signature) return false;
    if (state.anchor.node && !state.anchor.node.isConnected) return false;
    return items.every((i) => i.nodes.every((n) => n.isConnected));
  }

  function scan() {
    const now = Date.now();
    const live = collect();
    const observed = CART_RE.test(location.pathname) ? scanListItems() : [];
    let dirty = false;
    for (const item of live) {
      APC.recordHistory(history, item, now);
      dirty = true;
    }
    for (const obs of observed) {
      APC.recordObservation(history, obs, now);
      dirty = true;
    }
    return { live, observed, now, dirty };
  }

  function run() {
    const onCart = CART_RE.test(location.pathname);
    const { live, observed, now, dirty } = scan();
    state.tracked = observed.length;
    if (!live.length && !onCart) {
      if (state.signature) teardown();
      return;
    }
    build(live, now, dirty);
  }

  function build(live, now, dirty) {
    const liveByKey = new Map(live.map((i) => [i.key, i]));
    const start = APC.windowStart(prefs.window, now);
    const items = APC.itemsFromHistory(history, now, start, pageMoney).map((base) => {
      const l = liveByKey.get(base.key);
      const entry = history[base.key];
      const stored = isGoodImageURL(base.image) ? base.image : null;
      const image = (l && l.image) || stored || findImage(/^[A-Z0-9]{10}$/.test(base.key) ? base.key : null) || null;
      if (entry && entry.image !== image && (image || entry.image)) {
        if (image) entry.image = image;
        else delete entry.image;
        dirty = true;
      }
      return Object.assign(base, {
        live: !!l,
        li: l ? l.li : null,
        ul: l ? l.ul : null,
        nodes: l ? l.nodes : [],
        image,
        hist: entry,
        lowest: APC.lowestSeen(entry, base.newPrice),
        isNew: !!(prevSeen && prevSeen.t && base.changedAt > prevSeen.t),
      });
    });
    if (dirty) store.set(HISTORY_KEY, history);
    const signature = [prefs.window, state.tracked]
      .concat(items.map((i) => [i.key, i.oldPrice, i.newPrice, i.changedAt, i.image || '', i.live ? 1 : 0].join('|')))
      .join('\n');
    if (fresh(document.getElementById(PANEL_ID), items, signature)) return;
    teardown();
    if (!items.length && !live.length && !Object.keys(history).length) return;
    store.set(SEEN_KEY, { t: now, keys: items.map((i) => i.key) });
    state.items = items;
    state.live = live;
    state.summary = APC.summarize(items);
    state.signature = signature;
    state.anchor = live.length ? anchorFor(live) : fallbackAnchor();
    const target = state.anchor.node;
    if (!target || !target.parentNode) return;
    const panel = render(items, state.summary);
    if (state.anchor.after) target.insertAdjacentElement('afterend', panel);
    else target.parentNode.insertBefore(panel, target);
    if (live.length) hideOriginals(live, state.anchor);
  }

  let timer = null;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(run, 400);
  }

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      const t = m.target;
      if (t && t.nodeType === 1 && t.closest('#' + PANEL_ID)) continue;
      schedule();
      return;
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'srcset', 'data-src', 'data-a-dynamic-image'] });
  run();
})();
