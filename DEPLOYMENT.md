# GitHub Pages deployment

This repository is a zero-build static site. The production URL is
https://fahadibrahim93.github.io/.

## Publishing model

- **Source branch:** `main`
- **Published branch:** `gh-pages`, repository root (`/`)
- **GitHub Pages mode:** legacy branch source
- **Workflow:** `.github/workflows/deploy-pages.yml`
- **Trigger:** every push to `main`, or a manual `workflow_dispatch`

The workflow checks out `main` and synchronizes the complete repository tree to
`gh-pages` with `JamesIves/github-pages-deploy-action`. It does not run a
framework build, install dependencies, or deploy application secrets. This
matches the current Pages setting and keeps the static asset paths unchanged.
Do not edit `gh-pages` manually; changes belong on `main`.

The featured LearnWebDev-AI project has its own independently deployed app at
https://fahadibrahim93.github.io/LearnWebDev-AI/. Its application repository
and Pages deployment are separate from this portfolio repository; verify that
URL before changing the portfolio card's live link.

## Repository settings

In **Settings → Pages**, keep **Build and deployment** set to **Deploy from a
branch**, branch `gh-pages`, folder `/ (root)`. The workflow uses the automatic
`GITHUB_TOKEN`; no custom secret is required. The workflow job needs repository
Actions permission to write contents, and branch protection must allow the
workflow to update `gh-pages`.

If the repository is changed to Pages' native Actions source, stop using this
workflow and replace it with an artifact-based `actions/upload-pages-artifact`
and `actions/deploy-pages` workflow. Do not change the Pages source and this
workflow independently.

## Local validation

Run from the repository root before pushing:

```powershell
$env:PYTHONIOENCODING = "utf-8"
python .\validate.py
git diff --check
```

The validator checks the static page tree, links, assets, and required
document structure. For a local browser check, run
`python -m http.server 8080` and open http://localhost:8080/.

## Confirming a deployment

1. Open the Actions tab and confirm **Deploy GitHub Pages** completed for the
   expected `main` commit.
2. Check that `gh-pages` points at the workflow's published commit.
3. Request `https://fahadibrahim93.github.io/?v=<commit>` and verify HTTP 200,
   the expected page title, and the changed content. GitHub's CDN can take a
   few minutes to invalidate older responses.

## Rollback and recovery

To roll back, identify the last known-good commit and publish it from a
temporary branch or revert the bad change on `main`, then merge/push to
`main`. The workflow will republish the resulting tree to `gh-pages`.

For an urgent recovery when `main` is known-good but Pages is stale, use the
Actions **Run workflow** button on `main`; do not force-push `gh-pages`.
If `gh-pages` was damaged, restore the last known-good `main` commit, run the
workflow manually, and confirm both the Pages deployment run and the live URL.
