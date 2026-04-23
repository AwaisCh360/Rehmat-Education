#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
COOKIES_FILE="$ROOT_DIR/Cookies.txt"
TARGET_URL="https://partner.unitededucation.com/Manage/test?termid=a1ZP2000004F0JxMAK"

if [[ ! -f "$COOKIES_FILE" ]]; then
  echo "Cookies file not found: $COOKIES_FILE" >&2
  exit 1
fi

COOKIE_HEADER="$(node - "$COOKIES_FILE" <<'NODE'
const fs = require('fs');
const path = process.argv[2];
const raw = fs.readFileSync(path, 'utf8');
const cookies = JSON.parse(raw);
const header = cookies
  .filter((cookie) => cookie && typeof cookie.name === 'string' && typeof cookie.value === 'string')
  .filter((cookie) => cookie.domain === 'partner.unitededucation.com' || cookie.domain === '.unitededucation.com')
  .map((cookie) => `${cookie.name}=${cookie.value}`)
  .join('; ');
process.stdout.write(header);
NODE
)"

if [[ -z "$COOKIE_HEADER" ]]; then
  echo "No valid cookies found for partner domain." >&2
  exit 1
fi

echo "Requesting: $TARGET_URL"
echo "---"

RESPONSE_FILE="$(mktemp)"
HEADER_FILE="$(mktemp)"

curl -sS \
  -D "$HEADER_FILE" \
  -o "$RESPONSE_FILE" \
  -H 'accept: */*' \
  -H 'accept-language: en-GB,en-US;q=0.9,en;q=0.8' \
  -H 'x-requested-with: XMLHttpRequest' \
  -H 'referer: https://partner.unitededucation.com/Manage/ProgramSearch' \
  -H "cookie: $COOKIE_HEADER" \
  "$TARGET_URL"

STATUS_LINE="$(head -n 1 "$HEADER_FILE" | tr -d '\r')"
CONTENT_TYPE="$(grep -i '^content-type:' "$HEADER_FILE" | tail -n 1 | tr -d '\r')"
BODY_SIZE="$(wc -c < "$RESPONSE_FILE" | tr -d ' ')"
PREVIEW="$(head -c 600 "$RESPONSE_FILE" | tr '\n' ' ')"

echo "$STATUS_LINE"
echo "$CONTENT_TYPE"
echo "body-bytes=$BODY_SIZE"
echo "preview=${PREVIEW}"

echo "---"

echo "Quick shape check:"
node - "$RESPONSE_FILE" <<'NODE'
const fs = require('fs');
const body = fs.readFileSync(process.argv[2], 'utf8');
try {
  const json = JSON.parse(body);
  if (json && typeof json === 'object' && !Array.isArray(json)) {
    const keys = Object.keys(json);
    console.log('json-type=object');
    console.log('keys=' + keys.slice(0, 10).join(','));
    if (Array.isArray(json.records)) {
      console.log('records=' + json.records.length);
      if (json.records[0]) {
        console.log('first-record-keys=' + Object.keys(json.records[0]).slice(0, 12).join(','));
      }
    }
  } else if (Array.isArray(json)) {
    console.log('json-type=array');
    console.log('length=' + json.length);
  } else {
    console.log('json-type=' + typeof json);
  }
} catch (error) {
  console.log('json-parse=failed');
}
NODE

rm -f "$RESPONSE_FILE" "$HEADER_FILE"
