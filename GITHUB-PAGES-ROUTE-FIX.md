# GitHub Pages routing fix (flat-file fallback)

## Why this build changes routing
The live site returns the custom 404 for `/projects/`, while the same project works through VS Code Live Server. That means the route being requested is not being served as expected by the deployed Pages build. The exact deployment setting/repository state cannot be verified from the screenshot alone. To remove the fragile dependency on directory routes, all public navigation now uses root-level files that the static host can serve directly.

## Routes in this build
- Project archive: `projects.html`
- Project case studies: `project.html?p=<project-id>`
- Journal: `journal.html`
- Homepage: `index.html`

The old `projects/<slug>/` redirect pages are retained for compatibility, but the website no longer depends on them for navigation. A `.nojekyll` marker is included so GitHub Pages serves the static folder tree without Jekyll processing conventions.

## Publish safely
1. Download and extract this ZIP into a new folder.
2. Back up the existing GitHub repository.
3. Copy the complete contents of this folder into the repository root, including hidden files such as `.nojekyll`. Do not copy the ZIP itself into the repository.
4. On Windows, verify the root contains `index.html`, `projects.html`, `project.html`, `js/`, `css/`, `data/`, `assets/`, and `.nojekyll`.
5. Commit and push. Wait until **Settings → Pages** or the Actions deployment workflow reports success.
6. Test `https://advaitrege.design/projects.html` and `https://advaitrege.design/project.html?p=lab-1995` first. These are the reliable routes in this build.
7. If those root-level routes also show the custom 404, the deployed Pages source/branch or workflow is not publishing these root files; verify **Settings → Pages → Build and deployment → Source** and the latest deployment commit. Replacing site links alone cannot fix a deployment source mismatch.
