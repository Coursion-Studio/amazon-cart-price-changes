const test = require('node:test');
const assert = require('node:assert/strict');
require('../parse.js');
const scan = require('../scan.js');

const CART_TR = `
<div id="sc-active-cart">
  <div class="a-row sc-list-item sc-java-remote-feature" data-itemtype="active" data-asin="B0ABCDEF12" data-price="1234.56" id="sc-item-1">
    <img class="sc-product-image" src="https://m.media-amazon.com/images/G/01/loading.gif" data-a-dynamic-image="{&quot;https://m.media-amazon.com/images/I/71abc._AC_AA180_.jpg&quot;:[180,180]}" alt="Kahve Makinesi">
    <span class="a-truncate-full a-offscreen">Philips Kahve Makinesi &amp; Öğütücü</span>
    <span class="a-size-medium sc-product-price a-text-bold">1.234,56 TL</span>
  </div>
  <div data-asin="B0XYZ98765" class="sc-list-item a-spacing-mini" data-itemtype="active">
    <img src="https://m.media-amazon.com/images/I/61xyz._AC_AA180_.jpg" alt="ignored">
    <span class="a-truncate sc-product-title">Kulaklık &quot;Pro&quot; &#39;2&#39;</span>
    <span class="a-price"><span class="a-offscreen">899,90 TL</span></span>
  </div>
</div>
<div id="sc-saved-cart">
  <div data-price="0" data-asin="B0SAVED001" data-itemtype="saved" class="sc-list-item">
    <img data-src="https://m.media-amazon.com/images/I/51saved.jpg" src="https://images-na.ssl-images-amazon.com/images/G/01/x-locale/common/transparent-pixel.gif" alt="Termos 1L">
    <span class="sc-product-price">249,00 TL</span>
  </div>
  <div class="sc-list-item" data-asin="B0NOPRICE1" data-itemtype="saved">
    <span class="sc-product-title">No price here</span>
  </div>
  <div class="sc-list-item" data-asin="B0ABCDEF12" data-itemtype="saved">
    <span class="sc-product-title">Duplicate</span>
    <span class="sc-product-price">1.000,00 TL</span>
  </div>
</div>`;

const CART_US = `
<div class="sc-list-item-content"><span>wrapper</span></div>
<div data-itemtype="active" class="a-row sc-list-item" data-asin="B07USITEM1">
  <img data-old-hires="https://m.media-amazon.com/images/I/81us.jpg" src="https://m.media-amazon.com/images/G/01/spinner.gif">
  <span class="a-truncate-full">Echo Dot (5th Gen) &#x27;Charcoal&#x27;</span>
  <span class="a-offscreen">$1,234.56</span>
</div>`;

test('decodeEntities handles named and numeric entities', () => {
  assert.equal(scan.decodeEntities('A &amp; B &quot;C&quot; &#39;d&#39; &#x27;e&#x27; &lt;f&gt;&nbsp;g'), 'A & B "C" \'d\' \'e\' <f> g');
  assert.equal(scan.decodeEntities('&unknown; stays'), '&unknown; stays');
  assert.equal(scan.decodeEntities(null), '');
});

test('cartItemsFromHTML reads Turkish cart and saved items', () => {
  const items = scan.cartItemsFromHTML(CART_TR);
  assert.deepEqual(items.map((i) => i.asin), ['B0ABCDEF12', 'B0XYZ98765', 'B0SAVED001']);
  const [a, b, c] = items;
  assert.equal(a.name, 'Philips Kahve Makinesi & Öğütücü');
  assert.equal(a.price, 1234.56);
  assert.equal(a.currency, 'TL');
  assert.equal(a.placement, 'suffix');
  assert.equal(a.group, 'cart');
  assert.equal(a.href, '/dp/B0ABCDEF12');
  assert.equal(a.image, 'https://m.media-amazon.com/images/I/71abc._AC_AA180_.jpg');
  assert.equal(b.name, 'Kulaklık "Pro" \'2\'');
  assert.equal(b.price, 899.9);
  assert.equal(b.image, 'https://m.media-amazon.com/images/I/61xyz._AC_AA180_.jpg');
  assert.equal(c.group, 'saved');
  assert.equal(c.price, 249);
  assert.equal(c.name, 'Termos 1L');
  assert.equal(c.image, 'https://m.media-amazon.com/images/I/51saved.jpg');
});

test('cartItemsFromHTML reads US prices without data-price', () => {
  const items = scan.cartItemsFromHTML(CART_US);
  assert.equal(items.length, 1);
  assert.equal(items[0].asin, 'B07USITEM1');
  assert.equal(items[0].price, 1234.56);
  assert.equal(items[0].currency, '$');
  assert.equal(items[0].placement, 'prefix');
  assert.equal(items[0].name, "Echo Dot (5th Gen) 'Charcoal'");
  assert.equal(items[0].image, 'https://m.media-amazon.com/images/I/81us.jpg');
});

test('cartItemsFromHTML returns nothing for pages without items', () => {
  assert.deepEqual(scan.cartItemsFromHTML('<html><form action="/ap/signin"></form></html>'), []);
  assert.deepEqual(scan.cartItemsFromHTML(''), []);
});

test('priceFromProductHTML prefers priceAmount', () => {
  const html = '<script>{"priceAmount":1299.9,"currencySymbol":"TL"}</script><span class="a-offscreen">1.299,90 TL</span>';
  assert.deepEqual(scan.priceFromProductHTML(html), { amount: 1299.9, currency: 'TL', placement: 'suffix' });
  const us = '<script>{"currencySymbol":"$","priceAmount":49.99}</script>';
  assert.deepEqual(scan.priceFromProductHTML(us), { amount: 49.99, currency: '$', placement: 'prefix' });
});

test('priceFromProductHTML falls back to the core price block', () => {
  const html = `
    <div id="sims"><span class="a-offscreen">$5.00</span></div>
    <div id="corePriceDisplay_desktop_feature_div"><span class="a-price"><span class="a-offscreen">$1,234.56</span></span></div>`;
  assert.deepEqual(scan.priceFromProductHTML(html), { amount: 1234.56, currency: '$', placement: 'prefix' });
  const legacy = '<span id="priceblock_ourprice" class="a-size-medium">1.234,56 TL</span>';
  assert.deepEqual(scan.priceFromProductHTML(legacy), { amount: 1234.56, currency: 'TL', placement: 'suffix' });
  const only = '<span class="a-price"><span class="a-offscreen">799,00 TL</span></span>';
  assert.equal(scan.priceFromProductHTML(only).amount, 799);
});

test('priceFromProductHTML returns null for a bot check page', () => {
  const html = '<html><body><h4>Enter the characters you see below</h4><form action="/errors/validateCaptcha"></form></body></html>';
  assert.equal(scan.priceFromProductHTML(html), null);
});

test('productFromHTML reads title and image', () => {
  const html = `<span id="productTitle" class="a-size-large">
      Philips &amp; Saeco Kahve Makinesi   </span>
    <img id="landingImage" data-old-hires="https://m.media-amazon.com/images/I/71big.jpg" src="https://m.media-amazon.com/images/I/71small.jpg">`;
  assert.deepEqual(scan.productFromHTML(html), { name: 'Philips & Saeco Kahve Makinesi', image: 'https://m.media-amazon.com/images/I/71big.jpg' });
  assert.deepEqual(scan.productFromHTML(''), { name: '', image: null });
});
