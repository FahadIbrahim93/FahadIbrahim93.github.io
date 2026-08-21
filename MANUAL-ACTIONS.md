# Manual Actions Queue
*Run these when you return in 3 hours. All automation-blocked items are now ready.*

---

## 1. Fix carbonledger PR #50 merge conflict (1 min)
PR #50 is currently in a dirty/conflicted state because it wasn't rebased after upstream main advanced. The rebased branch is ready on your fork as `fix/audit-explorer-a11y` with commit `8554a3f`.

Run this exact command:
```bash
cd /h/AI/carbonledger-work && git push --force-with-lease origin fix/audit-explorer-a11y
```

After the push succeeds, PR #50 will automatically update and become mergeable. No need to create a new PR — just fix the existing one.

If you prefer the web UI: the branch is already pushed to your fork, so you can also just click "Update branch" on PR #50 if that button appears after the rebased commit is visible.

## 2. Record ONE demo video (~20 min, highest leverage)
Script ready: `demo-scripts/bugsmasher-demo-script.md`
- OBS Studio → 1080p60 following the 2-min script
- Upload YouTube (unlisted ok), embed link in `case-study-bugsmasher.html`
