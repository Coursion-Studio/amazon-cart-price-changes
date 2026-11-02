#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./manifest.json').version")
NAME=$(node -p "require('./package.json').name")
DESC_LEN=$(node -p "require('./manifest.json').description.length")
if [ "$DESC_LEN" -gt 132 ]; then echo "manifest description is $DESC_LEN chars; the Chrome Web Store allows 132" >&2; exit 1; fi
node --check parse.js && node --check content.js
mkdir -p dist
OUT="dist/${NAME}-${VERSION}.zip"
rm -f "$OUT"
zip -q -X "$OUT" manifest.json parse.js content.js styles.css icons/icon16.png icons/icon48.png icons/icon128.png LICENSE
echo "$OUT ($(du -h "$OUT" | cut -f1))"
