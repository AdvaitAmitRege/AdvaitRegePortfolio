# Site Studio guide

## 1. Install (once)
1. Copy `admin.html` to your repo root and `js/site-runtime.js` into your repo's `js/` folder.
2. Add this line before `</body>` in `index.html`, `journal.html`, `projects.html`, `resume.html`:
   `<script src="js/site-runtime.js"></script>`
   (In `Projects/*.html` use `../js/site-runtime.js`.)
3. Add `admin.html` to `.gitignore` so the studio never goes public.
4. Commit and push `js/site-runtime.js` and the HTML edits.

## 2. Open the studio
In the repo folder run `python -m http.server`, then open `http://localhost:8000/admin.html`.
Your site shows on the right as a live preview. Pick any page from the dropdown.

## 3. Connect GitHub (Publish tab)
Create a fine-grained token (GitHub > Settings > Developer settings) limited to your repo, with Contents: Read and write.
Enter owner, repo, branch and token. They are saved only in this browser.

## 4. Tabs
- **Theme**: six colours, three fonts, text size. Applies to the whole site.
- **Text**: click any text in the preview, type, click away. Use the formatting toolbar for bold, italic, underline, font, colour, and size. Revert from the list.
- **Journal**: add, edit, reorder (Up/Down), delete. First entry shows first. Use "Import existing entries" once to bring your 7 current entries in.
- **Projects**: use "Import my 5 existing projects" once. Then edit, reorder, delete or add projects. The top 3 are featured on the home page.
  Each project takes screenshots, videos (.mp4/.webm), and YouTube or Vimeo links, one per line. Use the upload button or paste a path or URL.
- **Notes**: "Add note" for handwritten-style text, "Draw a note" for freehand sketches. Drag them anywhere in the preview.

## 5. Publish
Press **Publish to GitHub**. It commits `data/site.json` and `project.html`. The site updates in about a minute.
Your work is also auto-saved as a draft in this browser. "Download site.json" gives you a backup.

## Good to know
- Uploads commit straight to the repo (`assets/images/custom/`). Keep files under about 25 MB; use YouTube/Vimeo for long videos.
- After importing, imported projects open on `project.html?p=...` (a unified layout). Your old `Projects/*.html` files stay in the repo, unlinked.
- Imported journal entries use the standard card layout, so the diagram in entry 02 is not carried over.
- Text edits are matched by position; if you later restructure a page's HTML by hand, re-check them.

## Security boundary
- `admin.html` is a local Studio and is ignored by git. Remove it from the repository index with `git rm --cached admin.html` if it was tracked before `.gitignore` was added.
- GitHub Pages is static hosting: it cannot enforce a password or authorization on browser code. Do not deploy the Studio if you need real access control.
- The Studio keeps the GitHub token in session storage only and never writes it into `site.json`. Use a fine-grained token limited to this repository with the smallest required permissions, then close the Studio tab when finished.
- For real admin authentication, host the Studio behind GitHub OAuth, a server-side session, or a protected deployment such as Cloudflare Access, Netlify Identity, or a private VPN.


Studio workflow note: editing saves automatically to this browser's local draft. Export a JSON backup from Save & History, then commit and push repository changes manually; the Studio does not publish directly to GitHub.


## Updated Studio workflow

1. Run the project with a local web server from the repository root, for example `python -m http.server 8000`.
2. Open `http://localhost:8000/admin.html`. Do not open `admin.html` directly as a `file://` URL; the Studio reads `data/site.json` with `fetch`.
3. Use **Projects** to edit one case study at a time, add design fields, tags, and flexible blocks. Use **Timeline** for personal development milestones and **Resume** to set a PDF.
4. Use **Undo/Redo** for recent editor actions and **Save & History** to download a backup or restore a local snapshot. Local history belongs to that browser and computer.
5. Select **Download current draft**. Replace `data/site.json` with the downloaded JSON, test the site locally, then commit and push the changed files to GitHub Pages.
6. For media, prefer committed paths such as `assets/images/example.webp` or `assets/video/example.webm` for larger files. Small media can be embedded from Studio; browser localStorage has a quota. WebM alpha transparency depends on codec and browser support.
7. The Resume tab can embed PDFs up to 2 MB. For larger PDFs, add the PDF to the repository and set its path in Studio. The resume button will download that file.

The public project archive and individual case studies are generated from `data/site.json`. Project detail pages use one shared template; pretty project routes are thin wrappers for clean URLs and old `.html` paths remain redirects for compatibility.


## Portfolio refinement build
- The homepage now presents Featured Projects before the Design Journal.
- Shared navigation uses a consistent left-brand / right-navigation layout.
- Project cards use a unified image-led layout with responsive metadata and wrapped headings.
- Project detail blocks use tighter, more consistent vertical rhythm.
- The Studio keeps its existing editing tools and adds a clearer workspace hierarchy, accessible focus states, improved responsive layout, and more legible block/layout controls.
- Chapter numbering follows the homepage order: Featured Projects (Chapter 03), Design Journal (Chapter 04). The standalone journal uses Chapter 04.
