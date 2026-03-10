# Physics 2 Study Bot — Design Doc
**Date:** 2026-03-03
**Exam:** Exam 2 — Chapters 20 & 21, 16 MC questions, formula sheet provided

---

## Context
- User has zero prior knowledge of the topics
- Exam in a few days — needs to learn AND practice under time pressure
- Source material: Ch20.pptx, Study Set Ch20.pptx, Ch21.pptx, Study Set Ch21.pptx
- Exam format: 16 multiple choice, scientific calculator allowed, formula sheet provided

---

## Architecture
Single `index.html` file — pure HTML/CSS/JS, no dependencies, no server, works offline.
Open in any browser. No install.

---

## Modes (sequential, each builds on the last)

### 1. LEARN
- Concept cards, one topic at a time, click "Next" to advance
- Plain-English explanations with water-pipe analogies for electricity
- No formulas until the concept is established
- Chapter 20 topics in order:
  - What is electric current? (flow of charge, I = ΔQ/Δt)
  - Conventional vs. electron flow
  - Drift velocity
  - Ohm's Law (V = IR)
  - Resistance and resistivity (R = ρL/A)
  - Electric power (P = IV = V²/R = I²R)
  - AC vs DC
  - RMS values (I_rms, V_rms, average power)
  - Electrical hazards (thermal, shock)
- Chapter 21 topics in order:
  - Series resistors (same current, voltages add)
  - Parallel resistors (same voltage, currents add)
  - Mixed series-parallel circuits
  - EMF and internal resistance / terminal voltage
  - Ammeters and voltmeters (ideal behavior)
  - Kirchhoff's Junction Rule (charge conservation)
  - Kirchhoff's Loop Rule (energy conservation)
  - RC circuits — charging (V = emf(1−e^−t/RC))
  - RC circuits — discharging (V = V₀e^−t/RC)
  - Time constant τ = RC

### 2. FORMULAS
- One card per formula from the official exam sheet
- Each card shows: formula → each variable defined → units → plain-English meaning
- Ch 20: I=ΔQ/Δt, I=nqAv_d, I=V/R, R=ρL/A, A=πr², P=IV=V²/R=I²R, I/V sinusoids, I_rms, V_rms, P̄
- Ch 21: R_s, 1/R_p, Kirchhoff junction/loop, V=emf(1−e^−t/RC), V=V₀e^−t/RC, τ=RC

### 3. PRACTICE
- ~50 MC questions sourced from PPTX lecture slides and Study Set problems
- Categories: Conceptual, Calculation (Ch20), Calculation (Ch21)
- After each answer: immediate feedback + explanation of why (even if correct)
- Weak-topic tracker: topics answered wrong ≥2 times get flagged and re-queued
- Can filter by chapter or topic

### 4. MOCK EXAM
- 16 random MC questions drawn from the full question bank
- Formula sheet sidebar visible (matching actual exam)
- Timer (optional)
- End screen: score, per-topic breakdown, review all answers

---

## UI
- Dark theme, large readable text
- Progress bar in all modes
- Mobile-friendly layout
- Sidebar formula sheet always accessible during Practice and Mock Exam

---

## File Structure
```
Physics Study Bot/
  index.html          ← entire app
  docs/plans/         ← this doc
```
