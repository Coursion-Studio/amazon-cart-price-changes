#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./manifest.json').version")
NAME=$(node -p "require('./package.json').name")
URL="https://github.com/Coursion-Studio/${NAME}/releases/download/v${VERSION}/${NAME}-${VERSION}.zip"
TAP="${TAP:-$(brew --repo coursion-studio/tools)}"
FORMULA="$TAP/Formula/${NAME}.rb"
TMP=$(mktemp)
curl -sfL "$URL" -o "$TMP" || { echo "release asset not found: $URL (publish the GitHub release first)" >&2; exit 1; }
SHA=$(shasum -a 256 "$TMP" | cut -d' ' -f1)
rm -f "$TMP"
sed -i '' -e "s#^  url \".*\"#  url \"${URL}\"#" -e "s#^  sha256 \".*\"#  sha256 \"${SHA}\"#" "$FORMULA"
echo "$FORMULA -> ${VERSION} ${SHA}"
echo "next: cd \"$TAP\" && git commit -am \"${NAME} ${VERSION}\" && git push"
