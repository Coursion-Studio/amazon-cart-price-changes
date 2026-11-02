const api = typeof browser !== 'undefined' && browser.runtime ? browser : chrome;
if (typeof importScripts === 'function' && !globalThis.AmazonPriceChanges) importScripts('parse.js', 'scan.js');

const ALARM = 'apc-check';
const DAY = 86400000;
const PRODUCT_LIMIT = 8;
const ASIN_KEY = /^[A-Z0-9]{10}$/;
const DEFAULT_ALERTS = { enabled: false, thresholdPct: 10, intervalHours: 6, lastCheck: null, lastResult: '', badge: {}, notified: {} };

let running = null;
let alarmsBound = false;
let notificationsBound = false;

async function safe(fn, fallback) {
  try {
    return await fn();
  } catch (e) {
    return fallback;
  }
}

function withDefaults(alerts) {
  const a = Object.assign({}, DEFAULT_ALERTS, alerts || {});
  a.badge = Object.assign({}, a.badge || {});
  a.notified = Object.assign({}, a.notified || {});
  return a;
}

async function loadAlerts() {
  const got = await safe(() => api.storage.local.get('alerts'), {});
  return withDefaults(got && got.alerts);
}

async function saveAlerts(alerts) {
  await safe(() => api.storage.local.set({ alerts }));
  return alerts;
}

async function trackedHosts() {
  const all = await safe(() => api.storage.local.get(null), {});
  return Object.keys(all || {})
    .filter((k) => k.startsWith('history:'))
    .map((k) => k.slice(8))
    .filter(Boolean)
    .sort();
}

async function hasPermission(query, fallback) {
  if (!api.permissions || typeof api.permissions.contains !== 'function') return fallback;
  return safe(() => api.permissions.contains(query), false);
}

function hasAlarmsApi() {
  return !!(api.alarms && typeof api.alarms.create === 'function');
}

function hasNotificationsApi() {
  return !!(api.notifications && typeof api.notifications.create === 'function');
}

async function canAlarm() {
  return hasAlarmsApi() && (await hasPermission({ permissions: ['alarms'] }, true));
}

async function canNotify() {
  return hasNotificationsApi() && (await hasPermission({ permissions: ['notifications'] }, true));
}

function canHost(host) {
  return hasPermission({ origins: [`*://${host}/*`] }, true);
}

function actionApi() {
  return api.action || api.browserAction || null;
}

async function refreshBadge(alerts) {
  const action = actionApi();
  if (!action) return;
  const a = alerts || (await loadAlerts());
  const total = Object.values(a.badge || {}).reduce((sum, n) => sum + (Number(n) || 0), 0);
  if (typeof action.setBadgeBackgroundColor === 'function') await safe(() => action.setBadgeBackgroundColor({ color: '#0ca30c' }));
  if (typeof action.setBadgeText === 'function') await safe(() => action.setBadgeText({ text: total > 0 ? String(total) : '' }));
}

function bindListeners() {
  if (!alarmsBound && api.alarms && api.alarms.onAlarm) {
    alarmsBound = true;
    api.alarms.onAlarm.addListener((alarm) => {
      if (alarm && alarm.name === ALARM) checkAll().catch(() => {});
    });
  }
  if (!notificationsBound && api.notifications && api.notifications.onClicked) {
    notificationsBound = true;
    api.notifications.onClicked.addListener((id) => {
      openFromNotification(id).catch(() => {});
    });
  }
}

async function ensureAlarm() {
  bindListeners();
  if (!hasAlarmsApi()) return;
  const alerts = await loadAlerts();
  if (alerts.enabled && (await canAlarm())) {
    const hours = Math.max(1, Number(alerts.intervalHours) || DEFAULT_ALERTS.intervalHours);
    await safe(() => api.alarms.create(ALARM, { periodInMinutes: hours * 60, delayInMinutes: 1 }));
  } else if (typeof api.alarms.clear === 'function') {
    await safe(() => api.alarms.clear(ALARM));
  }
}

function absoluteHref(host, href, asin) {
  const h = href || (asin ? `/dp/${asin}` : '');
  if (!h) return `https://${host}/`;
  if (/^https?:\/\//.test(h)) return h;
  return `https://${host}${h.startsWith('/') ? '' : '/'}${h}`;
}

async function openFromNotification(id) {
  const parts = String(id || '').split(':');
  if (parts[0] !== 'apc' || parts.length < 3) return;
  const host = parts[1];
  const asin = parts[2];
  const key = `history:${host}`;
  const got = await safe(() => api.storage.local.get(key), {});
  const entry = got && got[key] && got[key][asin];
  const url = absoluteHref(host, entry && entry.href, asin);
  if (api.tabs && typeof api.tabs.create === 'function') await safe(() => api.tabs.create({ url }));
  if (api.notifications && typeof api.notifications.clear === 'function') await safe(() => api.notifications.clear(id));
}

async function fetchHTML(url) {
  const res = await fetch(url, { credentials: 'include', redirect: 'follow', headers: { Accept: 'text/html' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function truncate(text, max) {
  const s = String(text || '');
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

function lastPrice(entry) {
  const pts = entry && Array.isArray(entry.points) ? entry.points : [];
  return pts.length ? pts[pts.length - 1].p : null;
}

async function collectHost(host, history) {
  const lib = globalThis.AmazonPriceChanges;
  const scan = globalThis.AmazonScan;
  const fallback = lib.currencyForHost(host);
  const observations = [];
  let errors = 0;
  const inCart = new Set();
  try {
    const html = await fetchHTML(`https://${host}/gp/cart/view.html?ref_=nav_cart`);
    const items = scan.cartItemsFromHTML(html);
    if (!items.length && !/id="sc-active-cart"|sc-your-amazon-cart-is-empty|sc-empty-cart/.test(html)) errors++;
    for (const item of items) {
      inCart.add(item.asin);
      observations.push({
        asin: item.asin,
        name: item.name,
        price: item.price,
        currency: item.currency || fallback.currency,
        placement: item.currency ? item.placement : fallback.placement,
        group: item.group,
        href: absoluteHref(host, item.href, item.asin),
        image: item.image || undefined,
        product: false,
      });
    }
  } catch (e) {
    errors++;
  }
  const others = Object.keys(history)
    .filter((k) => ASIN_KEY.test(k) && !inCart.has(k) && history[k])
    .sort((a, b) => (history[a].checkedAt || 0) - (history[b].checkedAt || 0))
    .slice(0, PRODUCT_LIMIT);
  for (const asin of others) {
    try {
      const html = await fetchHTML(`https://${host}/dp/${asin}`);
      const price = scan.priceFromProductHTML(html);
      if (!price) {
        errors++;
        observations.push({ asin, checkedOnly: true });
        continue;
      }
      const info = scan.productFromHTML(html);
      const entry = history[asin];
      observations.push({
        asin,
        name: entry.name ? undefined : info.name || undefined,
        image: entry.image ? undefined : info.image || undefined,
        price: price.amount,
        currency: price.currency || fallback.currency,
        placement: price.currency ? price.placement : fallback.placement,
        product: true,
      });
    } catch (e) {
      errors++;
      observations.push({ asin, checkedOnly: true });
    }
  }
  return { observations, errors, reached: observations.length > 0 };
}

function isDrop(oldPrice, newPrice, entry, thresholdPct) {
  if (!(oldPrice > 0) || !(newPrice > 0) || newPrice >= oldPrice) return false;
  const pct = ((oldPrice - newPrice) / oldPrice) * 100;
  if (pct >= thresholdPct) return true;
  const target = entry && Number(entry.target);
  return !!(target && newPrice <= target && oldPrice > target);
}

async function notifyDrop(host, asin, entry, oldPrice, newPrice) {
  const lib = globalThis.AmazonPriceChanges;
  const locale = (typeof navigator !== 'undefined' && navigator.language) || undefined;
  const currency = entry.currency || '';
  const placement = entry.placement || 'suffix';
  const pct = ((newPrice - oldPrice) / oldPrice) * 100;
  const message = `${lib.formatMoney(oldPrice, currency, placement, locale)} → ${lib.formatMoney(newPrice, currency, placement, locale)} (${lib.formatPct(pct, locale, true)})`;
  await safe(() =>
    api.notifications.create(`apc:${host}:${asin}`, {
      type: 'basic',
      iconUrl: api.runtime.getURL('icons/icon128.png'),
      title: truncate(entry.name || asin, 60),
      message,
    })
  );
}

async function runCheck() {
  const lib = globalThis.AmazonPriceChanges;
  const now = Date.now();
  const summary = { checked: 0, drops: 0, errors: 0, at: now };
  if (!lib || !globalThis.AmazonScan) {
    summary.errors = 1;
    return summary;
  }
  const hosts = await trackedHosts();
  const notify = await canNotify();
  const pending = [];
  for (const host of hosts) {
    if (!(await canHost(host))) continue;
    const key = `history:${host}`;
    const before = await safe(() => api.storage.local.get(key), {});
    const result = await collectHost(host, (before && before[key]) || {});
    summary.errors += result.errors;
    pending.push({ host, key, result });
  }
  const alerts = await loadAlerts();
  const threshold = Number(alerts.thresholdPct) || DEFAULT_ALERTS.thresholdPct;
  for (const [k, t] of Object.entries(alerts.notified)) if (!(now - t < 30 * DAY)) delete alerts.notified[k];
  for (const { host, key, result } of pending) {
    const got = await safe(() => api.storage.local.get(key), {});
    const history = (got && got[key]) || {};
    for (const obs of result.observations) {
      if (obs.checkedOnly) {
        if (history[obs.asin]) history[obs.asin].checkedAt = now;
        continue;
      }
      const old = lastPrice(history[obs.asin]);
      const entry = lib.recordObservation(history, obs, now);
      if (!entry) continue;
      summary.checked++;
      if (obs.product) entry.checkedAt = now;
      if (!isDrop(old, obs.price, entry, threshold)) continue;
      const mark = `${host}:${obs.asin}:${obs.price}`;
      if (alerts.notified[mark]) continue;
      alerts.notified[mark] = now;
      alerts.badge[host] = (Number(alerts.badge[host]) || 0) + 1;
      summary.drops++;
      if (notify) await notifyDrop(host, obs.asin, entry, old, obs.price);
    }
    await safe(() => api.storage.local.set({ [key]: history }));
  }
  alerts.lastCheck = now;
  alerts.lastResult = `${summary.checked} checked · ${summary.drops} drops${summary.errors ? ` · ${summary.errors} errors` : ''}`;
  await saveAlerts(alerts);
  await safe(() => refreshBadge(alerts));
  return summary;
}

function checkAll() {
  if (!running) {
    running = runCheck()
      .catch(() => ({ checked: 0, drops: 0, errors: 1, at: Date.now() }))
      .finally(() => {
        running = null;
      });
  }
  return running;
}

async function status() {
  const alerts = await loadAlerts();
  const hosts = await trackedHosts();
  const permitted = {
    alarms: await canAlarm(),
    notifications: await canNotify(),
    hosts: {},
  };
  for (const host of hosts) permitted.hosts[host] = await canHost(host);
  return { alerts, hosts, permitted };
}

async function handle(msg) {
  switch (msg && msg.type) {
    case 'visited': {
      const alerts = await loadAlerts();
      if (msg.host) alerts.badge[msg.host] = 0;
      await saveAlerts(alerts);
      await refreshBadge(alerts);
      return { ok: true };
    }
    case 'badge-seen': {
      const alerts = await loadAlerts();
      for (const host of Object.keys(alerts.badge)) alerts.badge[host] = 0;
      await saveAlerts(alerts);
      await refreshBadge(alerts);
      return { ok: true };
    }
    case 'get-status':
      return status();
    case 'set-alerts': {
      const alerts = await loadAlerts();
      const patch = Object.assign({}, msg.patch || {});
      delete patch.badge;
      delete patch.notified;
      const next = withDefaults(Object.assign(alerts, patch));
      await saveAlerts(next);
      await ensureAlarm();
      return next;
    }
    case 'check-now':
      return checkAll();
    default:
      return null;
  }
}

try {
  bindListeners();
  if (api.runtime && api.runtime.onMessage) {
    api.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      handle(msg)
        .then((res) => sendResponse(res))
        .catch(() => sendResponse(null));
      return true;
    });
  }
  if (api.runtime && api.runtime.onInstalled) {
    api.runtime.onInstalled.addListener(() => {
      ensureAlarm().catch(() => {});
      refreshBadge().catch(() => {});
    });
  }
  if (api.runtime && api.runtime.onStartup) {
    api.runtime.onStartup.addListener(() => {
      ensureAlarm().catch(() => {});
      refreshBadge().catch(() => {});
    });
  }
  if (api.permissions && api.permissions.onAdded) {
    api.permissions.onAdded.addListener(() => {
      ensureAlarm().catch(() => {});
    });
  }
} catch (e) {}
