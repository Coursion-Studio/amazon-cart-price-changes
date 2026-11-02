#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
OUT="${1:-/tmp/amazon-price-changes.png}"
WIDTH="${WIDTH:-1380}"
HEIGHT="${HEIGHT:-1040}"
QUERY="${QUERY:-}"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
  --virtual-time-budget=3000 --window-size="${WIDTH},${HEIGHT}" --screenshot="$OUT" \
  "file://$PWD/cart/fixture.html${QUERY}" >/dev/null 2>&1
echo "$OUT"
