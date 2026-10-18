# Advait Rege — Game Design Portfolio

A static portfolio website for game design, level design, and production-oriented work. The site uses a shared case-study template powered by `data/site.json`, so project cards and project pages can be maintained from one data source.

## Run locally

1. Extract the complete ZIP.
2. Open a terminal in the extracted folder.
3. Start a local static server, for example:
   - Python: `python -m http.server 8000`
4. Visit `http://localhost:8000`.

Opening `index.html` directly may prevent some browser features from working because the site loads `data/site.json` with `fetch()`.

## Main files

- `index.html` — homepage
- `projects.html` — project archive and filters
- `project.html?p=<project-id>` — shared case-study template
- `journal.html` — design journal
- `admin.html` — Studio/editor
- `data/site.json` — theme, project data, journal entries, and resume settings
- `js/site-runtime.js` — renders site content from the JSON data
- `js/studio.js` — editor/Studio behaviour
- `assets/images/` — project visuals and media
- `assets/docs/BeyondGuilt-GDD.pdf` — supplied Beyond Guilt design document

## Updating projects

Project cards and case studies are driven by `data/site.json`. Each project's `id` is used by its clean route under `Projects/<id>/`. When adding a project, add its record to the `projects` array and create a matching route wrapper folder.

The Resume button is retained, but no resume PDF was supplied for this update. Add the current PDF through Studio or configure the resume URL in the JSON data before sharing the portfolio with recruiters.

## Studio and publishing

The Studio's browser draft is local to that browser. Export or update the site data and commit the resulting files to the repository to publish changes. The Studio does not publish to GitHub Pages by itself.

## Validation notes

JavaScript syntax, JSON validity, referenced local media, and local route files were checked for this update. GitHub Pages deployment and every interactive editor workflow still require a live deployment/browser QA pass.
