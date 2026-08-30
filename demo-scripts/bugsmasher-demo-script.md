# BugSmasher Demo Script
**Duration**: 2-3 minutes  
**Tone**: Energetic, technical, confident  
**Target**: Recruiters, game devs, tech leads

## Opening (0:00-0:15)
"Hi, I'm Fahad Ibrahim. This is BugSmasher — a production-grade arcade game built with React 19, TypeScript, and Firebase. It has custom 60fps canvas rendering, server-authoritative anti-cheat leaderboards, and tests plus CI tracked in the repo STATUS.md ledger — not a live certified 678-passing claim."

## Show: Gameplay (0:15-0:45)
- Screen recording of actual gameplay
- Show keyboard controls (arrow keys, space)
- Show XP progression and achievements
- Show leaderboard submission
- Highlight accessibility: reduced-motion mode, colorblind support

## Show: Code Architecture (0:45-1:30)
- Show game loop in `src/engine/game-loop.ts`
- Show state management in `src/state/`
- Show test file: `src/engine/game-loop.test.ts`
- Highlight: "Zero runtime dependencies — everything is custom-built"

## Show: Testing (1:30-1:50)
- Terminal: `npm test` — show whatever STATUS.md currently records, not a frozen 678
- Show coverage report as a snapshot (~79% lines in the last ledger)
- Show CI pipeline honestly: do not claim green if STATUS.md says otherwise

## Closing (1:50-2:00)
"BugSmasher demonstrates production-grade game architecture, comprehensive testing, and accessibility-first design. The full case study is on my portfolio. Thanks for watching."

## Recording Tips
- Use OBS Studio or ScreenFlow
- Record at 1080p, 60fps
- Add subtle zoom on code sections
- Include keyboard sound effects
- Add captions for accessibility
