# LinkedIn Content Queue — Week 1
*Drafted 2026-08-22. LinkedIn rewards longer narrative + no external links in first pass (put link in comments).*

---

## Post 1 — Monday (the full BugSmasher story)
**Format: narrative, ~150 words**

I shipped an arcade game with a leaderboard — then realized I'd built a cheating magnet.

Any client-side score can be forged with devtools. So I redesigned it: scores are never written by the client. The server issues one-time session tokens that expire and are consumed atomically. Replaying a captured submission does nothing.

Then I wrote tests for the attacks: token replay, expiry, cross-user use, score plausibility. 678 tests total, run on every commit.

The lesson generalizes beyond games: **treat any user-writable value as a security surface.**

Full architecture breakdown in the comments. 👇

---

## Post 2 — Wednesday (the JG Mart constraint story)
**Format: story, ~130 words**

My best product decision was refusing to build an app.

JG Mart delivers groceries to 1,700 families in Japan Garden City, Dhaka. The obvious move was an app. The right move was realizing nobody wanted one — they already live in WhatsApp.

So: ordering happens natively in WhatsApp. A lightweight PWA handles the catalog and works offline after first load (Dhaka networks demand it). Zero download friction. Zero app-store gatekeeping.

Sometimes the best architecture is the one that respects how people already behave.

Case study in the comments. 👇

---

## Post 3 — Friday (the AI workflow post)
**Format: contrarian take, ~120 words**

Unpopular opinion: "AI-assisted development" is a misleading phrase.

The value isn't AI writing your code. It's AI deleting the boring middle — scaffolding, boilerplate, first-draft tests — so your attention goes where it actually matters: architecture, edge cases, security surfaces.

My delivery time dropped ~60% across 4 shipped products. Not because I type faster, but because I stopped spending attention on work a machine does better.

The quality gates stayed. The gates are the point.

What's your split between AI work and human work?

---

## Engagement notes
- Post 8:30–10:30am BD time (catches EU morning, US late night scroll)
- Put article links in first comment, not the post
- Ask one question per post — comments outweigh likes for reach
- Respond to every comment within 2 hours
