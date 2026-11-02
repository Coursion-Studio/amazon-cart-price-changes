# Changelog

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
