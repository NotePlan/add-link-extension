## NotePlan URL Capture — Firefox/Zen Port Changes ##

[0.4] @dwertheimer
- Filter markdown-breaking characters ([ ] ( )) from the link text field — both
  the default page title and user-typed input are sanitized in real time
- Added descriptive hint below the link text field explaining the filtering
- Focus "Text before" field on popup open (with delay for Firefox popup rendering)
- Bump version to 0.4
- Bundle Tailwind CSS locally (no more CDN dependency) for Mozilla add-on review

[0.3] @dwertheimer
- Initial Firefox/Zen port of Chrome extension v0.3
- Architecture differences from Chrome version:
  - Manifest V2 (not V3) with browser_specific_settings for Gecko
  - Popup-based UI instead of injecting an iframe into the page. Chrome injects
    a full-screen iframe with the modal into the current tab via
    chrome.scripting.executeScript. This does not work in Firefox/Zen because:
    (a) MV2 uses browser.tabs.executeScript which cannot pass functions directly,
    (b) content script injection fails silently in Zen Browser
  - Protocol URL handling via <a>.click() instead of window.open() or
    browser.tabs.create(). Firefox/Zen does not trigger the OS protocol handler
    for noteplan:// URLs when opened programmatically via tabs.create() — the tab
    loads and closes without handing off to the OS. Simulating an anchor click
    from the popup context reliably triggers the handler.
  - browser.* promise-based APIs instead of chrome.* callback-based APIs
  - _execute_browser_action command (MV2) instead of _execute_action (MV3)
  - options_ui with open_in_tab instead of options_page
  - clipboardWrite permission added (required by Firefox for clipboard access)
  - No host_permissions or scripting permission needed (no content script injection)
- Ported features from Chrome v0.3:
  - removeEmail() function to strip email addresses from page titles
  - Same Tailwind CSS + NotePlan orange (#fb7d0e) styling
  - Same three-field form (text before, link text, text after)
  - Same to-do character prefix options (*, +, 1., none)
  - Same custom callback URL support (e.g. for jgclark.QuickCapture plugin)
  - Same Alt+Shift+G keyboard shortcut
  - Copy to clipboard with fallback (navigator.clipboard → execCommand)
