# Changelog

## 1.2.0 — 2026-11-02

- Price alerts (opt-in): a background check of your cart on a schedule you
  choose, a notification when an item drops by your chosen percentage or
  reaches your target price, and a count of new drops on the toolbar icon.
- Popup on the toolbar icon: alert settings, "check now", recent drops and
  price targets.
- Target price per item, set in a product's details; a chip on the card and an
  alert when reached.
- Deal signals: lowest seen, N drops in a row, back to an earlier price,
  target reached.
- Cart total in the first tile, with its change over the chosen period.
- Storage moved from the page's local storage to extension storage (shared
  with the background worker); existing history is migrated on first run. The
  userscript build keeps using local storage and has no alerts.
- Safari: Xcode project under safari/ generated with Apple's converter.

## 1.1.2 — 2026-11-02

- A shimmering placeholder while a picture is being looked up; the frame icon
  only appears once every lookup has failed.

## 1.1.1 — 2026-11-02

- Pictures for remembered items that are not on the page: Amazon's image
  service is tried for several regions, then the product's own page on the
  same site is fetched once (at most four items per visit, retried after a
  day) and its main picture cached.

## 1.1.0 — 2026-11-02

- Summary tiles now act as filters (all / dropped / increased) and the first
  tile carries the period, the net change and a drop-vs-rise bar; the biggest
  drop and biggest increase show the product picture and jump to the item.
- A period + sort toolbar: sort menu in both views (biggest drop, biggest rise,
  newest, biggest saving, price, name).
- Picture-frame placeholder for items without a picture; card footer shows the
  date only, the price count moved to the sparkline's tooltip.
- New demo cart (test/make-fixture.py) with made-up products; README and store
  screenshots regenerated from it.

## 1.0.0 — 2026-11-02

First public release.

- Replaces Amazon's "price changed" sentences with a card view (product
  picture, new price, old price, change pill, sparkline, date) or a sortable
  table with diverging bars.
- Keeps its own price history: every cart visit records the current price of
  each item in the cart and saved-for-later list, and folds in Amazon's own
  notices. Period filter: today, 2 days, 7 days, 30 days, all time.
- Summary tiles, one-line summary, filters, search, new-since-last-visit
  markers, lowest-seen badge, CSV export, diagnostics copy.
- Turkish and English interface, follows the page language. No permissions,
  no network calls of its own.
- Distribution: Chrome Web Store package, userscript build, Firefox package,
  Homebrew formula in the Coursion-Studio/tools tap.
