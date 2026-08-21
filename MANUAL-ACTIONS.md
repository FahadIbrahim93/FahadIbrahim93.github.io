# Manual Actions Queue — 5 minutes total
*Everything automation cannot do. Do these when you're back.*

---

## 1. Pin 6 repos on your GitHub profile (2 min)
GitHub has **no API** for pinning profile repos (verified against the full GraphQL mutation schema — only pinEnvironment/pinIssue/pinIssueComment exist). Must be done in the UI:

1. Go to https://github.com/FahadIbrahim93
2. Click "Customize your pins" (top-right of the pinned section)
3. Select these 6 (in this order — best first):
   - ☑ BugSmasher-HopeTheory
   - ☑ RollON-MVP-Final-V1
   - ☑ jgmart-hermes
   - ☑ viral-pet-nix
   - ☑ fahadibrahim93.github.io
   - ☑ FahadIbrahim93 (profile README repo)

Currently pinned: only RollON + BugSmasher (2 of 6 slots used).

## 2. Submit the carbonledger PR (1 min)
1. Sign into GitHub in the Edge browser profile (it's currently signed out)
2. Go to: https://github.com/milah-247/carbonledger/compare/main...FahadIbrahim93:fix/audit-explorer-a11y
3. Click "Create pull request"
4. Title/body are pre-drafted in `/h/AI/carbonledger` commit history and `/tmp/oss-contribution-handoff.md`

Why CLI can't do it: your PAT lacks `createPullRequest` scope on third-party repos.

## 3. Record ONE demo video (~20 min, highest leverage)
Script is ready: `demo-scripts/bugsmasher-demo-script.md`
- OBS Studio → record 1080p60 following the 2-min script
- Upload to YouTube (unlisted ok), embed link in `case-study-bugsmasher.html` replacing the "Coming Soon" placeholder

Do BugSmasher first — it's your strongest story (678 tests + anti-cheat).

---

## Already done by automation (no action needed)
- ✅ Repo topics: jgmart-hermes (7), BugSmasher (7), viral-pet-nix (4)
- ✅ BugSmasher description updated 237→678 tests, homepage URL fixed
- ✅ Portfolio repo README rewritten recruiter-facing
- ✅ Profile repo homepage → portfolio site
- ✅ Content queue: week-1 X + LinkedIn posts ready in `content-queue/`
