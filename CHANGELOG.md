# Changelog

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
