#!/usr/bin/env python3
"""Generates test/cart/fixture.html: a stand-in for an amazon.com cart page with made-up products."""
import pathlib
from urllib.parse import quote

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "cart" / "fixture.html"

# asin, name, emoji, tint, old price, new price (None = unchanged), list price override, has image
PRODUCTS = [
    ("B0SONYXM5A", "Sony WH-1000XM5 Wireless Noise Cancelling Headphones, Black", "🎧", "#e8ebf0", 349.99, 278.00, 269.00, True),
    ("B0BREVILLE", "Breville Barista Express Espresso Machine, Brushed Stainless Steel", "☕", "#efe7df", 699.95, 599.95, None, True),
    ("B0LEGOORCH", "LEGO Icons Orchid Artificial Plant Building Set 10311", "🪴", "#e6f0e6", 49.99, 39.99, None, True),
    ("B0KINDLEPW", "Kindle Paperwhite (16 GB), 6.8\" display, adjustable warm light", "📖", "#e9e9e9", 149.99, 129.99, None, True),
    ("B0ANKER737", "Anker 737 Power Bank (PowerCore 24K), 140W Three-Port Portable Charger", "🔋", "#e5ecf4", 149.99, 109.99, None, True),
    ("B0FITBITC6", "Fitbit Charge 6 Fitness Tracker with Heart Rate, Obsidian", "⌚", "#e9ecf2", 159.95, 119.95, None, True),
    ("B0LOGIMX3S", "Logitech MX Master 3S Wireless Performance Mouse, Graphite", "🖱️", "#e9e9ec", 99.99, 84.99, None, True),
    ("B0ATOMICHB", "Atomic Habits: Tiny Changes, Remarkable Results (Hardcover)", "📚", "#f2e8d8", 27.00, 14.49, None, True),
    ("B0DYSONV8X", "Dyson V8 Cordless Stick Vacuum Cleaner, Silver/Nickel", "🧹", "#ebe4ef", 469.99, 379.99, None, True),
    ("B0NIKEPEG4", "Nike Pegasus 41 Men's Road Running Shoes", "👟", "#f3ece8", 140.00, 97.97, None, True),
    ("B0AIRPODS2", "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)", "🎶", "#e9e9e9", 189.00, 249.00, None, True),
    ("B0SAMODYG5", "Samsung 32\" Odyssey G5 QHD 165Hz Curved Gaming Monitor", "🖥️", "#e3e7ef", 279.99, 329.99, None, True),
    ("B0KEYCHRK2", "Keychron K2 Pro Wireless Mechanical Keyboard, RGB, Hot-swappable", "⌨️", "#e8e8e8", 99.00, 109.00, None, True),
    ("B0PATAGBH2", "Patagonia Black Hole 25L Backpack, Smolder Blue", "🎒", "#e2e9f3", 129.00, 149.00, None, True),
    ("B0INSTPOT6", "Instant Pot Duo 7-in-1 Electric Pressure Cooker, 6 Quart", "🍲", "#efe5dd", 79.95, 99.95, None, True),
    ("B0INSTAX12", "Fujifilm Instax Mini 12 Instant Camera, Pastel Blue", "📷", "#e6edf3", 79.95, 81.95, None, True),
    ("B0SONICARE", "Philips Sonicare 4100 Rechargeable Electric Toothbrush, White", "🪥", "#e7eef2", 49.96, 54.96, None, True),
    ("B0SWITCHOL", "Nintendo Switch OLED Model, White Joy-Con", "🎮", "#f3e4e4", None, 349.99, None, True),
    ("B0BOSEFLEX", "Bose SoundLink Flex Bluetooth Speaker, Black", "🔊", "#e8e8e8", None, 119.00, None, True),
    ("B0YETIRAMB", "YETI Rambler 20 oz Tumbler with MagSlider Lid, Navy", "🧋", "#e2e7f1", None, 38.00, None, True),
]
LAZY_DATA_SRC = {"B0LOGIMX3S"}
LAZY_DYNAMIC = {"B0SONICARE"}
GIF = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="


def picture(emoji, tint):
    svg = (
        "<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>"
        "<defs><radialGradient id='g' cx='50%' cy='42%' r='70%'><stop offset='0' stop-color='#ffffff'/>"
        f"<stop offset='1' stop-color='{tint}'/></radialGradient>"
        "<filter id='s' x='-20%' y='-20%' width='140%' height='140%'><feDropShadow dx='0' dy='8' stdDeviation='7' flood-color='#0b0b0b' flood-opacity='0.22'/></filter></defs>"
        "<rect width='200' height='200' fill='url(#g)'/>"
        f"<text x='100' y='138' font-size='108' text-anchor='middle' filter='url(#s)'>{emoji}</text></svg>"
    )
    return "data:image/svg+xml;charset=utf-8," + quote(svg, safe="")


def usd(v):
    return "${:,.2f}".format(v)


def alert_line(asin, name, old, new):
    word = "decreased" if new < old else "increased"
    return (
        f'          <li><span class="a-list-item"><a class="a-link-normal" href="/dp/{asin}">{name}</a>, '
        f'price {word} from <span class="a-color-price">{usd(old)}</span> to <span class="a-color-price">{usd(new)}</span></span></li>'
    )


def card(asin, name, emoji, tint, price, has_image):
    img = ""
    if has_image:
        real = picture(emoji, tint)
        if asin in LAZY_DATA_SRC:
            img = f'<img class="sc-product-image" src="{GIF}" data-src="{real}" alt="">'
        elif asin in LAZY_DYNAMIC:
            img = f"<img class=\"sc-product-image\" src=\"{GIF}\" data-a-dynamic-image='{{\"{real}\":[160,160]}}' alt=\"\">"
        else:
            img = f'<img class="sc-product-image" src="{real}" alt="">'
    return (
        f'    <div class="sc-list-item" data-asin="{asin}" data-itemtype="saved">'
        f'<a class="sc-product-link" href="/dp/{asin}">{img}</a>'
        f'<span class="sc-product-title">{name}</span>'
        f'<span class="sc-product-price a-text-bold">{usd(price)}</span>'
        f'<a class="sc-action" href="#">Move to cart</a><a class="sc-action" href="#">Delete</a></div>'
    )


drops = [p for p in PRODUCTS if p[4] is not None and p[5] < p[4]]
rises = [p for p in PRODUCTS if p[4] is not None and p[5] > p[4]]

html = f'''<!doctype html>
<html lang="en-us">
<head>
<meta charset="utf-8">
<title>Amazon.com Shopping Cart (fixture)</title>
<style>
  body {{ margin: 0; font: 13px/1.4 "Amazon Ember", Arial, sans-serif; color: #0f1111; background: #fff; }}
  .nav {{ background: #131921; color: #fff; height: 60px; display: flex; align-items: center; padding: 0 20px; gap: 24px; font-size: 14px; }}
  .nav b {{ font-size: 20px; letter-spacing: -0.02em; }}
  .nav .search {{ flex: 1; height: 38px; border-radius: 4px; background: #fff; }}
  .page {{ max-width: 1300px; margin: 18px auto; padding: 0 18px; }}
  h1 {{ font-weight: 400; font-size: 28px; margin: 0 0 14px; }}
  html.shot .page {{ max-width: 1240px; margin: 12px auto; }}
  html.shot h1 {{ font-size: 22px; margin: 0 0 10px; }}
  .a-alert {{ background: #fcf6e2; border: 1px solid #f0c14b; border-radius: 4px; padding: 14px 18px; margin-bottom: 14px; }}
  .a-alert-heading {{ margin: 0 0 12px; font-size: 17px; }}
  .a-alert-heading::before {{ content: "⚠️ "; }}
  .a-text-bold {{ font-weight: 700; }}
  ul.a-unordered-list {{ margin: 4px 0 2px 18px; padding: 0; }}
  li {{ margin: 2px 0; }}
  a.a-link-normal {{ color: #007185; text-decoration: none; }}
  .a-color-price {{ color: #b12704; }}
  .a-expander-header {{ color: #007185; display: inline-block; margin: 2px 0 14px; }}
  #sc-saved-cart h2 {{ font-weight: 400; font-size: 20px; margin: 18px 0 8px; }}
  .sc-grid {{ display: flex; gap: 16px; flex-wrap: wrap; }}
  .sc-list-item {{ width: 150px; display: flex; flex-direction: column; gap: 4px; font-size: 12px; }}
  .sc-list-item img {{ width: 150px; height: 150px; border-radius: 8px; display: block; }}
  .sc-product-title {{ color: #007185; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }}
  .sc-product-price {{ font-weight: 700; color: #0f1111; }}
  .sc-action {{ color: #007185; font-size: 11px; text-decoration: none; }}
</style>
<script>
(function () {{
  const q = new URLSearchParams(location.search);
  if (!q.has('seed')) return;
  const day = 86400000;
  const now = Date.now();
  localStorage.clear();
  localStorage.setItem('apc:seen', JSON.stringify({{ t: now - 5 * day, keys: [] }}));
  const usd = {{ currency: '$', placement: 'prefix', group: 'saved' }};
  localStorage.setItem('apc:history', JSON.stringify({{
    B0BREVILLE: Object.assign({{ name: 'Breville Barista Express Espresso Machine, Brushed Stainless Steel', href: '/dp/B0BREVILLE', seen: now - 19 * day, points: [{{ t: null, p: 749.95 }}, {{ t: now - 41 * day, p: 729.95 }}, {{ t: now - 19 * day, p: 699.95 }}] }}, usd),
    B0KINDLEPW: Object.assign({{ name: 'Kindle Paperwhite (16 GB), 6.8" display, adjustable warm light', href: '/dp/B0KINDLEPW', seen: now - 12 * day, points: [{{ t: null, p: 159.99 }}, {{ t: now - 30 * day, p: 139.99 }}, {{ t: now - 12 * day, p: 149.99 }}] }}, usd),
    B0LEGOORCH: Object.assign({{ name: 'LEGO Icons Orchid Artificial Plant Building Set 10311', href: '/dp/B0LEGOORCH', seen: now - 6 * day, points: [{{ t: null, p: 54.99 }}, {{ t: now - 6 * day, p: 49.99 }}] }}, usd),
    B0BOSEFLEX: Object.assign({{ name: 'Bose SoundLink Flex Bluetooth Speaker, Black', href: '/dp/B0BOSEFLEX', seen: now - 12 * day, points: [{{ t: null, p: 149.00 }}, {{ t: now - 12 * day, p: 119.00 }}] }}, usd),
    B0YETIRAMB: Object.assign({{ name: 'YETI Rambler 20 oz Tumbler with MagSlider Lid, Navy', href: '/dp/B0YETIRAMB', seen: now - 26 * day, points: [{{ t: null, p: 35.00 }}, {{ t: now - 26 * day, p: 38.00 }}] }}, usd),
    B0GHOSTITM: Object.assign({{ name: 'Apple Magic Keyboard with Touch ID (no longer in the list)', href: '/dp/B0GHOSTITM', seen: now - 9 * day, points: [{{ t: null, p: 179.00 }}, {{ t: now - 9 * day, p: 149.00 }}] }}, usd),
  }}));
  localStorage.setItem('apc:prefs', JSON.stringify({{ sort: 'pct', dir: 'asc', filter: q.get('filter') || 'all', window: q.get('win') || 'all', view: q.get('view') || 'cards', showOriginal: false, collapsed: false }}));
}})();
</script>
<link rel="stylesheet" href="../../styles.css">
</head>
<body>
<script>if (new URLSearchParams(location.search).has('shot')) document.documentElement.classList.add('shot');</script>
<div class="nav"><b>amazon.com</b><span>Deliver to Seattle 98101</span><div class="search"></div><span>Hello, sign in<br>Account &amp; Lists</span><span>Cart</span></div>
<div class="page">
<h1>Shopping Cart</h1>

<div id="sc-cart-alert" class="a-box a-alert a-alert-warning sc-list-head-alert">
  <div class="a-box-inner a-alert-container">
    <h4 class="a-alert-heading">Important messages for items in your Cart:</h4>
    <div class="a-alert-content">
      <div class="sc-list-head-alert-group">
        <span class="a-text-bold">{len(drops)} items in your Saved for later have changed price.</span><br>
        <span>Items in your Cart will always reflect the most recent price displayed on their product detail pages.</span>
        <ul class="a-unordered-list a-nostyle a-vertical">
{chr(10).join(alert_line(a, n, o, nw) for a, n, _, _, o, nw, _, _ in drops[:5])}
        </ul>
        <div class="a-expander-content">
        <ul class="a-unordered-list a-nostyle a-vertical">
{chr(10).join(alert_line(a, n, o, nw) for a, n, _, _, o, nw, _, _ in drops[5:])}
        </ul>
        </div>
        <a class="a-expander-header" href="#">Hide the last {len(drops) - 5}</a>
      </div>
      <div class="sc-list-head-alert-group">
        <span class="a-text-bold">{len(rises)} items in your Saved for later have changed price.</span><br>
        <span>Items in your Cart will always reflect the most recent price displayed on their product detail pages.</span>
        <ul class="a-unordered-list a-nostyle a-vertical">
{chr(10).join(alert_line(a, n, o, nw) for a, n, _, _, o, nw, _, _ in rises)}
        </ul>
      </div>
    </div>
  </div>
</div>

<div id="sc-saved-cart" class="sc-list">
  <h2>Saved for later ({len(PRODUCTS)} items)</h2>
  <div class="sc-grid">
{chr(10).join(card(a, n, e, t, (lp if lp is not None else nw), img) for a, n, e, t, o, nw, lp, img in PRODUCTS)}
  </div>
</div>
</div>
<script>
(function () {{
  const q = new URLSearchParams(location.search);
  if (q.has('nolive')) document.getElementById('sc-cart-alert').remove();
}})();
</script>
<script src="../../parse.js"></script>
<script src="../../content.js"></script>
<script>
(function () {{
  const q = new URLSearchParams(location.search);
  const key = q.get('expand');
  if (!key) return;
  const btn = document.querySelector('#apc-panel .apc-row[data-key="' + key + '"] .apc-chevron, #apc-panel .apc-card[data-key="' + key + '"] .apc-card-more');
  if (btn) btn.click();
}})();
</script>
</body>
</html>
'''
OUT.write_text(html)
print(OUT.relative_to(ROOT.parent), len(PRODUCTS), "products,", len(drops), "drops,", len(rises), "rises")
