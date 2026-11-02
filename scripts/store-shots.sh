#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
FIX="file://$PWD/test/cart/fixture.html"
shot() {
  local query="$1" out="$2" scale="$3" width="$4" height="$5"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor="$scale" --virtual-time-budget=3000 \
    --window-size="${width},${height}" --screenshot="$out" "$FIX$query" >/dev/null 2>&1
  echo "$out"
  sleep 1
}
CARDS="?seed=1&shot=1"
LIST="?seed=1&shot=1&view=list&win=30d&filter=down"
HISTORY="?seed=1&shot=1&nolive=1&view=list&expand=B0BREVILLE"

shot "$CARDS"   store/screenshot-1-cards.png   1 1280 800
shot "$LIST"    store/screenshot-2-list.png    1 1280 800
shot "$HISTORY" store/screenshot-3-history.png 1 1280 800

shot "$CARDS"   docs/cards.png   2 1280 800
shot "$LIST"    docs/list.png    2 1280 800
shot "$HISTORY" docs/history.png 2 1280 620

"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=1000 \
  --window-size=880,560 --screenshot=store/promo-raw.png "file://$PWD/store/promo.html" >/dev/null 2>&1
sips -z 280 440 store/promo-raw.png --out store/promo-440x280.png >/dev/null && rm -f store/promo-raw.png
echo store/promo-440x280.png
