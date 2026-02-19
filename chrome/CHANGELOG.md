## NotePlan URL Capture Changes ##

[0.4] @dwertheimer
- Filter markdown-breaking characters ([ ] ( )) from the link text field — both
  the default page title and user-typed input are sanitized in real time via
  stripMarkdownLinkChars()
- Added descriptive hint below the link text field explaining the filtering
- Bump version to 0.4

[0.3] @dwertheimer
- Exclude email addresses from Gmail link titles (removeEmail)
- iframe-based modal with Tailwind CSS styling and NotePlan orange branding

[1.2] @dwertheimer
- Add "copy to clipboard"
- Add before and after link input fields

[1.1] @dwertheimer
- Initial testing release (after fixing all URLs in manifest)