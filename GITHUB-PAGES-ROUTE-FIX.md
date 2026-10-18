# GitHub Pages route fix

The original package contained both `Projects/` and `projects/`. These differ only by letter case, which can conflict on Windows filesystems and Git clients. That can prevent the lowercase `/projects/` route from being committed or deployed reliably.

## Changes
- The legacy source HTML and its stylesheet have been moved from `Projects/` to `legacy-project-pages/`.
- The Studio `sourcePage` references and `project.html` stylesheet reference now point to the new lowercase-safe location.
- `projects/index.html` now uses the same current archive markup as `projects.html`, with root-relative CSS and JavaScript references.
- Individual project routes remain under lowercase `projects/<slug>/`.

## Publish safely
1. Extract this ZIP into a fresh folder (do not merge it over the old files).
2. Copy the full extracted contents into the repository working tree.
3. Confirm Git shows `projects/index.html` as a tracked/new file and `legacy-project-pages/` in place of `Projects/`.
4. Commit and push.
5. In GitHub, verify Pages has deployed the latest commit.
6. Test `https://advaitrege.design/projects/` and `https://advaitrege.design/projects/lab-1995/`. If a cached 404 remains after deployment, hard-refresh or test in a private window.
