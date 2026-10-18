Website Builder Studio Upgrade

Files to replace in your website repository:
- studio.js
- site-runtime.js

What's changed:
- Removed the project-level, always-present photo carousel from case-study rendering and the project editor.
- Carousel is now a flexible content-block type. Add a block, choose "carousel", then move it up/down to place it anywhere among the other blocks.
- Carousel block supports eyebrow/label, heading, contextual description, per-image alt text and captions, image reordering/removal, autoplay toggle, autoplay interval, slide/fade/zoom transitions, image height/fit, arrows, dots, and autoplay controls on the live page.
- Added flexible content blocks: quote, button/link, divider, and spacer.
- Added per-block background colour, content width, vertical spacing, and reveal animation controls.
- Existing multi-image legacy carousels are migrated into a flexible carousel block when the Studio loads. A single image that only duplicates the project cover is not migrated, to avoid recreating the unwanted permanent carousel.
- Improved carousel transitions, touch swiping, pause-on-hover/focus, and reduced-motion support.
- Existing content is still saved in the Studio's browser draft until you publish or download site.json.

Install:
1. Back up your current studio.js, site-runtime.js, and data/site.json.
2. Replace studio.js and site-runtime.js with the files in this archive.
3. Commit/push both JS files to GitHub.
4. Open the Studio, review project blocks, and download/publish site.json so migrated galleries are saved to the site data.
5. Hard-refresh the Studio and public site (Ctrl+Shift+R) after deployment.

Validation performed: both JavaScript files pass `node --check`. A full browser/GitHub deployment test was not available in this workspace.
