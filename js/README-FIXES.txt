Studio recovery and workflow fixes

Replace js/studio.js and js/site-runtime.js with these files, then commit and push.

Fixes:
- Projects tab now selects and edits one project at a time; other project cards are not all expanded in the editor.
- Import projects now prompts for a single project from data/site.json and does not replace the entire project list.
- Existing site.json is used as the base, with browser draft changes layered over it. Empty/stale drafts no longer erase the remote project list.
- Matching saved projects are merged with site data to recover blank legacy fields and missing flexible blocks where possible.
- Legacy vision/challenge/solution/outcome/lessons fields remain editable for older case studies that have not been converted to flexible blocks.
- Carousel image uploads compress non-GIF images to 1500px maximum dimension and JPEG quality 0.76 to reduce browser storage pressure. GIFs preserve animation.
- Local draft storage quota errors are caught and reported instead of silently breaking editor interactions.

Important:
- Back up data/site.json and the current JS files before replacing them.
- The Studio draft is browser-local. Use Download site.json or Publish to GitHub after changes.
- Browser localStorage has limited capacity. For very large galleries, use optimized images or host images in assets/images and use their repository-relative paths/URLs instead of embedding large data URLs.
- Syntax validation (node --check) passed for both JavaScript files. Full live-browser/GitHub Pages testing was not available here.
