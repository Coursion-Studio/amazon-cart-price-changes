(function () {
  'use strict';

  const api = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;
  const APC = globalThis.AmazonPriceChanges;
  const locale = navigator.language || 'en';
  const DAY = 86400000;

  const AMAZON_HOSTS = ['amazon.com.tr', 'amazon.com', 'amazon.co.uk', 'amazon.de', 'amazon.fr', 'amazon.it', 'amazon.es', 'amazon.nl', 'amazon.se', 'amazon.pl', 'amazon.com.be', 'amazon.ca', 'amazon.com.mx', 'amazon.com.br', 'amazon.com.au', 'amazon.co.jp', 'amazon.in', 'amazon.sg', 'amazon.ae', 'amazon.sa', 'amazon.eg'];
  const THRESHOLDS = [5, 10, 15, 20, 30];
  const INTERVALS = [3, 6, 12, 24];

  const STRINGS = {
    en: {
      title: 'Cart Price Changes',
      alertsOff: 'Alerts off',
      checking: 'Checking…',
      neverChecked: 'Alerts on · not checked yet',
      checkedAgo: (ago) => 'Checked ' + ago,
      newDrops: (n) => (n === 1 ? '1 new drop' : n + ' new drops'),
      justNow: 'just now',
      minAgo: (n) => n + ' min ago',
      hoursAgo: (n) => n + ' h ago',
      daysAgo: (n) => n + ' d ago',
      toggle: 'Alert me about price drops',
      threshold: 'Drop of at least',
      interval: 'Check every',
      hours: (n) => n + ' hours',
      checkNow: 'Check now',
      summary: (s) => s.checked + ' checked · ' + (s.drops === 1 ? '1 drop' : s.drops + ' drops') + (s.errors ? ' · ' + s.errors + ' not reached' : ''),
      failed: 'Check failed',
      denied: 'Permission not granted',
      noNotifications: 'This browser does not support notifications. Drops show up as a badge on the toolbar icon.',
      dropsTitle: 'Recent drops',
      empty: 'No drops yet. Open your Amazon cart so the extension can start tracking.',
      targetsTitle: 'Price targets',
      targetNow: (target, now) => 'target ' + target + ' · now ' + now,
      today: 'today',
      openCart: (host) => 'Open ' + host + ' cart',
    },
    tr: {
      title: 'Sepet Fiyat Değişiklikleri',
      alertsOff: 'Uyarılar kapalı',
      checking: 'Kontrol ediliyor…',
      neverChecked: 'Uyarılar açık · henüz kontrol edilmedi',
      checkedAgo: (ago) => ago + ' kontrol edildi',
      newDrops: (n) => n + ' yeni düşüş',
      justNow: 'az önce',
      minAgo: (n) => n + ' dk önce',
      hoursAgo: (n) => n + ' sa önce',
      daysAgo: (n) => n + ' gün önce',
      toggle: 'Fiyat düşünce bana haber ver',
      threshold: 'En az düşüş',
      interval: 'Kontrol sıklığı',
      hours: (n) => n + ' saatte bir',
      checkNow: 'Şimdi kontrol et',
      summary: (s) => s.checked + ' ürün kontrol edildi · ' + s.drops + ' düşüş' + (s.errors ? ' · ' + s.errors + ' erişilemedi' : ''),
      failed: 'Kontrol başarısız',
      denied: 'İzin verilmedi',
      noNotifications: 'Bu tarayıcı bildirimleri desteklemiyor. Düşüşler araç çubuğu simgesinde rozet olarak görünür.',
      dropsTitle: 'Son düşüşler',
      empty: 'Henüz düşüş yok. Takibin başlaması için Amazon sepetini aç.',
      targetsTitle: 'Fiyat hedefleri',
      targetNow: (target, now) => 'hedef ' + target + ' · şimdi ' + now,
      today: 'bugün',
      openCart: (host) => host + ' sepetini aç',
    },
  };
  const T = locale.toLowerCase().startsWith('tr') ? STRINGS.tr : STRINGS.en;

  const $ = (id) => document.getElementById(id);
  const state = { status: null, newDrops: 0, checking: false };

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else node.setAttribute(k, v === true ? '' : v);
    }
    for (const c of children.flat()) if (c != null && c !== false) node.append(c);
    return node;
  }

  function send(msg) {
    return Promise.resolve()
      .then(() => api.runtime.sendMessage(msg))
      .catch(() => null);
  }

  function isSafari() {
    const ua = navigator.userAgent || '';
    return /Safari\//.test(ua) && !/Chrome\/|Chromium\/|Edg\/|Firefox\//.test(ua);
  }

  function optionalPermissions() {
    try {
      const m = api.runtime.getManifest();
      return (m.optional_permissions || []).filter((p) => typeof p === 'string');
    } catch (e) {
      return [];
    }
  }

  function money(amount, entry, signed) {
    return APC.formatMoney(amount, entry.currency || '', entry.placement || 'suffix', locale, signed);
  }

  function ago(t) {
    const mins = Math.floor((Date.now() - t) / 60000);
    if (mins < 1) return T.justNow;
    if (mins < 60) return T.minAgo(mins);
    const hours = Math.floor(mins / 60);
    if (hours < 24) return T.hoursAgo(hours);
    return T.daysAgo(Math.floor(hours / 24));
  }

  function shortDate(t) {
    const d = new Date(t);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return T.today;
    try {
      return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    } catch (e) {
      return d.toDateString();
    }
  }

  function absoluteHref(host, href, asin) {
    const h = href || (asin ? '/dp/' + asin : '/');
    if (/^https?:\/\//.test(h)) return h;
    return 'https://' + host + (h.startsWith('/') ? '' : '/') + h;
  }

  function open(url) {
    Promise.resolve()
      .then(() => api.tabs.create({ url }))
      .catch(() => {})
      .then(() => window.close());
  }

  function renderStatus() {
    const s = state.status;
    const status = $('status');
    if (state.checking) {
      status.textContent = T.checking;
      return;
    }
    if (!s || !s.alerts.enabled) {
      status.textContent = T.alertsOff;
      return;
    }
    if (!s.alerts.lastCheck) {
      status.textContent = T.neverChecked;
      return;
    }
    const parts = [T.checkedAgo(ago(s.alerts.lastCheck))];
    if (state.newDrops > 0) parts.push(T.newDrops(state.newDrops));
    status.textContent = parts.join(' · ');
  }

  function renderControls() {
    const s = state.status;
    const alerts = (s && s.alerts) || { enabled: false, thresholdPct: 10, intervalHours: 6 };
    $('enabled').checked = !!alerts.enabled;
    $('threshold').value = String(alerts.thresholdPct);
    $('interval').value = String(alerts.intervalHours);
    $('check').disabled = state.checking;
  }

  function fillSelect(select, values, label) {
    select.textContent = '';
    for (const v of values) select.append(el('option', { value: String(v) }, label(v)));
  }

  function dropsFrom(all) {
    const now = Date.now();
    const out = [];
    for (const [key, history] of Object.entries(all || {})) {
      if (!key.startsWith('history:') || !history || typeof history !== 'object') continue;
      const host = key.slice(8);
      for (const [asin, entry] of Object.entries(history)) {
        const pts = entry && Array.isArray(entry.points) ? entry.points : [];
        if (pts.length < 2) continue;
        const last = pts[pts.length - 1];
        const prev = pts[pts.length - 2];
        if (!(last.p < prev.p)) continue;
        const t = last.t == null ? entry.seen : last.t;
        if (!t || now - t > 14 * DAY) continue;
        out.push({ host, asin, entry, now: last.p, before: prev.p, t });
      }
    }
    return out.sort((a, b) => b.t - a.t).slice(0, 12);
  }

  function targetsFrom(all) {
    const out = [];
    for (const [key, history] of Object.entries(all || {})) {
      if (!key.startsWith('history:') || !history || typeof history !== 'object') continue;
      for (const [asin, entry] of Object.entries(history)) {
        if (!entry || entry.target == null || !Array.isArray(entry.points) || !entry.points.length) continue;
        out.push({ asin, entry, now: entry.points[entry.points.length - 1].p });
      }
    }
    return out.sort((a, b) => a.now / a.entry.target - b.now / b.entry.target);
  }

  function renderDrops(all) {
    const list = $('drops');
    list.textContent = '';
    const drops = dropsFrom(all);
    if (!drops.length) {
      list.append(el('li', { class: 'empty' }, T.empty));
      return;
    }
    for (const d of drops) {
      const delta = d.now - d.before;
      const pct = (delta / d.before) * 100;
      const thumb = d.entry.image ? el('img', { class: 'thumb', src: d.entry.image, alt: '', loading: 'lazy' }) : el('div', { class: 'thumb' });
      const url = absoluteHref(d.host, d.entry.href, d.asin);
      const item = el(
        'li',
        { class: 'drop', tabindex: '0', role: 'link', title: d.entry.name || d.asin },
        thumb,
        el(
          'div',
          { class: 'drop-body' },
          el('div', { class: 'name' }, d.entry.name || d.asin),
          el(
            'div',
            { class: 'meta' },
            el('span', { class: 'price' }, money(d.now, d.entry)),
            el('span', { class: 'pill' }, '▼ ' + money(delta, d.entry, true) + ' (' + APC.formatPct(pct, locale, true) + ')'),
            el('span', { class: 'date' }, shortDate(d.t))
          )
        )
      );
      item.addEventListener('click', () => open(url));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(url);
        }
      });
      list.append(item);
    }
  }

  function renderTargets(all) {
    const targets = targetsFrom(all);
    $('targets-section').hidden = !targets.length;
    const list = $('targets');
    list.textContent = '';
    for (const t of targets) {
      const hit = t.now <= t.entry.target;
      list.append(
        el(
          'li',
          { class: 'target', title: t.entry.name || t.asin },
          el('span', { class: 'target-name' }, t.entry.name || t.asin),
          el('span', { class: 'target-values' + (hit ? ' hit' : '') }, T.targetNow(money(t.entry.target, t.entry), money(t.now, t.entry)))
        )
      );
    }
  }

  function renderFooter() {
    const carts = $('carts');
    carts.textContent = '';
    const hosts = (state.status && state.status.hosts) || [];
    for (const host of hosts) {
      const url = 'https://' + host + '/gp/cart/view.html';
      const link = el('a', { href: url }, T.openCart(host));
      link.addEventListener('click', (e) => {
        e.preventDefault();
        open(url);
      });
      carts.append(link);
    }
  }

  function origins() {
    const hosts = (state.status && state.status.hosts) || [];
    if (hosts.length) return hosts.map((h) => '*://' + h + '/*');
    return AMAZON_HOSTS.map((h) => '*://*.' + h + '/*');
  }

  async function setAlerts(patch) {
    const alerts = await send({ type: 'set-alerts', patch });
    if (alerts && state.status) state.status.alerts = alerts;
    renderControls();
    renderStatus();
  }

  function onToggle() {
    const input = $('enabled');
    if (!input.checked) {
      setAlerts({ enabled: false });
      return;
    }
    const wanted = ['alarms', 'notifications'].filter((p) => optionalPermissions().includes(p) && !(p === 'notifications' && isSafari()));
    let request;
    try {
      request = api.permissions && api.permissions.request ? api.permissions.request({ permissions: wanted, origins: origins() }) : Promise.resolve(true);
    } catch (e) {
      request = Promise.resolve(false);
    }
    Promise.resolve(request)
      .catch(() => false)
      .then((granted) => {
        if (granted) return setAlerts({ enabled: true }).then(load);
        input.checked = false;
        $('result').textContent = T.denied;
        return null;
      });
  }

  async function checkNow() {
    state.checking = true;
    renderControls();
    renderStatus();
    $('result').textContent = '';
    const summary = await send({ type: 'check-now' });
    state.checking = false;
    $('result').textContent = summary ? T.summary(summary) : T.failed;
    if (summary) state.newDrops += summary.drops || 0;
    await load();
    send({ type: 'badge-seen' });
  }

  async function load() {
    const status = await send({ type: 'get-status' });
    if (status) state.status = status;
    const all = await Promise.resolve()
      .then(() => api.storage.local.get(null))
      .catch(() => ({}));
    renderControls();
    renderStatus();
    renderDrops(all);
    renderTargets(all);
    renderFooter();
  }

  async function init() {
    document.documentElement.lang = T === STRINGS.tr ? 'tr' : 'en';
    $('title').textContent = T.title;
    $('toggle-label').textContent = T.toggle;
    $('threshold-label').textContent = T.threshold;
    $('interval-label').textContent = T.interval;
    $('check').textContent = T.checkNow;
    $('drops-title').textContent = T.dropsTitle;
    $('targets-title').textContent = T.targetsTitle;
    fillSelect($('threshold'), THRESHOLDS, (v) => v + '%');
    fillSelect($('interval'), INTERVALS, T.hours);
    if (isSafari()) {
      $('note').textContent = T.noNotifications;
      $('note').hidden = false;
    }
    $('enabled').addEventListener('change', onToggle);
    $('threshold').addEventListener('change', (e) => setAlerts({ thresholdPct: Number(e.target.value) }));
    $('interval').addEventListener('change', (e) => setAlerts({ intervalHours: Number(e.target.value) }));
    $('check').addEventListener('click', () => {
      if (!state.checking) checkNow();
    });
    renderStatus();
    await load();
    const badge = (state.status && state.status.alerts && state.status.alerts.badge) || {};
    state.newDrops = Object.values(badge).reduce((sum, n) => sum + (Number(n) || 0), 0);
    renderStatus();
    send({ type: 'badge-seen' });
  }

  init();
})();
