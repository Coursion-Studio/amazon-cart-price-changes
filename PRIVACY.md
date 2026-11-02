# Privacy policy

**Cart Price Changes for Amazon** runs entirely inside your browser.

- It collects no personal data and sends nothing anywhere. There is no server,
  no analytics and no account.
- It reads the Amazon cart page you are looking at: the price-change notices
  Amazon shows, and the name, price and picture of the items in your cart and
  saved-for-later list.
- It stores what it reads, plus your view and alert preferences and any price
  targets you set, in the browser's extension storage, keyed by the Amazon site
  you use (for example `www.amazon.com.tr`). Nothing is synced. Entries older
  than a year are dropped. **Clear history** in the panel's footer deletes
  everything it stored, and removing the extension does the same.
- Its only network requests go to the Amazon site you use: product pictures
  from Amazon's image service; a product's own page, fetched once when a
  remembered item has no picture; and, **only if you turn on price alerts**,
  your cart page and the pages of tracked products, fetched on the schedule
  you choose so the extension can notify you about drops while the cart is not
  open.
- Permissions: `storage` (its own data). Optional, asked for only when you turn
  alerts on: `alarms` (the schedule), `notifications` (the alert itself) and
  access to the Amazon sites it should check. Turning alerts off stops the
  checks.

Questions: open an issue at
https://github.com/Coursion-Studio/amazon-cart-price-changes/issues.
