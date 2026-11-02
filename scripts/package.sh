#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./manifest.json').version")
NAME=$(node -p "require('./package.json').name")
DESC_LEN=$(node -p "require('./manifest.json').description.length")
if [ "$DESC_LEN" -gt 132 ]; then echo "manifest description is $DESC_LEN chars; the Chrome Web Store allows 132" >&2; exit 1; fi
node --check parse.js && node --check content.js
mkdir -p dist
FILES="parse.js content.js styles.css icons/icon16.png icons/icon48.png icons/icon128.png LICENSE"

OUT="dist/${NAME}-${VERSION}.zip"
rm -f "$OUT"
zip -q -X "$OUT" manifest.json $FILES
echo "$OUT ($(du -h "$OUT" | cut -f1))  chrome/edge/dia"

STAGE=$(mktemp -d)
node -e '
const m = require("./manifest.json");
const ff = {
  manifest_version: 2,
  name: m.name, short_name: m.short_name, version: m.version, description: m.description,
  author: m.author, homepage_url: m.homepage_url, icons: m.icons,
  browser_specific_settings: { gecko: { id: "amazon-cart-price-changes@coursion.studio", strict_min_version: "109.0" } },
  content_scripts: m.content_scripts,
};
require("fs").writeFileSync(process.argv[1] + "/manifest.json", JSON.stringify(ff, null, 2) + "\n");
' "$STAGE"
FF="dist/${NAME}-${VERSION}-firefox.zip"
rm -f "$FF"
zip -q -X "$FF" $FILES
(cd "$STAGE" && zip -q -X "$OLDPWD/$FF" manifest.json)
rm -rf "$STAGE"
echo "$FF ($(du -h "$FF" | cut -f1))  firefox"
