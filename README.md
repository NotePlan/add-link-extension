# Send URL to NotePlan — Browser Extension

Captures the current tab's URL, wraps it in a Markdown link, and sends it to [NotePlan](https://noteplan.co) via x-callback-url. Supports both Chrome and Firefox (including Zen Browser).

## Structure

```
chrome/     — Chrome extension (Manifest V3)
firefox/    — Firefox/Zen extension (Manifest V2)
```

## Features

- Click the toolbar button (or press **Alt+Shift+G**) to compose a link
- Three input fields: text before, link text (defaults to page title with emails stripped), text after
- Configurable to-do prefix character (`*`, `+`, `1.`, or none)
- **Copy to Clipboard** or **Send to NotePlan** directly
- Custom callback URL support (e.g. for jgclark.QuickCapture plugin)

## Chrome

1. Open `chrome://extensions`, enable **Developer mode**
2. Click **Load unpacked** and select the `chrome/` folder

## Firefox / Zen Browser

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on...**
3. Select `firefox/manifest.json`

> Temporary add-ons are removed when Firefox restarts. For permanent install, see [firefox/README](#firefox-permanent-install) or sign via [addons.mozilla.org](https://addons.mozilla.org).

## Settings

Open the extension's options page to configure:

- **To-Do Character** — prefix added before the link
- **Override Callback URL** — use a custom x-callback-url for routing (e.g. QuickCapture plugin)
