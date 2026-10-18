# Studio preview consistency fix

The Studio now starts from `data/site.json`, the same published data source used by the public site. Previously, a saved browser draft could silently override published timeline and content data, making the preview look different from the public site.

If a previous browser draft differs from the published data, the Studio saves a copy in History before loading the published version. Recover it from Studio > History if needed. This is intentional to prevent stale browser data from being mistaken for the website's current content.

Timeline items now have stable IDs. The Studio preview focuses the item by ID instead of using its visual position (`nth-child`), which was incorrect when the timeline renderer sorts entries by date.

Note: edits in Studio remain a local draft until you export the updated `site.json` and publish it with the website. This package does not add automatic GitHub deployment or authentication to the static Studio.
