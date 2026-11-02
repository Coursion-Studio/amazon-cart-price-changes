#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./manifest.json').version")
NAME=$(node -p "require('./package.json').name")
ZIP="dist/${NAME}-${VERSION}.zip"
[ -f "$ZIP" ] || scripts/package.sh >/dev/null
SRC="build/safari-src"
rm -rf "$SRC" && mkdir -p "$SRC" && unzip -q -o "$ZIP" -d "$SRC"
rm -rf safari
xcrun safari-web-extension-converter "$SRC" \
  --project-location safari \
  --app-name "Cart Price Changes for Amazon" \
  --bundle-identifier studio.coursion.cartpricechanges \
  --macos-only --copy-resources --no-open --no-prompt --force >/dev/null
rm -rf "$SRC"
PROJECT=$(ls -d safari/*/*.xcodeproj | head -1)
for f in "$PROJECT/project.xcproj" "$PROJECT/project.pbxproj"; do
  [ -f "$f" ] && sed -i '' -e 's#"PRODUCT_BUNDLE_IDENTIFIER": "studio.coursion.Cart-Price-Changes-for-Amazon"#"PRODUCT_BUNDLE_IDENTIFIER": "studio.coursion.cartpricechanges"#' -e 's#PRODUCT_BUNDLE_IDENTIFIER = studio.coursion.Cart-Price-Changes-for-Amazon;#PRODUCT_BUNDLE_IDENTIFIER = studio.coursion.cartpricechanges;#' "$f"
done
echo "generated $PROJECT"
if [ "${SAFARI_BUILD:-1}" = "1" ]; then
  XCB="${XCB:-xcodebuild}"
  "$XCB" -project "$PROJECT" -scheme "Cart Price Changes for Amazon" -configuration Release -derivedDataPath build/safari-derived \
    CODE_SIGNING_ALLOWED=NO CODE_SIGN_IDENTITY= build 2>&1 | grep -E "BUILD SUCCEEDED|BUILD FAILED|error:" | head -5
fi
