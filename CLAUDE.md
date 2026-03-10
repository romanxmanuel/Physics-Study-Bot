# Physics Study Bot — Project Context

## What This Is
Single-file interactive study app for UCF Physics 2 (Chapters 20 & 21).
Covers electric current, Ohm's Law, circuits, Kirchhoff's rules, and RC circuits.

## Tech Stack
- Pure HTML/CSS/JS — zero dependencies, no build step, works offline
- Single file: index.html (entire app lives here)
- write_html.mjs: helper script used to write/update index.html

## File Structure
```
Physics Study Bot/
  index.html          ← entire app (LEARN, FORMULAS, PRACTICE, MOCK EXAM modes)
  write_html.mjs      ← generation helper
  docs/plans/         ← design docs
  Relevent Training Material/  ← source PPTX files (do not modify)
```

## Key Decisions
- No frameworks, no dependencies — must open directly in browser with no install
- Dark theme, mobile-friendly layout
- All 4 modes in one file: LEARN → FORMULAS → PRACTICE → MOCK EXAM
- Weak-topic tracker re-queues questions answered wrong 2+ times

## Commands
- Open: just open index.html in any browser
- No build, no server, no npm
- Regenerate index.html from scratch: `node write_html.mjs`
  - write_html.mjs builds index.html programmatically (string array pattern)
  - Edit write_html.mjs for structural/large changes, edit index.html directly for small tweaks

## Status
- No git repo yet — needs `git init` + initial commit before pushing to GitHub
