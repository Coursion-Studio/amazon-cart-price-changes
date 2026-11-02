#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
FIX="file://$PWD/test/cart/fixture.html"
shot() {
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=3000 \
    --window-size=1280,800 --screenshot="$2" "$FIX$1" >/dev/null 2>&1
  echo "$2"
}
shot "?seed=1&shot=1" store/screenshot-1-cards.png
sleep 1
shot "?seed=1&shot=1&view=list&win=30d" store/screenshot-2-list.png
sleep 1
shot "?seed=1&shot=1&expand=B0D6ABCDEF&win=7d" store/screenshot-3-history.png
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=1000 \
  --window-size=880,560 --screenshot=store/promo-raw.png "file://$PWD/store/promo.html" >/dev/null 2>&1
sips -z 280 440 store/promo-raw.png --out store/promo-440x280.png >/dev/null && rm -f store/promo-raw.png
echo store/promo-440x280.png
