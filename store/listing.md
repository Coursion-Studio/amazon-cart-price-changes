# Chrome Web Store listing

Everything the developer console asks for, in order. Assets are in this folder:
`screenshot-1-cards.png`, `screenshot-2-list.png`, `screenshot-3-history.png`
(1280×800) and `promo-440x280.png` (small promo tile). The icon is
`../icons/icon128.png`. The upload is the zip from `npm run package`.

## Store listing

**Name:** Cart Price Changes for Amazon

**Summary (132 max):** Your Amazon cart and saved-for-later price changes as
cards or a table: old vs new, change, history, period filters.

**Category:** Shopping · **Language:** English (Turkish text is included in
the extension and follows the page)

**Description:**

Amazon tells you about price changes in your cart as one long sentence per
item, shows that box only once, and only for what changed since you last
looked. This extension fixes all three.

It replaces the box with a card view: product picture, new price, old price,
a green or red change pill with amount and percent, a sparkline and the date.
Or switch to a sortable table with a bar per item. Summary tiles show how many
items dropped or rose, by how much, and the biggest move each way.

It also keeps its own price history. On every cart visit it records the
current price of every item in your cart and saved-for-later list, so the
list keeps growing and you can look at today, the last 2 days, 7 days, 30
days or all time. Click a product for its full history. New changes since
your last visit are marked; a "lowest seen" badge shows when a price is at
its lowest recorded.

Turn on alerts and it checks your cart on a schedule while you do other
things, notifies you about drops of 10% or more (your choice) or when an item
reaches the target price you set, and shows the number of new drops on its
icon. Click the icon for the recent drops.

Private by design: no server, no analytics. Everything is stored in your
browser, and one click clears it. Alert permissions are asked for only when
you turn alerts on.

Works on amazon.com.tr, amazon.com, .co.uk, .de, .fr, .it, .es, .nl, .se, .pl,
.com.be, .ca, .com.mx, .com.br, .com.au, .co.jp, .in, .sg, .ae, .sa and .eg.
Interface in English and Turkish, following the page language.

Not affiliated with or endorsed by Amazon.

**Açıklama (Turkish):**

Amazon, sepetinizdeki fiyat değişikliklerini her ürün için uzun bir cümle
olarak gösterir; üstelik bu kutuyu yalnızca bir kez ve yalnızca son
bakışınızdan beri değişenler için gösterir. Bu uzantı üçünü de çözer.

Kutunun yerine kart görünümü gelir: ürün resmi, yeni fiyat, eski fiyat,
yeşil veya kırmızı değişim etiketi, küçük bir grafik ve tarih. İsterseniz
sıralanabilir bir tabloya geçin. Özet kutuları kaç ürünün ucuzladığını, kaç
ürünün zamlandığını ve en büyük hareketleri gösterir.

Uzantı kendi fiyat geçmişini tutar: her sepet ziyaretinde sepetinizdeki ve
"daha sonra almak için kaydedilen" listesindeki her ürünün güncel fiyatını
kaydeder. Bugün, 2 gün, 7 gün, 30 gün veya tüm zamanlar için değişimi
görürsünüz. Bir ürüne tıklayınca tüm geçmişi açılır.

Uyarıları açın: sepetinizi siz başka işlerle uğraşırken belirlediğiniz
aralıkla kontrol eder, %10 ve üzeri düşüşlerde (oranı siz seçersiniz) veya
bir ürün koyduğunuz hedef fiyata ulaştığında bildirim gönderir, yeni düşüş
sayısını simgesinde gösterir. Simgeye tıklayınca son düşüşleri görürsünüz.

Gizlilik: sunucu yok, analitik yok. Her şey tarayıcınızda kalır; tek tıkla
silinir. Uyarı izinleri yalnızca uyarıları açtığınızda istenir.

Amazon ile bağlantılı veya Amazon tarafından onaylanmış değildir.

## Privacy practices

**Single purpose:** Show how the prices of items in the user's Amazon cart and
saved-for-later list have changed.

**Permission justification:**
- `storage`: keeps the price history, price targets and the user's view and
  alert preferences in extension storage, so the background worker and the
  cart page share one record.
- `alarms` (optional, requested when the user turns alerts on): schedules the
  periodic price check the user asked for.
- `notifications` (optional, same moment): shows the price-drop alert.
- Host permissions for Amazon storefronts (optional, same moment): lets the
  background worker fetch the user's cart page and tracked product pages to
  compare prices while no Amazon tab is open. The content script itself runs
  only on Amazon storefront pages (match patterns in the manifest) to read the
  cart page's price-change notices and item prices and to render the panel.

**Remote code:** None. All code ships in the package.

**Data usage:** The extension does not collect or transmit any user data.
Prices, product names, pictures and price targets are stored only in the
browser's extension storage. Its only requests go to the user's Amazon site:
product pictures, a product's own page when a remembered item has no picture,
and, with alerts on, the cart page and tracked product pages on the chosen
schedule. Tick "I do not sell or transfer
user data to third parties", "I do not use or transfer user data for purposes
unrelated to the item's core functionality" and "I do not use or transfer user
data to determine creditworthiness or for lending purposes". No data types
need to be declared as collected.

**Privacy policy URL:**
https://github.com/Coursion-Studio/amazon-cart-price-changes/blob/main/PRIVACY.md

## Publishing steps

1. Register once at https://chrome.google.com/webstore/devconsole (one-time
   fee of USD 5, Google account).
2. `npm run package` → upload `dist/amazon-cart-price-changes-<version>.zip`.
3. Paste the listing above, upload the three screenshots and the promo tile,
   set category and language, fill the privacy section, add the privacy
   policy URL.
4. Distribution: public, all regions. Submit for review (usually a few days
   for a no-permission extension).
5. New versions: bump `version` in `manifest.json`, `npm run package`, upload
   the new zip, submit.

## Other channels

- **Userscript:** `npm run userscript` builds
  `amazon-cart-price-changes.user.js`; it is committed at the repo root so the
  raw GitHub URL in its `@updateURL` keeps Tampermonkey and Violentmonkey users
  updated. No store, no review.
- **GitHub release:** attach the zip and the userscript; people load the
  unzipped folder with Developer mode.
- **Homebrew:** `Formula/amazon-cart-price-changes.rb` in the public
  `Coursion-Studio/homebrew-tools` tap installs the unpacked folder under
  `$(brew --prefix)/share` and prints the load steps. After each GitHub
  release run `scripts/update-formula.sh`, then commit and push the tap.
- **Firefox Add-ons** (https://addons.mozilla.org/developers/, free): upload
  `dist/<name>-<version>-firefox.zip` (Manifest V2 build with a Gecko id).
  Listed extensions are reviewed; self-distributed ones are signed in minutes.
- **Microsoft Edge Add-ons** (https://partner.microsoft.com/dashboard/microsoftedge,
  free): upload the same zip as the Chrome Web Store.
- **Safari:** `npm run safari` regenerates the Xcode project in `safari/` from the
  packaged extension (Apple's converter) and builds it unsigned. Shipping it
  means archiving that project with the Coursion team and submitting to the
  Mac App Store, or notarizing for direct download.
