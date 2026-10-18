# Project instructions

- Hosting target: GitHub Pages only. Do not register, connect, synchronize or publish this project with another hosting provider unless the user explicitly requests it.
- The user configures GitHub Pages manually: Source = Deploy from a branch, branch = main, folder = /(root). Do not add custom deployment workflows or change the repository's hosting settings unless explicitly requested.
- The website lives directly at the repository root: `index.html`, `app.js`, `content.js`, `styles.css`, and `assets/`. Keep `.nojekyll` so Pages serves the static files directly.
- This is a static HTML/CSS/JavaScript project with no package dependencies and no build step. Edit the root website files directly; do not introduce a wrapper project folder or a build-output folder.
- From the repository root, validate with `npm run check` and `npm test`.
- Keep resource paths relative so the website works under a GitHub project URL as well as a custom domain. Keep section navigation based on URL fragments.
- Preserve the Valencian content and explicit pending-data markers. Follow the user's later content edits over the archived transcription.
