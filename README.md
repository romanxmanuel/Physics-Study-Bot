# Physics Study Bot

An interactive physics study app focused on electric current, resistance, circuits, Kirchhoff's rules, and RC circuits. It is designed as a fast, no-install study tool that runs entirely in the browser from a single HTML file.

This project started as a practical exam-prep tool and evolved into a more engaging learning experience with progression mechanics, weak-topic reinforcement, and a mock-exam flow.

## Live Project

Live URL: [physics-study-bot.vercel.app](https://physics-study-bot.vercel.app)

## Why I Built It

Most study tools for intro physics either feel static or require more setup than they are worth for a student under time pressure. I wanted something that:

- opens instantly with no install
- works offline
- explains concepts in plain English
- reinforces weak areas automatically
- feels engaging enough to keep someone in focused study mode

## What It Does

- `Learn` mode teaches the core ideas with plain-language explanations and analogies
- `Formulas` mode breaks down the equations with variables, units, and meaning
- `Practice` mode runs a question bank with feedback, explanations, and weak-topic requeueing
- `Mock Exam` mode gives a timed 16-question run with a built-in formula sheet
- gamification adds streaks, XP, levels, achievements, boss rounds, and a focus HUD
- progress persists in `localStorage`

## Technical Highlights

- pure `HTML`, `CSS`, and vanilla `JavaScript`
- no framework, no bundler, no runtime dependencies for the app itself
- single-file architecture in `index.html`
- static hosting friendly, including Vercel
- question/content system stored as JavaScript data objects
- state-driven mode rendering with no external libraries

## Product Decisions

- kept the app single-file to minimize friction and make deployment trivial
- used a dark, mobile-friendly UI so it feels good in long study sessions
- designed the feedback loop around momentum: correct streaks, focused challenge, and immediate explanations
- prioritized utility over flashy effects, so every interaction either teaches, tests, or reinforces

## Project Structure

```text
Physics Study Bot/
|- index.html
|- write_html.mjs
|- extract_pptx.js
|- package.json
`- Relevent Training Material/   (ignored from Git)
```

## Running It Locally

You can open the app directly:

```bash
start index.html
```

Or serve it locally if you want a browser-based dev workflow:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

This app is static and deploys cleanly to Vercel with no build step.

- Framework preset: `Other`
- Build command: leave empty
- Output directory: leave empty

## Source Material

The study content was built from personal course materials for UCF Physics 2 coverage around:

- electric current
- Ohm's law
- resistance and resistivity
- power
- series and parallel circuits
- Kirchhoff's rules
- emf and internal resistance
- RC charging and discharging

The raw training files are intentionally excluded from the public repo.

## Future Improvements

- add answer review filters by topic and chapter
- add a dedicated mastery dashboard
- add animations and sound design carefully, without harming clarity
- broaden the content set beyond the current exam scope

## License

This project is released under the MIT License. See `LICENSE`.
