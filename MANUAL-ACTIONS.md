# Manual Actions Queue

## Resolved (no action needed)

- **ElizaOS PR #24572** — CLOSED by maintainer `lalalune` on 2026-08-22 as **superseded**: the three files it deleted were already removed from `develop` by merged PR #24201. There is nothing left to submit; do **not** re-open or re-submit the branch (it was deleted from the fork). The original "browser submission failure" is moot.
- **carbonledger #50** (`milah-247/carbonledger`) — still open on the upstream repo as of 2026-10-22, awaiting maintainer review. No further action until review arrives. This is now the only open OSS PR from FahadIbrahim93.

## Still open (needs repo owner, ~5 minutes)

1. **BugSmasher PR #70** (`refactor(lint): ESLint warning burndown 910 → 357`) — **RESOLVED**: merged into `main` (verified 2026-10-22). No action needed.
2. **BugSmasher branch `chore/prettier-clean-tree`** — a 3-commit ready-to-apply patch series (Prettier-clean tree + CI format gate + truth-doc sync) lives in this repo under `handoff/bugsmasher-prettier/`. Apply instructions in `handoff/bugsmasher-prettier/README.md`.
3. **Branch protection on BugSmasher `main`** (P0-GOV-01) — requires admin Settings → Branches; API scope not available to automated tooling.

## Previous successes
- carbonledger #50: open and mergeable
- ElizaOS #24572: closed by maintainer (superseded) on 2026-08-22

## Portfolio CI status — verified 2026-10-22

The portfolio page claims on CI are now only what the workflows actually show.

| Repo | Workflow | State | Detail |
|---|---|---|---|
| BugSmasher-HopeTheory | Security Audit | GREEN since Oct 22 | fixed in 2b6bf70 via npm overrides + firebase-admin 13 |
| BugSmasher-HopeTheory | CI / CodeQL | green | 752/752 unit tests pass, 81.9% line coverage, all 5 workflows green |
| RollON-MVP-Final-V1 | CI | green (last run Aug 18) | 115 unit + 21 Playwright = 136 tests, 88% statements |
| jgmart-hermes | CI | RED since Aug 18 | bandit security scan + black formatting check fail |
| viral-pet-nix | gauntlet | RED since Sep 15 | deploy job still succeeds |
| emberfall | CI | green (Oct 19) | 46-step gate chain |
| emberfall | Mirror stats refresh | retired Oct 23 | replaced by live Supabase boards (emberfall #25) |

These need repo owners, not portfolio edits:
1. ~~**BugSmasher Security Audit**~~ — **RESOLVED 2026-10-22**: fixed in commit 2b6bf70. Root tree pinned `@grpc/grpc-js` to 1.14.6 and `source-map-js` to 1.2.2 via npm overrides; functions tree bumped `firebase-admin` to 13.10.0 and pinned `proxy-addr` to 2.0.8. Both audit steps now report zero high/critical and all five workflows are green.
2. **jgmart-hermes CI** — bandit finding plus black formatting. Both are mechanical to fix; the bandit finding may be a real issue.
3. **viral-pet-nix gauntlet** — the workflow has failed on every run since Sep 15 while the Pages deploy succeeds. Either fix the gauntlet or remove it.
4. ~~**emberfall mirror stats refresh**~~ — **RESOLVED 2026-10-23**: the workflow and the old mirror were retired. Accounts and global/daily boards now run on Supabase (emberfall #25) and are live, so the portfolio now mentions them.
