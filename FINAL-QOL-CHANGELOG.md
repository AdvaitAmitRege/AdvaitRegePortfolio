# Final website quality-of-life pass

## Layout and responsive behavior
- Expanded the usable canvas and replaced inconsistent outer spacing with fluid page gutters.
- Added breakpoints for large desktops, tablets, mobile phones, and narrow phones.
- Reduced mobile navigation/logo pressure, made project cards single-column on phones, and tightened case-study content widths.
- Added overflow protection for long titles, links, tags, and metadata.

## Timeline
- Standardized the public timeline to one vertical layout with stable spacing. Removed the visually unstable staggered desktop offsets from the final cascade.
- Kept the timeline generated from `data/site.json`, so Studio edits and public content use the same source.

## Studio consistency and editing workflow
- Published project and journal collections are generated from `data/site.json`, rather than leaving a competing hard-coded version in the page.
- Added a “Reload published site data” action in Studio history tools. It replaces the local draft with the repository’s current `data/site.json`; export a backup first if local work must be preserved.
- Editing fields now navigates the live preview to the relevant page/section for project, timeline, journal, resume, and theme-related edits. Adding, reordering, and deleting items also repositions the preview.
- Timeline layout is locked to the stable vertical layout to avoid reintroducing overlapping/uneven timeline states.

## URLs and discovery
- Added clean directory URLs for `/projects/`, `/journal/`, and each project at `/projects/<slug>/`. Legacy `.html` files remain available for compatibility.
- Added a custom 404 page, sitemap, canonical metadata, descriptions, and robots directives for editor pages.

## Performance and accessibility
- Converted 27 large raster images to WebP, preserving transparency where present; references were updated in HTML, CSS, JavaScript, and JSON. This reduced those image assets from about 56.4 MB to 6.9 MB.
- Added lazy loading/async decoding for non-hero images and visible keyboard focus styles. Reduced-motion and coarse-pointer rules remain in place.

## Validation performed
- JavaScript syntax checks passed for `js/studio.js` and `js/site-runtime.js`.
- `data/site.json` parses successfully.
- All eight project slugs have a clean route folder.
- HTML files were parsed for structural syntax.
- A full real-device/browser matrix and live GitHub Pages deployment test could not be completed in this environment; validate the deployed site on actual iOS/Android/tablet browsers before considering the visual QA fully signed off.

## Security caveat
- Studio stores drafts in browser local storage and does not publish directly to the server. The editor pages are marked `noindex` and disallowed in `robots.txt`, but static-site robots directives are not access control. Anyone who knows the URL can still open a static editor page; do not put secrets or credentials in the site data.

## Follow-up Studio/preview consistency fix
- Made `data/site.json` the canonical startup source for Studio. An older browser-local draft no longer silently overrides the published timeline or other public content on every Studio load.
- Automatically backs up a differing previous browser draft to Studio History before syncing to the published data, so it can be recovered rather than discarded.
- Added stable IDs to timeline entries and made preview targeting use those IDs instead of `nth-child()`. Timeline sorting can no longer cause the editor to jump to a different entry than the one being edited.
- Added persistent IDs to the published timeline data so the Studio and public renderer refer to the same milestones.


## Final content/navigation refinement
- Renamed the public timeline to **Personal Timeline** and updated the Studio panel language to match. The underlying data remains intact.
- Reordered existing homepage sections to: Hero, About, Featured Projects, Design Capabilities, Personal Timeline, Design Journal, Contact. No homepage sections or content blocks were intentionally added or removed.
- Replaced the long list of raw project tags in the archive filter with five curated navigation groups: Game Design, Level Design, Tabletop, Prototypes, and Industry Experience. Original tags and categories remain searchable through the search field.
- Added a result count, clear-filters action, accessible pressed states, and an empty-results message to make archive navigation easier.


## Final content/navigation refinement
- Renamed the public timeline to **Personal Timeline** and updated the Studio panel language to match. Existing timeline records are retained.
- Reordered existing homepage sections to: Hero, About, Featured Projects, Design Capabilities, Personal Timeline, Design Journal, Contact. No sections or content blocks were intentionally added or removed.
- Replaced the long list of raw project tags in the archive filter with five curated navigation groups: Game Design, Level Design, Tabletop, Prototypes, and Industry Experience. Original detailed tags remain searchable.
- Added a live result count, clear-filters action, accessible pressed states, and an empty-results message.
