# Portfolio recovery and integration

## What was fixed

- Rebuilt `data/site.json` from the five existing standalone case-study HTML pages, so the Studio and the public dynamic case-study route now have real project records instead of an empty project array.
- Converted the source pages' headings, explanatory text, card content and images into editable flexible blocks. Existing standalone HTML files were preserved unchanged.
- Added `sourcePage` metadata to each migrated project. The Studio displays the source path and has a **Preview original HTML** control, and the page selector can preview those legacy pages directly.
- Kept the public project cards routed through `project.html?p=<id>`, which now renders from the recovered Studio data. The original HTML pages remain available as separate files.
- Fixed root-relative URL handling in `js/site-runtime.js`, preventing `/...` assets from being incorrectly prefixed with the site root.
- Fixed `js/project-content.js` so responsibility/process edits target their own cards/stages instead of the first matching element on the whole document; malformed legacy localStorage data no longer crashes the script.
- Added `recovery-backup/site.json.before-project-recovery.json` for rollback.

## Project mapping

- Lab-1995 → `Projects/lab-1995.html`
- FPS Shooter → `Projects/FPS-Shooter.html`
- Railway Simulator → `Projects/Railway-Simulator.html`
- The Fleshbound Curse → `Projects/TheFleshboundCurse.html`
- The Wrong Floor → `Projects/the-wrong-floor.html`

## Install

1. Back up your repository before replacing it.
2. Extract this ZIP and replace the files in your repository with the included website files.
3. Commit and push the changed files to GitHub.
4. Open `admin.html` through the hosted site (not `file://`) so `fetch()` can load `data/site.json`.
5. Open Studio → Projects. Select a project from the selector. Existing projects should now be listed and editable as flexible blocks.
6. Review each project preview and publish/download `data/site.json` after making changes.

## Notes / limitations

- The original standalone HTML case studies are preserved; the migration copies their content into the Studio's flexible-block data rather than deleting or rewriting those files.
- The migrated flexible blocks are a content reconstruction, not a pixel-perfect HTML-to-block conversion. Some complex custom visual compositions may differ on `project.html`; use **Preview original HTML** to compare with the source page.
- The original site data backup is stored in `recovery-backup/`.
- Static validation passed: all JavaScript files pass Node syntax checks, and local HTML/CSS asset references resolve. A real browser session and GitHub Pages deployment were not available for end-to-end visual validation.


Studio workflow note: editing saves automatically to this browser's local draft. Export a JSON backup from Save & History, then commit and push repository changes manually; the Studio does not publish directly to GitHub.
