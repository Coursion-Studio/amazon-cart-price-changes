const test = require('node:test');
const assert = require('node:assert/strict');
const APC = require('../parse.js');

const TR_UP = ', arttırıldı 1.717,96 TL olan eski fiyatı 1.720,56 TL olarak değişti';
const TR_DOWN = ', azaltıldı 314,99 TL olan eski fiyatı 297,49 TL olarak değişti';

test('parseAmount handles Turkish, US and bare formats', () => {
  assert.equal(APC.parseAmount('1.717,96'), 1717.96);
  assert.equal(APC.parseAmount('1,717.96'), 1717.96);
  assert.equal(APC.parseAmount('50.499,00'), 50499);
  assert.equal(APC.parseAmount('966,45'), 966.45);
  assert.equal(APC.parseAmount('1.234'), 1234);
  assert.equal(APC.parseAmount('12,5'), 12.5);
  assert.equal(APC.parseAmount('1 234,56'), 1234.56);
  assert.equal(APC.parseAmount(''), null);
});

test('findPrices reads suffix and prefix currencies', () => {
  const tr = APC.findPrices(TR_UP);
  assert.equal(tr.length, 2);
  assert.deepEqual(tr.map((p) => p.amount), [1717.96, 1720.56]);
  assert.equal(tr[0].currency, 'TL');
  assert.equal(tr[0].placement, 'suffix');

  const us = APC.findPrices('increased from $1,717.96 to $1,720.56.');
  assert.deepEqual(us.map((p) => p.amount), [1717.96, 1720.56]);
  assert.equal(us[0].placement, 'prefix');

  const eu = APC.findPrices('von 12,99 € auf 9,99 €');
  assert.deepEqual(eu.map((p) => p.amount), [12.99, 9.99]);
});

test('findPrices ignores numbers that are not prices', () => {
  assert.equal(APC.findPrices('Kayıtlı ürünlerdeki 10 ürünün fiyatı değişti').length, 0);
  assert.equal(APC.findPrices('Duş Hortumu 160 cm 28276000').length, 0);
  assert.equal(APC.findPrices('$100M Offers').length, 0);
  assert.equal(APC.findPrices('krom kaplama 3 yedek').length, 0);
});

test('parseChange reads Turkish increase and decrease lines', () => {
  const up = APC.parseChange(TR_UP);
  assert.deepEqual([up.oldPrice, up.newPrice, up.direction, up.keyword], [1717.96, 1720.56, 'up', 'up']);
  const down = APC.parseChange(TR_DOWN);
  assert.deepEqual([down.oldPrice, down.newPrice, down.direction, down.keyword], [314.99, 297.49, 'down', 'down']);
});

test('parseChange reads English and corrects a reversed order with the keyword', () => {
  const en = APC.parseChange(', increased from $5.00 to $6.00');
  assert.deepEqual([en.oldPrice, en.newPrice, en.direction], [5, 6, 'up']);
  const reversed = APC.parseChange(', now $6.00, decreased from $9.00');
  assert.deepEqual([reversed.oldPrice, reversed.newPrice, reversed.direction], [9, 6, 'down']);
});

test('parseChange without a keyword falls back to comparing prices', () => {
  const c = APC.parseChange('price changed from 10,00 TL to 8,00 TL');
  assert.deepEqual([c.oldPrice, c.newPrice, c.direction, c.keyword], [10, 8, 'down', null]);
  assert.equal(APC.parseChange('only one price 10,00 TL here'), null);
});

test('enrich and summarize compute deltas, percentages and extremes', () => {
  const items = [
    APC.enrich({ name: 'a', oldPrice: 100, newPrice: 110, direction: 'up' }),
    APC.enrich({ name: 'b', oldPrice: 200, newPrice: 150, direction: 'down' }),
    APC.enrich({ name: 'c', oldPrice: 50, newPrice: 45, direction: 'down' }),
  ];
  assert.equal(items[0].delta, 10);
  assert.equal(items[0].pct, 10);
  assert.equal(items[1].delta, -50);
  const s = APC.summarize(items);
  assert.equal(s.total, 3);
  assert.equal(s.upCount, 1);
  assert.equal(s.downCount, 2);
  assert.equal(s.upSum, 10);
  assert.equal(s.downSum, -55);
  assert.equal(s.net, -45);
  assert.equal(s.biggestDown.name, 'b');
  assert.equal(s.biggestUp.name, 'a');
  assert.equal(s.maxAbsPct, 25);
});

test('sortItems and filterItems', () => {
  const items = [
    APC.enrich({ name: 'b', oldPrice: 100, newPrice: 110, direction: 'up' }),
    APC.enrich({ name: 'a', oldPrice: 200, newPrice: 150, direction: 'down' }),
  ];
  assert.deepEqual(APC.sortItems(items, 'pct').map((i) => i.name), ['a', 'b']);
  assert.deepEqual(APC.sortItems(items, 'name').map((i) => i.name), ['a', 'b']);
  assert.deepEqual(APC.sortItems(items, 'newPrice').map((i) => i.name), ['a', 'b']);
  assert.deepEqual(APC.filterItems(items, 'up').map((i) => i.name), ['b']);
  assert.equal(APC.filterItems(items, 'all').length, 2);
});

test('formatting follows the locale and keeps the currency placement', () => {
  assert.equal(APC.formatMoney(1720.56, 'TL', 'suffix', 'tr-TR'), '1.720,56 TL');
  assert.equal(APC.formatMoney(-2.6, 'TL', 'suffix', 'tr-TR', true), '−2,60 TL');
  assert.equal(APC.formatMoney(2.6, 'TL', 'suffix', 'tr-TR', true), '+2,60 TL');
  assert.equal(APC.formatMoney(1720.56, '$', 'prefix', 'en-US'), '$1,720.56');
  assert.equal(APC.formatPct(-10.07, 'tr-TR', true), '−10,1%');
  assert.equal(APC.formatPct(0.15, 'en-US', true), '+0.2%');
  assert.equal(APC.formatPct(null, 'en-US', true), '—');
});

test('groupKind tells saved from cart headings', () => {
  assert.equal(APC.groupKind('Kayıtlı ürünlerdeki 10 ürünün fiyatı değişti.'), 'saved');
  assert.equal(APC.groupKind('Sepetinizdeki 3 ürünün fiyatı değişti.'), 'cart');
  assert.equal(APC.groupKind('2 items in your Cart changed price'), 'cart');
  assert.equal(APC.groupKind('nothing'), '');
});

test('toCSV quotes names with commas', () => {
  const items = [APC.enrich({ name: 'Karaca Refika\'dan XL, "Chrome"', href: 'https://x/y', oldPrice: 6719.04, newPrice: 6299.1, direction: 'down', currency: 'TL' })];
  const csv = APC.toCSV(items);
  assert.equal(csv.split('\n')[0], 'Product,Old price,New price,Change,Change %,Currency,URL');
  assert.equal(csv.split('\n')[1], '"Karaca Refika\'dan XL, ""Chrome""",6719.04,6299.10,-419.94,-6.25,TL,https://x/y');
});

test('sortItems honours an explicit direction and per-key defaults', () => {
  const items = [
    APC.enrich({ name: 'b', oldPrice: 100, newPrice: 110, direction: 'up' }),
    APC.enrich({ name: 'a', oldPrice: 200, newPrice: 150, direction: 'down' }),
  ];
  assert.deepEqual(APC.sortItems(items, 'pct', 'desc').map((i) => i.name), ['b', 'a']);
  assert.deepEqual(APC.sortItems(items, 'oldPrice').map((i) => i.name), ['a', 'b']);
  assert.deepEqual(APC.sortItems(items, 'oldPrice', 'asc').map((i) => i.name), ['b', 'a']);
  assert.equal(APC.defaultSortDir('newPrice'), 'desc');
  assert.equal(APC.defaultSortDir('name'), 'asc');
});

test('asinFrom reads the ASIN out of the usual Amazon link shapes', () => {
  assert.equal(APC.asinFrom('https://www.amazon.com.tr/dp/B0C1ABCDEF?ref=x'), 'B0C1ABCDEF');
  assert.equal(APC.asinFrom('/gp/product/b07xyz1234/ref=ox_sc'), 'B07XYZ1234');
  assert.equal(APC.asinFrom('https://www.amazon.com/Some-Name/dp/B000000001/'), 'B000000001');
  assert.equal(APC.asinFrom('https://www.amazon.com/cart'), null);
});

test('recordHistory grows a price timeline without duplicating the same message', () => {
  const h = {};
  const item = { key: 'A', name: 'x', oldPrice: 100, newPrice: 110 };
  APC.recordHistory(h, item, 1000);
  assert.deepEqual(h.A.points, [{ t: null, p: 100 }, { t: 1000, p: 110 }]);
  APC.recordHistory(h, item, 2000);
  assert.equal(h.A.points.length, 2);
  APC.recordHistory(h, { key: 'A', name: 'x', oldPrice: 110, newPrice: 95 }, 3000);
  assert.deepEqual(h.A.points.map((p) => p.p), [100, 110, 95]);
  APC.recordHistory(h, { key: 'A', name: 'x', oldPrice: 90, newPrice: 120 }, 4000);
  assert.deepEqual(h.A.points.map((p) => p.p), [100, 110, 95, 90, 120]);
  assert.equal(h.A.seen, 4000);
  assert.equal(APC.recordHistory(h, { name: 'nokey', oldPrice: 1, newPrice: 2 }, 1), null);
});

test('recordHistory caps the timeline and pruneHistory drops stale entries', () => {
  const h = {};
  for (let i = 0; i < 80; i++) APC.recordHistory(h, { key: 'B', name: 'y', oldPrice: i, newPrice: i + 1 }, i, 10);
  assert.equal(h.B.points.length, 10);
  const day = 86400000;
  const pruned = APC.pruneHistory({ old: { seen: 0, points: [] }, fresh: { seen: 200 * day, points: [] }, junk: { seen: 200 * day } }, 200 * day);
  assert.deepEqual(Object.keys(pruned), ['fresh']);
});

test('lowestSeen needs three sightings and the new price at or below all of them', () => {
  assert.equal(APC.lowestSeen({ points: [{ p: 10 }, { p: 9 }] }, 9), false);
  assert.equal(APC.lowestSeen({ points: [{ p: 10 }, { p: 12 }, { p: 9 }] }, 9), true);
  assert.equal(APC.lowestSeen({ points: [{ p: 8 }, { p: 12 }, { p: 9 }] }, 9), false);
});

test('sparkline maps values into the box and newKeys ignores the first visit', () => {
  const s = APC.sparkline([10, 20, 15], 100, 20, 0);
  assert.equal(s.points.length, 3);
  assert.deepEqual(s.points[0], { x: 0, y: 20 });
  assert.deepEqual(s.points[1], { x: 50, y: 0 });
  assert.equal(s.d, 'M0 20 L50 0 L100 10');
  assert.equal(APC.sparkline([5], 100, 20).d, '');
  const items = [{ key: 'A' }, { key: 'B' }];
  assert.deepEqual(APC.newKeys(items, null), []);
  assert.deepEqual(APC.newKeys(items, ['A']), ['B']);
});

test('recordHistory keeps link, image, group and currency on the entry', () => {
  const h = {};
  APC.recordHistory(h, { key: 'A', name: 'x', href: 'https://a/dp/A', image: 'https://img/a.jpg', group: 'saved', currency: 'TL', placement: 'suffix', oldPrice: 10, newPrice: 12 }, 5);
  assert.equal(h.A.href, 'https://a/dp/A');
  assert.equal(h.A.image, 'https://img/a.jpg');
  assert.equal(h.A.group, 'saved');
  assert.deepEqual([h.A.currency, h.A.placement], ['TL', 'suffix']);
});

test('itemsFromHistory reports the change across the chosen window', () => {
  const day = 86400000;
  const now = 100 * day;
  const h = {
    A: { name: 'a', href: 'https://a', seen: now - day, currency: 'TL', placement: 'suffix', points: [{ t: null, p: 100 }, { t: now - 2 * day, p: 110 }, { t: now - day, p: 95 }] },
    B: { name: 'b', seen: now - 95 * day, points: [{ t: null, p: 10 }, { t: now - 95 * day, p: 12 }] },
    C: { name: 'c', seen: now, points: [{ t: now - 3 * day, p: 1 }] },
    D: { name: 'd', seen: now - 3 * day, points: [{ t: now - 10 * day, p: 50 }, { t: now - 3 * day, p: 40 }] },
    E: { name: 'e', seen: now, points: [{ t: now - 10 * day, p: 50 }, { t: now - 3 * day, p: 60 }, { t: now - day, p: 50 }] },
  };
  const week = APC.itemsFromHistory(h, now, now - 7 * day, { currency: '$', placement: 'prefix' });
  assert.deepEqual(week.map((i) => i.key), ['A', 'D']);
  const a = week[0];
  assert.deepEqual([a.oldPrice, a.newPrice, a.direction, a.delta, a.changedAt, a.points, a.steps], [100, 95, 'down', -5, now - day, 3, 2]);
  assert.equal(a.currency, 'TL');
  const d = week[1];
  assert.deepEqual([d.oldPrice, d.newPrice, d.changedAt, d.currency, d.placement], [50, 40, now - 3 * day, '$', 'prefix']);
  const twoDays = APC.itemsFromHistory(h, now, now - 2 * day);
  assert.deepEqual(twoDays.map((i) => [i.key, i.oldPrice, i.newPrice]), [['A', 100, 95], ['E', 60, 50]]);
  const all = APC.itemsFromHistory(h, now, -Infinity);
  assert.deepEqual(all.map((i) => i.key), ['A', 'B', 'D']);
  assert.deepEqual([all[1].oldPrice, all[1].newPrice], [10, 12]);
  assert.equal(APC.itemsFromHistory(h, now, now + day).length, 0);
});

test('recordObservation appends only when the price moved and seeds a first sighting', () => {
  const h = {};
  const obs = { key: 'A', name: 'x', href: 'https://a/dp/A', price: 100, currency: 'TL', placement: 'suffix', group: 'saved' };
  APC.recordObservation(h, obs, 1000);
  assert.deepEqual(h.A.points, [{ t: 1000, p: 100 }]);
  APC.recordObservation(h, obs, 2000);
  assert.equal(h.A.points.length, 1);
  APC.recordObservation(h, Object.assign({}, obs, { price: 90 }), 3000);
  assert.deepEqual(h.A.points.map((p) => p.p), [100, 90]);
  assert.equal(h.A.group, 'saved');
  assert.equal(APC.recordObservation(h, { key: 'B', price: 0 }, 1), null);
  assert.equal(APC.recordObservation(h, { key: 'B', price: NaN }, 1), null);
});

test('recordHistory slots the reported old price in when the current price was observed first', () => {
  const h = {};
  APC.recordObservation(h, { key: 'A', name: 'x', price: 110 }, 1000);
  APC.recordHistory(h, { key: 'A', name: 'x', oldPrice: 100, newPrice: 110 }, 2000);
  assert.deepEqual(h.A.points, [{ t: null, p: 100 }, { t: 1000, p: 110 }]);
  APC.recordHistory(h, { key: 'A', name: 'x', oldPrice: 100, newPrice: 110 }, 3000);
  assert.equal(h.A.points.length, 2);
});

test('windowStart turns a period key into a start timestamp', () => {
  const now = new Date(2026, 10, 2, 15, 30).getTime();
  const midnight = new Date(2026, 10, 2).getTime();
  assert.equal(APC.windowStart('today', now), midnight);
  assert.equal(APC.windowStart('2d', now), midnight - 86400000);
  assert.equal(APC.windowStart('7d', now), now - 7 * 86400000);
  assert.equal(APC.windowStart('30d', now), now - 30 * 86400000);
  assert.equal(APC.windowStart('all', now), -Infinity);
  assert.equal(APC.windowStart('nonsense', now), -Infinity);
});

test('currencyForHost picks the storefront currency', () => {
  assert.deepEqual(APC.currencyForHost('www.amazon.com.tr'), { currency: 'TL', placement: 'suffix' });
  assert.deepEqual(APC.currencyForHost('www.amazon.com'), { currency: '$', placement: 'prefix' });
  assert.deepEqual(APC.currencyForHost('www.amazon.de'), { currency: '€', placement: 'suffix' });
  assert.deepEqual(APC.currencyForHost('www.amazon.co.uk'), { currency: '£', placement: 'prefix' });
  assert.deepEqual(APC.currencyForHost('example.org'), { currency: '', placement: 'suffix' });
});

test('a stale Amazon message and a newer list price never oscillate across re-scans', () => {
  const h = {};
  for (let run = 0; run < 5; run++) {
    APC.recordHistory(h, { key: 'A', name: 'Edifier S360Db', oldPrice: 53195, newPrice: 50499 }, 1000 + run);
    APC.recordObservation(h, { key: 'A', name: 'Edifier', price: 47899 }, 1000 + run);
  }
  assert.deepEqual(h.A.points.map((p) => p.p), [53195, 50499, 47899]);
  assert.equal(h.A.name, 'Edifier S360Db');
  APC.recordObservation(h, { key: 'A', name: 'Edifier S360Db 2.1 Hoparlör', price: 47899 }, 2000);
  assert.equal(h.A.name, 'Edifier S360Db 2.1 Hoparlör');
});

test('productImageFromHTML finds the main picture in a product page', () => {
  const colorImages = '<script>var data = {"colorImages":{"initial":[{"hiRes":null,"large":"https://m.media-amazon.com/images/I/71abc._AC_SL1500_.jpg"},{"hiRes":"https://m.media-amazon.com/images/I/81xyz._AC_SL1500_.jpg"}]}};</script>';
  assert.equal(APC.productImageFromHTML(colorImages), 'https://m.media-amazon.com/images/I/81xyz._AC_SL1500_.jpg');
  const landing = '<img alt="x" src="https://m.media-amazon.com/images/I/small.jpg" data-old-hires="https://m.media-amazon.com/images/I/big.jpg" id="landingImage" class="a-dynamic-image">';
  assert.equal(APC.productImageFromHTML(landing), 'https://m.media-amazon.com/images/I/big.jpg');
  const dynamic = '<img id="landingImage" data-a-dynamic-image="{&quot;https://m.media-amazon.com/images/I/dyn.jpg&quot;:[500,500]}" src="data:image/gif;base64,R0lGOD">';
  assert.equal(APC.productImageFromHTML(dynamic), 'https://m.media-amazon.com/images/I/dyn.jpg');
  const og = '<meta property="og:image" content="https://m.media-amazon.com/images/I/og.jpg">';
  assert.equal(APC.productImageFromHTML(og), 'https://m.media-amazon.com/images/I/og.jpg');
  assert.equal(APC.productImageFromHTML('<html><body>Robot check</body></html>'), null);
  assert.equal(APC.productImageFromHTML(''), null);
});
