# BugSmasher — Prettier-clean tree + CI format gate (CQ-05)

**Status: fully prepared and verified. Blocked only by credential scope — the automated
session can read `FahadIbrahim93/BugSmasher-HopeTheory` but cannot push to it.**

## What this is

A 3-commit patch series that closes the last repo-side piece of formatting debt recorded
in the BugSmasher truth ledger (task **CQ-05**):

1. `style: format repository with Prettier (180 files)` — formatting only, zero behavior
   changes. Verified on this exact tree before committing: `tsc --noEmit` clean,
   ESLint 0 errors, **752/752 tests pass**, production build passes.
2. `ci: enforce prettier --check as a hard quality gate (CQ-05)` — adds a `format:check`
   step to the `quality` job in `.github/workflows/ci.yml`, right after eslint, so
   formatting debt cannot re-accumulate.
3. `docs: record CQ-05 resolution` — updates `docs/STATUS.md` baseline table and
   `README.md` next-priority line per the repo's "docs never outrun CI evidence" rule.

## How to apply (5 minutes, from any machine with write access)

```bash
git clone https://github.com/FahadIbrahim93/BugSmasher-HopeTheory.git
cd BugSmasher-HopeTheory
git checkout -b chore/prettier-clean-tree
git am /path/to/this/folder/patches/*.patch
git push -u origin chore/prettier-clean-tree
```

Then open the PR (GitHub will suggest it from the pushed branch), title it
`chore: Prettier-clean tree + CI format gate (CQ-05)`, and merge when CI is green.

## Why this matters for the portfolio

The portfolio (fahadibrahim93.github.io) now states: "BugSmasher is live with every CI
gate green (752 tests) — full release certification in progress." This patch removes the
last known red item (`prettier --check` FAIL) from the repo's own baseline table, moving
the 10/10 certification one gate closer — truthfully.

## Related one-click actions for the repo owner

- **PR #70** (`refactor(lint): ESLint warning burndown 910 → 357`) is MERGEABLE with all
  7 checks green but still marked **draft**. Open it → "Ready for review" → merge.
- **Branch protection on `main`** (P0-GOV-01): Settings → Branches → protect `main`
  (require the `quality` + `CodeQL` checks). Cannot be done via API without admin scope.
