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
- **Text**: click any text in the preview, type, click away. Revert from the list.
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
