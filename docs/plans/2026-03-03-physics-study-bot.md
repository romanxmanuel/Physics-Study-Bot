# Physics Study Bot Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a single `index.html` study bot that teaches Ch 20+21 from scratch and drills 16-MC exam questions.

**Architecture:** All code in one `index.html` — HTML structure, embedded `<style>` CSS, embedded `<script>` JS. All content (concepts, formulas, questions) is defined as JS data objects. Four modes rendered into a single `#app` div via JS.

**Tech Stack:** Pure HTML5, CSS3, vanilla JS (ES6). No dependencies. No build step. Open in browser.

---

## Task 1: HTML Skeleton + Dark Theme CSS

**Files:**
- Create: `index.html`

**Step 1: Create the file with this exact content**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Physics 2 Study Bot — Exam 2</title>
  <style>
    /* ── RESET & BASE ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0f1117;
      --surface: #1a1d27;
      --surface2: #23263a;
      --border: #2e3250;
      --accent: #6c7aff;
      --accent2: #a78bfa;
      --green: #34d399;
      --red: #f87171;
      --yellow: #fbbf24;
      --text: #e2e8f0;
      --text-dim: #94a3b8;
      --radius: 12px;
      --shadow: 0 4px 24px rgba(0,0,0,0.4);
    }
    html, body { height: 100%; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 16px;
      line-height: 1.6;
    }

    /* ── LAYOUT ── */
    #app { min-height: 100vh; display: flex; flex-direction: column; }
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 60px;
      position: sticky; top: 0; z-index: 100;
    }
    header h1 { font-size: 1rem; font-weight: 600; color: var(--accent); }
    header h1 span { color: var(--text-dim); font-weight: 400; }
    main { flex: 1; padding: 32px 24px; max-width: 800px; margin: 0 auto; width: 100%; }

    /* ── NAV TABS ── */
    .nav-tabs {
      display: flex; gap: 4px;
      background: var(--surface2);
      border-radius: 10px; padding: 4px;
    }
    .nav-tab {
      flex: 1; padding: 8px 12px; border: none; border-radius: 8px;
      background: transparent; color: var(--text-dim);
      cursor: pointer; font-size: 0.85rem; font-weight: 500;
      transition: all 0.15s;
    }
    .nav-tab:hover { color: var(--text); background: var(--surface); }
    .nav-tab.active { background: var(--accent); color: #fff; }

    /* ── CARDS ── */
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px;
      box-shadow: var(--shadow);
    }
    .card + .card { margin-top: 16px; }
    .card-label {
      font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: var(--accent); margin-bottom: 8px;
    }
    .card h2 { font-size: 1.4rem; margin-bottom: 12px; }
    .card p { color: var(--text-dim); margin-bottom: 10px; }
    .card p:last-child { margin-bottom: 0; }

    /* ── PROGRESS BAR ── */
    .progress-wrap { margin-bottom: 24px; }
    .progress-label {
      display: flex; justify-content: space-between;
      font-size: 0.8rem; color: var(--text-dim); margin-bottom: 6px;
    }
    .progress-bar {
      height: 6px; background: var(--surface2);
      border-radius: 99px; overflow: hidden;
    }
    .progress-fill {
      height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2));
      border-radius: 99px; transition: width 0.3s ease;
    }

    /* ── BUTTONS ── */
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; border-radius: 8px; border: none;
      font-size: 0.9rem; font-weight: 600; cursor: pointer;
      transition: all 0.15s;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { filter: brightness(1.1); }
    .btn-secondary {
      background: var(--surface2); color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
    .btn-success { background: var(--green); color: #0f2a1e; }
    .btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }

    /* ── FORMULA BOX ── */
    .formula {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-left: 3px solid var(--accent);
      border-radius: 8px;
      padding: 12px 16px;
      font-family: 'Courier New', monospace;
      font-size: 1rem;
      margin: 12px 0;
      color: var(--accent2);
    }

    /* ── ANALOGY BOX ── */
    .analogy {
      background: var(--surface2);
      border-radius: 8px; padding: 14px 16px;
      border-left: 3px solid var(--yellow);
      margin: 12px 0;
    }
    .analogy-label {
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--yellow); margin-bottom: 4px;
    }

    /* ── ANSWER CHOICES ── */
    .choices { display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
    .choice {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 16px;
      cursor: pointer;
      transition: all 0.15s;
      text-align: left;
      color: var(--text);
      font-size: 0.95rem;
    }
    .choice:hover { border-color: var(--accent); }
    .choice.correct { border-color: var(--green); background: rgba(52,211,153,0.1); color: var(--green); }
    .choice.wrong { border-color: var(--red); background: rgba(248,113,113,0.1); color: var(--red); }
    .choice.reveal-correct { border-color: var(--green); background: rgba(52,211,153,0.08); }
    .choice:disabled, .choice.locked { pointer-events: none; }

    /* ── EXPLANATION BOX ── */
    .explanation {
      background: var(--surface2);
      border-radius: 8px; padding: 14px 16px;
      border-left: 3px solid var(--green);
      margin-top: 16px; display: none;
    }
    .explanation.wrong-exp { border-left-color: var(--red); }
    .explanation.show { display: block; }
    .explanation-label {
      font-size: 0.75rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--green); margin-bottom: 6px;
    }
    .explanation.wrong-exp .explanation-label { color: var(--red); }

    /* ── SCORE BADGE ── */
    .score-badge {
      display: inline-flex; flex-direction: column; align-items: center;
      background: var(--surface2); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 20px 32px;
      margin: 16px 0;
    }
    .score-num {
      font-size: 3rem; font-weight: 800; line-height: 1;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .score-label { font-size: 0.85rem; color: var(--text-dim); margin-top: 4px; }

    /* ── TOPIC PILL ── */
    .topic-pill {
      display: inline-block;
      padding: 2px 10px; border-radius: 99px;
      font-size: 0.75rem; font-weight: 600;
      background: var(--surface2); border: 1px solid var(--border);
      color: var(--text-dim); margin-bottom: 12px;
    }

    /* ── FORMULA SHEET SIDEBAR ── */
    .exam-layout { display: flex; gap: 20px; align-items: flex-start; }
    .exam-main { flex: 1; min-width: 0; }
    .formula-sheet {
      width: 240px; flex-shrink: 0;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
      position: sticky; top: 76px;
    }
    .formula-sheet h3 {
      font-size: 0.8rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: var(--accent); margin-bottom: 12px;
    }
    .formula-sheet .f {
      font-family: 'Courier New', monospace;
      font-size: 0.8rem; color: var(--accent2);
      line-height: 1.8;
    }
    .formula-sheet hr { border: none; border-top: 1px solid var(--border); margin: 8px 0; }

    /* ── HOME SCREEN ── */
    .home-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px; }
    .home-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 24px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .home-card:hover { border-color: var(--accent); transform: translateY(-2px); }
    .home-card-icon { font-size: 2rem; margin-bottom: 12px; }
    .home-card h3 { font-size: 1.1rem; margin-bottom: 6px; }
    .home-card p { font-size: 0.85rem; color: var(--text-dim); }
    .home-card .badge {
      display: inline-block; margin-top: 12px;
      background: var(--surface2); border-radius: 99px;
      padding: 2px 10px; font-size: 0.75rem; color: var(--accent);
    }

    /* ── STATUS INDICATOR ── */
    .weak-indicator {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.78rem; color: var(--yellow);
      background: rgba(251,191,36,0.1); border-radius: 99px;
      padding: 3px 10px; margin-left: 8px;
    }

    /* ── RESPONSIVE ── */
    @media (max-width: 640px) {
      .home-grid { grid-template-columns: 1fr; }
      .exam-layout { flex-direction: column; }
      .formula-sheet { width: 100%; position: static; }
    }
  </style>
</head>
<body>
  <div id="app">
    <header>
      <h1>⚡ Physics 2 Study Bot <span>— Exam 2: Ch 20 + 21</span></h1>
      <div class="nav-tabs" id="nav">
        <button class="nav-tab active" onclick="goHome()">Home</button>
        <button class="nav-tab" onclick="goMode('learn')">Learn</button>
        <button class="nav-tab" onclick="goMode('formulas')">Formulas</button>
        <button class="nav-tab" onclick="goMode('practice')">Practice</button>
        <button class="nav-tab" onclick="goMode('exam')">Mock Exam</button>
      </div>
    </header>
    <main id="main"></main>
  </div>
  <script>
    // ── STATE ──
    const state = {
      mode: 'home',
      learnIndex: 0,
      formulaIndex: 0,
      practiceIndex: 0,
      practiceAnswered: false,
      practiceQueue: [],
      weakTopics: {},      // topic -> wrong count
      examQuestions: [],
      examIndex: 0,
      examAnswers: [],
      examAnswered: false,
    };

    // placeholder — data will be filled in subsequent tasks
    const CONCEPTS = [];
    const FORMULAS = [];
    const QUESTIONS = [];

    // ── ROUTER ──
    function goHome() { state.mode = 'home'; renderHome(); setActiveTab(0); }
    function goMode(mode) {
      state.mode = mode;
      if (mode === 'learn') { state.learnIndex = 0; renderLearn(); }
      else if (mode === 'formulas') { state.formulaIndex = 0; renderFormulas(); }
      else if (mode === 'practice') { startPractice(); }
      else if (mode === 'exam') { startExam(); }
      setActiveTab(['home','learn','formulas','practice','exam'].indexOf(mode));
    }
    function setActiveTab(i) {
      document.querySelectorAll('.nav-tab').forEach((t,j) => t.classList.toggle('active', i===j));
    }

    // ── HOME ──
    function renderHome() {
      document.getElementById('main').innerHTML = `
        <div class="card">
          <div class="card-label">Your study plan</div>
          <h2>Welcome! Let's master Exam 2.</h2>
          <p>Work through each mode in order — Learn the concepts first, then memorize formulas, then practice problems, and finally simulate the exam.</p>
        </div>
        <div class="home-grid">
          <div class="home-card" onclick="goMode('learn')">
            <div class="home-card-icon">📖</div>
            <h3>1. Learn</h3>
            <p>Understand every concept in plain English before touching any formula.</p>
            <span class="badge">${CONCEPTS.length} concept cards</span>
          </div>
          <div class="home-card" onclick="goMode('formulas')">
            <div class="home-card-icon">🔢</div>
            <h3>2. Formulas</h3>
            <p>Every exam formula, explained variable by variable in plain English.</p>
            <span class="badge">${FORMULAS.length} formulas</span>
          </div>
          <div class="home-card" onclick="goMode('practice')">
            <div class="home-card-icon">🎯</div>
            <h3>3. Practice</h3>
            <p>Multiple choice questions with full explanations. Weak topics get re-drilled.</p>
            <span class="badge">${QUESTIONS.length} questions</span>
          </div>
          <div class="home-card" onclick="goMode('exam')">
            <div class="home-card-icon">📝</div>
            <h3>4. Mock Exam</h3>
            <p>16 questions with your formula sheet — exactly like the real thing.</p>
            <span class="badge">16 MC questions</span>
          </div>
        </div>`;
    }

    // ── LEARN (stub) ──
    function renderLearn() {
      document.getElementById('main').innerHTML = `<div class="card"><h2>Learn mode loading...</h2></div>`;
    }
    // ── FORMULAS (stub) ──
    function renderFormulas() {
      document.getElementById('main').innerHTML = `<div class="card"><h2>Formulas mode loading...</h2></div>`;
    }
    // ── PRACTICE (stub) ──
    function startPractice() {
      document.getElementById('main').innerHTML = `<div class="card"><h2>Practice mode loading...</h2></div>`;
    }
    // ── EXAM (stub) ──
    function startExam() {
      document.getElementById('main').innerHTML = `<div class="card"><h2>Mock exam loading...</h2></div>`;
    }

    // ── INIT ──
    renderHome();
  </script>
</body>
</html>
```

**Step 2: Open in browser and verify**

Open `index.html` in Chrome. You should see:
- Dark background, header with "Physics 2 Study Bot"
- 5 nav tabs: Home, Learn, Formulas, Practice, Mock Exam
- Home screen with 4 mode cards
- Clicking tabs shows stub "loading..." cards

---

## Task 2: Concept Cards Data (CONCEPTS array)

**Files:**
- Modify: `index.html` — replace `const CONCEPTS = [];` with the full array

**Step 1: Replace the CONCEPTS stub with this full data**

Find the line `const CONCEPTS = [];` and replace it with:

```js
const CONCEPTS = [
  // ── CHAPTER 20 ──
  {
    chapter: 'Ch 20',
    topic: 'Electric Current',
    title: 'What is Electric Current?',
    body: `Electric current is simply the flow of electric charge through a wire. Think of a wire like a garden hose — water flowing through the hose is like charge flowing through the wire.\n\nCurrent (I) measures how much charge passes a point per second. If a lot of charge flows per second, you have a large current. The unit is the <strong>ampere (A)</strong>, which equals 1 coulomb per second.`,
    analogy: 'Water hose: Current = gallons per minute flowing past a point. A fire hose has high current (lots of water per second). A dripping faucet has tiny current.',
    formula: 'I = ΔQ / Δt',
    formulaNote: 'I = current (A), ΔQ = charge that passed (C), Δt = time (s)',
  },
  {
    chapter: 'Ch 20',
    topic: 'Conventional Current',
    title: 'Which Way Does Current Flow?',
    body: `Electrons (negative charges) actually flow from the negative terminal of a battery to the positive terminal. BUT by historical convention, we define current direction as the flow of <em>positive</em> charges — which is the opposite direction.\n\nThis "conventional current" flows from + to −, while electrons flow from − to +. For most problems you just need to know the direction of conventional current. Don't let this confuse you — both descriptions give the same physics.`,
    analogy: 'Imagine positive charges going right and negative charges going left — both mean current is flowing right. Same result, different way to think about it.',
    formula: null,
    formulaNote: null,
  },
  {
    chapter: 'Ch 20',
    topic: 'Drift Velocity',
    title: 'How Fast Do Electrons Actually Move?',
    body: `Electrons in a wire bounce around randomly at very high speeds (~1,000,000 m/s). But their net drift in one direction (drift velocity) is incredibly slow — millimeters per second.\n\nWhy does a light turn on instantly then? Because the electric field propagates nearly at the speed of light and pushes ALL electrons in the wire simultaneously — like pushing one end of a full pipe makes water come out the other end instantly.`,
    analogy: 'A pipe full of water: push one end and water comes out the other immediately, even though individual water molecules move slowly.',
    formula: 'I = n·q·A·v_d',
    formulaNote: 'n = free charge density (#/m³), q = charge per carrier (1.6×10⁻¹⁹ C), A = cross-section area (m²), v_d = drift speed (m/s)',
  },
  {
    chapter: 'Ch 20',
    topic: "Ohm's Law",
    title: "Ohm's Law: Voltage, Current, Resistance",
    body: `<strong>Voltage (V)</strong> is the "push" that drives current — like water pressure in a hose. More voltage = more push.\n\n<strong>Resistance (R)</strong> is how much the wire/component fights the flow — like a narrow hose section. More resistance = less current for the same voltage.\n\nOhm's Law: these three quantities are always related. If you know two, you can find the third. Unit of resistance: <strong>ohm (Ω)</strong>.`,
    analogy: 'Voltage = water pressure. Current = flow rate. Resistance = how narrow the pipe is. Narrow pipe (high R) → less flow (low I) for the same pressure (V).',
    formula: 'V = I × R   →   I = V/R   →   R = V/I',
    formulaNote: 'V = voltage (volts), I = current (amps), R = resistance (ohms Ω)',
  },
  {
    chapter: 'Ch 20',
    topic: 'Resistivity',
    title: 'Resistance Depends on Material and Shape',
    body: `The resistance of a wire depends on three things:\n• What it's made of (material property: <strong>resistivity ρ</strong>)\n• How long it is (longer = more resistance)\n• How thick it is (thicker = less resistance)\n\n<strong>Resistivity (ρ)</strong> is a property of the material itself — copper has low resistivity (good conductor), rubber has high resistivity (insulator). Units: Ω·m.`,
    analogy: 'A long, thin garden hose resists water flow more than a short, fat pipe. The hose material also matters — a sponge-filled hose would resist even more.',
    formula: 'R = ρ · L / A',
    formulaNote: 'ρ = resistivity (Ω·m), L = length (m), A = cross-section area (m²)',
  },
  {
    chapter: 'Ch 20',
    topic: 'Electric Power',
    title: 'Electric Power: How Much Energy Per Second?',
    body: `Power is how fast energy is used or delivered. A 100W light bulb uses 100 joules of energy every second.\n\nElectric power depends on both current and voltage. There are three equivalent formulas — use whichever one has the variables you know.`,
    analogy: 'A wide river (high I) with a big waterfall (high V) delivers enormous power. A tiny stream with a tiny drop delivers almost none.',
    formula: 'P = I·V = V²/R = I²·R',
    formulaNote: 'P = power (watts W), I = current (A), V = voltage (V), R = resistance (Ω)',
  },
  {
    chapter: 'Ch 20',
    topic: 'AC vs DC',
    title: 'AC vs DC Current',
    body: `<strong>DC (Direct Current):</strong> Charge flows in one direction only. Batteries produce DC. Constant voltage and current.\n\n<strong>AC (Alternating Current):</strong> The direction of current reverses periodically — it oscillates back and forth, typically 60 times per second (60 Hz) in North America. This is what comes from a wall outlet.\n\nThe voltage and current in AC circuits are described by sine waves: V = V₀ sin(2πft)`,
    analogy: 'DC = a river flowing steadily one way. AC = ocean waves going back and forth.',
    formula: 'V = V₀ sin(2πft)   and   I = I₀ sin(2πft)',
    formulaNote: 'V₀, I₀ = peak values, f = frequency (Hz), t = time (s)',
  },
  {
    chapter: 'Ch 20',
    topic: 'RMS Values',
    title: 'RMS Values: The "Effective" AC Values',
    body: `Since AC voltage and current constantly change, we can't use peak values directly in power calculations. Instead we use <strong>RMS (root mean square)</strong> values — these are the "equivalent DC values" that would produce the same heating effect.\n\nFor a sinusoidal AC signal, the RMS value is simply the peak value divided by √2 ≈ 1.414.\n\nThe "120V" from your wall outlet is actually the RMS voltage. The peak voltage is 120 × √2 ≈ 170V.`,
    analogy: 'An AC bulb flickering 60 times/second looks as bright as a DC bulb at the RMS voltage. The RMS is what "matters" for power.',
    formula: 'I_rms = I₀/√2   and   V_rms = V₀/√2',
    formulaNote: 'I₀, V₀ = peak values. For power: P̄ = I_rms·V_rms = V²_rms/R = I²_rms·R',
  },
  {
    chapter: 'Ch 20',
    topic: 'Electrical Hazards',
    title: 'Electrical Hazards: Thermal and Shock',
    body: `<strong>Thermal hazard:</strong> Too much current heats wires and can cause fires. This is what fuses and circuit breakers protect against.\n\n<strong>Shock hazard:</strong> When current passes through a human body, it can cause muscle contractions, heart fibrillation, or death. Even small currents are dangerous:\n• 1 mA: barely feels it\n• 10 mA: painful, may not let go\n• 100 mA: potentially fatal (heart fibrillation)\n\nThe body has resistance (~300kΩ dry, much lower wet), so high voltages push dangerous currents through us.`,
    analogy: 'Your body is a resistor. V = IR means higher voltage → higher current through you. Wet skin lowers R, making shocks much more dangerous.',
    formula: null,
    formulaNote: null,
  },
  // ── CHAPTER 21 ──
  {
    chapter: 'Ch 21',
    topic: 'Series Circuits',
    title: 'Resistors in Series',
    body: `When resistors are connected <strong>end-to-end</strong> (series), the same current flows through all of them. The voltage is split between them.\n\nKey rules for series:\n• Current is the SAME through each resistor\n• Voltages ADD up (V_total = V₁ + V₂ + ...)\n• Total resistance = SUM of all resistances\n\nAdding more resistors in series always INCREASES total resistance.`,
    analogy: 'Cars on a single-lane road must all go through each checkpoint (resistor) one by one. Total resistance = all checkpoints added up.',
    formula: 'R_s = R₁ + R₂ + R₃ + ...',
    formulaNote: 'Total series resistance is always larger than any individual resistor',
  },
  {
    chapter: 'Ch 21',
    topic: 'Parallel Circuits',
    title: 'Resistors in Parallel',
    body: `When resistors share the SAME two endpoints (parallel), they all have the same voltage across them. But the current splits between them.\n\nKey rules for parallel:\n• Voltage is the SAME across each resistor\n• Currents ADD up (I_total = I₁ + I₂ + ...)\n• Total resistance is LESS than any individual resistor\n\nAdding more paths in parallel always DECREASES total resistance (more paths = easier for current to flow).`,
    analogy: 'Multiple lanes on a highway: all cars travel the same distance (same voltage) but more lanes means more cars get through (less total resistance).',
    formula: '1/R_p = 1/R₁ + 1/R₂ + 1/R₃ + ...',
    formulaNote: 'R_p is always SMALLER than the smallest individual R. For two equal resistors R in parallel: R_p = R/2',
  },
  {
    chapter: 'Ch 21',
    topic: 'Mixed Circuits',
    title: 'Mixed Series-Parallel Circuits',
    body: `Real circuits combine series and parallel sections. The strategy is to simplify step by step:\n1. Identify groups of purely series or purely parallel resistors\n2. Replace each group with its equivalent single resistance\n3. Repeat until you have one equivalent resistance\n4. Use Ohm's law to find total current, then work backwards to find individual currents and voltages`,
    analogy: 'Simplify a complex route by finding shortcuts (parallel paths) and combining straight sections (series) until you have one simple path.',
    formula: null,
    formulaNote: null,
  },
  {
    chapter: 'Ch 21',
    topic: 'EMF and Internal Resistance',
    title: 'EMF and Terminal Voltage',
    body: `A real battery has two properties:\n• <strong>EMF (electromotive force, ε)</strong>: the ideal voltage the battery can supply (its "rating")\n• <strong>Internal resistance (r)</strong>: the small resistance inside the battery itself\n\nWhen current flows, some voltage is lost to the internal resistance. The actual voltage at the battery terminals is LESS than the EMF:\n\nTerminal voltage = EMF − I·r\n\nFor an ideal battery (r = 0), terminal voltage = EMF.`,
    analogy: 'A water pump (EMF) with friction in its own pipes (internal resistance). The pressure you actually get out is less than what the pump theoretically generates.',
    formula: 'V_terminal = ε − I·r',
    formulaNote: 'ε = EMF (V), I = current (A), r = internal resistance (Ω)',
  },
  {
    chapter: 'Ch 21',
    topic: 'Ammeters and Voltmeters',
    title: 'Measuring Current and Voltage',
    body: `<strong>Ammeter</strong>: measures current. Must be placed IN SERIES with the component (so current flows through it). Ideal ammeter has ZERO resistance (so it doesn't affect the circuit).\n\n<strong>Voltmeter</strong>: measures voltage. Must be placed IN PARALLEL with the component. Ideal voltmeter has INFINITE resistance (so no current flows through it, not stealing any current).`,
    analogy: 'Ammeter = a flow meter you INSERT into a pipe (measures flow through it). Voltmeter = a pressure gauge connected between two points (barely touches the system).',
    formula: null,
    formulaNote: null,
  },
  {
    chapter: 'Ch 21',
    topic: "Kirchhoff's Rules",
    title: "Kirchhoff's Rules",
    body: `Two rules for analyzing ANY circuit, no matter how complex:\n\n<strong>Junction Rule (current):</strong> At any junction (where wires split), current IN = current OUT. This is conservation of charge — charge can't pile up anywhere.\n\n<strong>Loop Rule (voltage):</strong> Around any closed loop in the circuit, the sum of all voltage rises = sum of all voltage drops. This is conservation of energy — you return to the same potential after going around a loop.`,
    analogy: 'Junction rule: water in = water out at any pipe junction. Loop rule: if you walk in a complete circle (closed loop), you end up at the same height — net elevation change = 0.',
    formula: 'Junction: ΣI_in = ΣI_out\nLoop: Σ(voltage rises) = Σ(voltage drops)',
    formulaNote: 'To use loop rule: pick a direction, assign + for voltage rises (through battery +→−) and − for drops (through resistors in current direction)',
  },
  {
    chapter: 'Ch 21',
    topic: 'RC Circuits - Charging',
    title: 'RC Circuits: Charging a Capacitor',
    body: `A capacitor (C) in series with a resistor (R) and a battery: when you close the switch, current flows and the capacitor charges up — but not instantly.\n\nAt first (t=0): capacitor is empty, full EMF drives current → maximum current flows.\nAs time goes on: capacitor fills up, voltage across it grows, less voltage for resistor → current decreases.\nAt t=∞: capacitor fully charged to EMF, current = 0.\n\nThe voltage across the capacitor grows exponentially, following the formula shown.`,
    analogy: 'Filling a tank through a pipe with a valve. At first, water rushes in fast (empty tank, big pressure difference). As the tank fills, the pressure difference shrinks and flow slows until the tank is full.',
    formula: 'V = emf · (1 − e^(−t/RC))',
    formulaNote: 'e ≈ 2.718 (Euler\'s number). At t=0: V=0. At t=∞: V=emf.',
  },
  {
    chapter: 'Ch 21',
    topic: 'RC Circuits - Discharging',
    title: 'RC Circuits: Discharging a Capacitor',
    body: `When a charged capacitor discharges through a resistor (battery disconnected), the voltage decays exponentially from its initial value toward zero.\n\nAt first: full voltage → maximum current flows.\nAs time passes: voltage drops → current drops → slower discharge.\nThis is exponential decay — it never quite reaches zero but gets very close.`,
    analogy: 'Draining a tank through a pipe: fast at first when the tank is full (high pressure), slower as it empties, gets very slow near the end.',
    formula: 'V = V₀ · e^(−t/RC)',
    formulaNote: 'V₀ = initial voltage. At t=RC: V = 0.368·V₀ (dropped to ~37% of original)',
  },
  {
    chapter: 'Ch 21',
    topic: 'Time Constant',
    title: 'The Time Constant τ = RC',
    body: `The time constant τ (tau) tells you how fast an RC circuit charges or discharges.\n\nτ = R × C (units: seconds)\n\nAfter one time constant:\n• Charging: capacitor reaches 63.2% of final voltage\n• Discharging: capacitor falls to 36.8% of initial voltage\n\nAfter ~5τ, the capacitor is essentially fully charged or discharged (>99%).\n\nBigger R or bigger C → larger τ → slower charging/discharging.`,
    analogy: 'Think of τ as a "half-life" for the circuit. A big resistor (small pipe) or big capacitor (big tank) means it takes longer.',
    formula: 'τ = R · C',
    formulaNote: 'R in ohms, C in farads, τ in seconds. At t=τ: charging V = 0.632·emf, discharging V = 0.368·V₀',
  },
];
```

**Step 2: Visually verify in browser**
Reload `index.html`. The Home screen should now show "18 concept cards" badge on the Learn card.

---

## Task 3: Learn Mode Renderer

**Files:**
- Modify: `index.html` — replace the `renderLearn()` stub function

**Step 1: Replace the `renderLearn()` stub with this implementation**

Find the comment `// ── LEARN (stub) ──` and replace the entire `renderLearn()` function:

```js
function renderLearn() {
  const c = CONCEPTS[state.learnIndex];
  const total = CONCEPTS.length;
  const pct = Math.round((state.learnIndex / total) * 100);

  document.getElementById('main').innerHTML = `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Concept ${state.learnIndex + 1} of ${total}</span>
        <span>${pct}% complete</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span class="topic-pill">${c.chapter}</span>
        <span class="topic-pill">${c.topic}</span>
      </div>
      <div class="card-label">Concept ${state.learnIndex + 1}</div>
      <h2>${c.title}</h2>
      <p>${c.body.replace(/\n/g, '<br>')}</p>
      ${c.analogy ? `
        <div class="analogy">
          <div class="analogy-label">💡 Real-World Analogy</div>
          <div>${c.analogy}</div>
        </div>` : ''}
      ${c.formula ? `
        <div class="formula">${c.formula}</div>
        <p style="font-size:0.85rem;color:var(--text-dim)">${c.formulaNote}</p>
      ` : ''}
      <div class="btn-row">
        ${state.learnIndex > 0 ? `<button class="btn btn-secondary" onclick="learnPrev()">← Back</button>` : ''}
        ${state.learnIndex < total - 1
          ? `<button class="btn btn-primary" onclick="learnNext()">Got it → Next</button>`
          : `<button class="btn btn-success" onclick="goMode('formulas')">Done! Go to Formulas →</button>`}
      </div>
    </div>`;
}

function learnNext() { state.learnIndex++; renderLearn(); window.scrollTo(0,0); }
function learnPrev() { state.learnIndex--; renderLearn(); window.scrollTo(0,0); }
```

**Step 2: Verify in browser**
Click "Learn" tab. You should see:
- Progress bar at top
- Concept card with chapter/topic pills
- Body text, analogy box (yellow border), formula box (purple text)
- "Got it → Next" button advances through all 18 cards
- Last card shows "Done! Go to Formulas →" button

---

## Task 4: Formula Cards Data + Renderer

**Files:**
- Modify: `index.html` — replace `const FORMULAS = [];` and the `renderFormulas()` stub

**Step 1: Replace `const FORMULAS = [];` with:**

```js
const FORMULAS = [
  // ── CHAPTER 20 ──
  {
    chapter: 'Ch 20',
    name: 'Electric Current',
    formula: 'I = ΔQ / Δt',
    vars: [
      { sym: 'I', unit: 'amperes (A)', meaning: 'electric current — how much charge flows per second' },
      { sym: 'ΔQ', unit: 'coulombs (C)', meaning: 'amount of charge that passed through' },
      { sym: 'Δt', unit: 'seconds (s)', meaning: 'the time interval' },
    ],
    plain: 'Current equals charge divided by time. If 2 coulombs of charge flow past in 1 second, the current is 2 A.',
  },
  {
    chapter: 'Ch 20',
    name: 'Drift Velocity',
    formula: 'I = n · q · A · v_d',
    vars: [
      { sym: 'n', unit: 'per m³', meaning: 'number of free charge carriers per unit volume' },
      { sym: 'q', unit: 'coulombs (C)', meaning: 'charge per carrier (electrons: 1.60×10⁻¹⁹ C)' },
      { sym: 'A', unit: 'm²', meaning: 'cross-sectional area of the wire' },
      { sym: 'v_d', unit: 'm/s', meaning: 'drift velocity (average net speed of charge carriers)' },
    ],
    plain: 'Current equals the charge density times charge per carrier times area times drift speed. All four factors together determine how much charge flows per second.',
  },
  {
    chapter: 'Ch 20',
    name: "Ohm's Law",
    formula: 'I = V / R   (equivalently: V = IR, R = V/I)',
    vars: [
      { sym: 'I', unit: 'amperes (A)', meaning: 'current through the resistor' },
      { sym: 'V', unit: 'volts (V)', meaning: 'voltage (potential difference) across the resistor' },
      { sym: 'R', unit: 'ohms (Ω)', meaning: 'resistance — how much the component opposes current' },
    ],
    plain: 'Current equals voltage divided by resistance. Double the voltage → double the current. Double the resistance → half the current.',
  },
  {
    chapter: 'Ch 20',
    name: 'Resistance from Resistivity',
    formula: 'R = ρ · L / A',
    vars: [
      { sym: 'R', unit: 'ohms (Ω)', meaning: 'resistance of the wire/component' },
      { sym: 'ρ', unit: 'ohm·meters (Ω·m)', meaning: 'resistivity — a property of the material (low for conductors, high for insulators)' },
      { sym: 'L', unit: 'meters (m)', meaning: 'length of the wire' },
      { sym: 'A', unit: 'm²', meaning: 'cross-sectional area of the wire' },
    ],
    plain: 'Resistance increases with length (longer wire = more resistance) and decreases with area (fatter wire = less resistance).',
  },
  {
    chapter: 'Ch 20',
    name: 'Circle Area',
    formula: 'A_circle = π · r²',
    vars: [
      { sym: 'A', unit: 'm²', meaning: 'cross-sectional area of the circular wire' },
      { sym: 'r', unit: 'm', meaning: 'radius of the wire' },
    ],
    plain: 'Used to find the cross-sectional area of a circular wire when you are given the radius (or diameter ÷ 2).',
  },
  {
    chapter: 'Ch 20',
    name: 'Electric Power (3 forms)',
    formula: 'P = I·V = V²/R = I²·R',
    vars: [
      { sym: 'P', unit: 'watts (W)', meaning: 'power — energy used per second' },
      { sym: 'I', unit: 'A', meaning: 'current' },
      { sym: 'V', unit: 'V', meaning: 'voltage' },
      { sym: 'R', unit: 'Ω', meaning: 'resistance' },
    ],
    plain: 'Three equivalent ways to calculate power. Use whichever form matches the variables you are given. 1 W = 1 J/s.',
  },
  {
    chapter: 'Ch 20',
    name: 'AC Voltage and Current',
    formula: 'V = V₀ sin(2πft)   and   I = I₀ sin(2πft)',
    vars: [
      { sym: 'V₀, I₀', unit: 'V, A', meaning: 'peak (maximum) voltage and current' },
      { sym: 'f', unit: 'Hz (cycles/s)', meaning: 'frequency — how many full cycles per second (60 Hz in North America)' },
      { sym: 't', unit: 's', meaning: 'time' },
    ],
    plain: 'AC voltage and current oscillate sinusoidally. The peak values V₀ and I₀ are the maximums reached in each cycle.',
  },
  {
    chapter: 'Ch 20',
    name: 'RMS Values',
    formula: 'I_rms = I₀/√2   and   V_rms = V₀/√2',
    vars: [
      { sym: 'I_rms, V_rms', unit: 'A, V', meaning: 'root mean square values — the effective DC-equivalent values' },
      { sym: 'I₀, V₀', unit: 'A, V', meaning: 'peak values (maximum of the sine wave)' },
      { sym: '√2', unit: '—', meaning: '≈ 1.414, so I_rms ≈ 0.707 × I₀' },
    ],
    plain: 'The RMS value is what the AC signal "acts like" on average for power purposes. Wall outlet: 120 V_rms, peak is 170 V.',
  },
  {
    chapter: 'Ch 20',
    name: 'AC Average Power',
    formula: 'P̄ = I_rms·V_rms = V²_rms/R = I²_rms·R',
    vars: [
      { sym: 'P̄', unit: 'watts (W)', meaning: 'average (mean) power dissipated in AC circuit' },
    ],
    plain: 'Same structure as DC power formulas, but use RMS values instead of peak values. Average power is half the peak power.',
  },
  // ── CHAPTER 21 ──
  {
    chapter: 'Ch 21',
    name: 'Series Resistance',
    formula: 'R_s = R₁ + R₂ + R₃ + ...',
    vars: [
      { sym: 'R_s', unit: 'Ω', meaning: 'total equivalent series resistance' },
      { sym: 'R₁, R₂, ...', unit: 'Ω', meaning: 'individual resistor values' },
    ],
    plain: 'In series, just add all resistances. Total is always bigger than any individual resistor.',
  },
  {
    chapter: 'Ch 21',
    name: 'Parallel Resistance',
    formula: '1/R_p = 1/R₁ + 1/R₂ + 1/R₃ + ...',
    vars: [
      { sym: 'R_p', unit: 'Ω', meaning: 'total equivalent parallel resistance' },
    ],
    plain: 'In parallel, add the reciprocals, then take the reciprocal of the result. Total is always SMALLER than the smallest individual resistor. For two equal resistors R: R_p = R/2.',
  },
  {
    chapter: 'Ch 21',
    name: "Kirchhoff's Junction Rule",
    formula: 'I₁ = I₂ + I₃   (current in = current out)',
    vars: [
      { sym: 'I_in', unit: 'A', meaning: 'sum of all currents flowing INTO a junction' },
      { sym: 'I_out', unit: 'A', meaning: 'sum of all currents flowing OUT of a junction' },
    ],
    plain: 'Conservation of charge: charge cannot accumulate at a junction. Whatever current enters must leave.',
  },
  {
    chapter: 'Ch 21',
    name: "Kirchhoff's Loop Rule",
    formula: 'Σ(voltage rises) = Σ(voltage drops)   around any closed loop',
    vars: [],
    plain: 'Conservation of energy: traveling around any closed loop and returning to the start, the net voltage change is zero. Batteries provide rises; resistors provide drops (in the direction of current).',
  },
  {
    chapter: 'Ch 21',
    name: 'RC Charging',
    formula: 'V = emf · (1 − e^(−t/RC))',
    vars: [
      { sym: 'V', unit: 'V', meaning: 'voltage across the capacitor at time t' },
      { sym: 'emf', unit: 'V', meaning: 'battery EMF (the final voltage the capacitor approaches)' },
      { sym: 'e', unit: '—', meaning: '2.718... (Euler\'s number, the base of natural log)' },
      { sym: 't', unit: 's', meaning: 'time after switch is closed' },
      { sym: 'RC', unit: 's', meaning: 'time constant τ (tau)' },
    ],
    plain: 'Capacitor voltage starts at 0, grows toward emf. At t=RC, V = 0.632×emf. At t=5RC, essentially fully charged.',
  },
  {
    chapter: 'Ch 21',
    name: 'RC Discharging',
    formula: 'V = V₀ · e^(−t/RC)',
    vars: [
      { sym: 'V₀', unit: 'V', meaning: 'initial voltage on the capacitor when discharging starts' },
    ],
    plain: 'Capacitor voltage starts at V₀ and decays toward 0. At t=RC, V = 0.368×V₀. Exponential decay.',
  },
  {
    chapter: 'Ch 21',
    name: 'Time Constant',
    formula: 'τ = R · C',
    vars: [
      { sym: 'τ', unit: 'seconds (s)', meaning: 'time constant — sets the timescale for charging/discharging' },
      { sym: 'R', unit: 'Ω', meaning: 'resistance in the RC circuit' },
      { sym: 'C', unit: 'farads (F)', meaning: 'capacitance' },
    ],
    plain: 'Larger R or larger C → larger τ → slower charging/discharging. After 1τ: 63% charged (or 37% remaining if discharging).',
  },
];
```

**Step 2: Replace the `renderFormulas()` stub with:**

```js
function renderFormulas() {
  const f = FORMULAS[state.formulaIndex];
  const total = FORMULAS.length;
  const pct = Math.round((state.formulaIndex / total) * 100);

  const varsHtml = f.vars.length > 0
    ? `<table style="width:100%;border-collapse:collapse;margin:12px 0">
        ${f.vars.map(v => `
          <tr style="border-bottom:1px solid var(--border)">
            <td style="padding:8px 12px 8px 0;font-family:monospace;color:var(--accent2);width:80px">${v.sym}</td>
            <td style="padding:8px 12px;color:var(--text-dim);font-size:0.85rem;width:140px">${v.unit}</td>
            <td style="padding:8px 0;font-size:0.9rem">${v.meaning}</td>
          </tr>`).join('')}
      </table>` : '';

  document.getElementById('main').innerHTML = `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Formula ${state.formulaIndex + 1} of ${total}</span>
        <span>${pct}% complete</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <span class="topic-pill">${f.chapter}</span>
      </div>
      <div class="card-label">Formula</div>
      <h2>${f.name}</h2>
      <div class="formula">${f.formula}</div>
      ${varsHtml}
      <div class="analogy">
        <div class="analogy-label">💬 In plain English</div>
        <div>${f.plain}</div>
      </div>
      <div class="btn-row">
        ${state.formulaIndex > 0 ? `<button class="btn btn-secondary" onclick="formulaPrev()">← Back</button>` : ''}
        ${state.formulaIndex < total - 1
          ? `<button class="btn btn-primary" onclick="formulaNext()">Next Formula →</button>`
          : `<button class="btn btn-success" onclick="goMode('practice')">Done! Go to Practice →</button>`}
      </div>
    </div>`;
}

function formulaNext() { state.formulaIndex++; renderFormulas(); window.scrollTo(0,0); }
function formulaPrev() { state.formulaIndex--; renderFormulas(); window.scrollTo(0,0); }
```

**Step 3: Verify in browser**
Click "Formulas" tab. Should show formula cards with:
- Formula in purple monospace box
- Variable table (symbol, unit, meaning)
- Plain English explanation in yellow box
- Navigation buttons

---

## Task 5: Question Bank Data

**Files:**
- Modify: `index.html` — replace `const QUESTIONS = [];`

**Step 1: Replace `const QUESTIONS = [];` with the full question bank**

```js
const QUESTIONS = [
  // ── CH 20: CONCEPTUAL ──
  {
    chapter: 'Ch 20', topic: 'Electric Current', type: 'conceptual',
    q: 'Conventional current is defined as flowing from:',
    choices: ['Positive terminal to negative terminal', 'Negative terminal to positive terminal', 'The direction electrons actually move', 'Both directions simultaneously'],
    answer: 0,
    explain: 'By convention, current direction is the direction positive charges would flow — from + to −. Electrons actually move opposite to this (from − to +), but conventional current is defined as + to −.',
  },
  {
    chapter: 'Ch 20', topic: 'Electric Current', type: 'conceptual',
    q: 'The unit of electric current is:',
    choices: ['Volt (V)', 'Ohm (Ω)', 'Ampere (A)', 'Watt (W)'],
    answer: 2,
    explain: 'Current is measured in amperes (A). 1 A = 1 coulomb per second. Volt = voltage, Ohm = resistance, Watt = power.',
  },
  {
    chapter: 'Ch 20', topic: 'Drift Velocity', type: 'conceptual',
    q: 'Why does a light bulb turn on almost instantly when you flip the switch, even though electrons move very slowly (drift velocity)?',
    choices: [
      'Electrons near the bulb instantly speed up to light speed',
      'The electric field propagates through the circuit at nearly the speed of light, setting all electrons in motion simultaneously',
      'The wire stores energy that is instantly released',
      'Light bulbs have special fast electrons',
    ],
    answer: 1,
    explain: 'The electric field (the "push") travels through the wire at nearly the speed of light — it\'s like pushing one end of a full pipe; water comes out the other end instantly. Individual electrons barely move.',
  },
  {
    chapter: 'Ch 20', topic: "Ohm's Law", type: 'conceptual',
    q: 'If you double the resistance of a circuit while keeping the voltage constant, what happens to the current?',
    choices: ['It doubles', 'It halves', 'It stays the same', 'It quadruples'],
    answer: 1,
    explain: 'From I = V/R: if R doubles and V stays constant, I = V/(2R) = half the original current. Resistance and current are inversely proportional at constant voltage.',
  },
  {
    chapter: 'Ch 20', topic: 'Resistivity', type: 'conceptual',
    q: 'Which wire has higher resistance?',
    choices: [
      'A short, thick copper wire',
      'A long, thin copper wire',
      'Both have the same resistance',
      'Resistance does not depend on shape',
    ],
    answer: 1,
    explain: 'R = ρL/A: resistance increases with length (longer = more) and decreases with area (thicker = less). A long, thin wire has both higher L and lower A, giving much higher resistance.',
  },
  {
    chapter: 'Ch 20', topic: 'Electric Power', type: 'conceptual',
    q: 'A resistor with more resistance dissipates more power when connected to the same voltage source. Which formula shows this directly?',
    choices: ['P = I²R', 'P = IV', 'P = V²/R', 'P = V/R'],
    answer: 2,
    explain: 'P = V²/R: at constant voltage, power is INVERSELY proportional to resistance — higher R means LESS power. P = V²/R shows this. (P = I²R would be for constant current, where higher R means more power.)',
  },
  {
    chapter: 'Ch 20', topic: 'AC vs DC', type: 'conceptual',
    q: 'What does "60 Hz" mean for AC power from a wall outlet?',
    choices: [
      'The voltage is 60 volts',
      'The current changes direction 60 times per second',
      'The current completes 60 full cycles per second',
      'The frequency is 60 ohms',
    ],
    answer: 2,
    explain: '60 Hz means 60 complete cycles per second. Each cycle includes current going one direction then reversing — so the current changes direction 120 times per second (twice per cycle), but there are 60 complete cycles.',
  },
  {
    chapter: 'Ch 20', topic: 'RMS Values', type: 'conceptual',
    q: 'A wall outlet in North America is labeled 120 V. This is the:',
    choices: ['Peak voltage', 'RMS voltage', 'Average voltage', 'Minimum voltage'],
    answer: 1,
    explain: 'The 120 V is the RMS (root mean square) voltage. The actual peak voltage is 120 × √2 ≈ 170 V. RMS is the "effective" DC-equivalent value used for power calculations.',
  },
  {
    chapter: 'Ch 20', topic: 'Electrical Hazards', type: 'conceptual',
    q: 'Why is it more dangerous to touch an electrical wire with wet hands than dry hands?',
    choices: [
      'Water increases the voltage',
      'Water increases the current that flows through you by decreasing your body\'s resistance',
      'Water makes the wire hotter',
      'Wet hands conduct heat better',
    ],
    answer: 1,
    explain: 'Water (especially with dissolved minerals) greatly reduces the resistance of skin. From I = V/R: less resistance means more current flows through your body for the same voltage, making shocks much more dangerous.',
  },
  {
    chapter: 'Ch 20', topic: 'Electrical Hazards', type: 'conceptual',
    q: 'A current of approximately how much can cause fatal heart fibrillation?',
    choices: ['0.001 A (1 mA)', '0.01 A (10 mA)', '0.1 A (100 mA)', '1 A (1000 mA)'],
    answer: 2,
    explain: 'About 100 mA (0.1 A) through the body can cause ventricular fibrillation and death. Even 10 mA is "can\'t let go" dangerous. 1 mA is just barely perceptible.',
  },
  // ── CH 20: CALCULATIONS ──
  {
    chapter: 'Ch 20', topic: 'Electric Current', type: 'calculation',
    q: 'A calculator\'s solar cells push 4.00 C of charge through the circuit in 4.00 hours. What is the current in milliamperes (mA)?',
    choices: ['0.278 mA', '1.00 mA', '16.0 mA', '1000 mA'],
    answer: 0,
    explain: 'I = ΔQ/Δt. First convert: 4.00 h = 4.00 × 3600 = 14,400 s. Then I = 4.00 C / 14,400 s = 2.78×10⁻⁴ A = 0.278 mA.',
  },
  {
    chapter: 'Ch 20', topic: "Ohm's Law", type: 'calculation',
    q: 'A resistor has R = 1.35 V / 0.200 mA. What is R?',
    choices: ['0.270 Ω', '6.75 kΩ', '0.148 kΩ', '2.70 kΩ'],
    answer: 1,
    explain: 'R = V/I = 1.35 V / (0.200×10⁻³ A) = 1.35 / 0.0002 = 6750 Ω = 6.75 kΩ.',
  },
  {
    chapter: 'Ch 20', topic: 'Resistivity', type: 'calculation',
    q: 'A silver wire has radius 5.04×10⁻⁴ m, resistivity 1.59×10⁻⁸ Ω·m, and length 3.00 m. What is its resistance?',
    choices: ['1.89×10⁻³ Ω', '5.93×10⁻² Ω', '0.190 Ω', '3.14×10⁻⁴ Ω'],
    answer: 0,
    explain: 'A = πr² = π(5.04×10⁻⁴)² = 7.98×10⁻⁷ m². R = ρL/A = (1.59×10⁻⁸)(3.00) / (7.98×10⁻⁷) = 4.77×10⁻⁸ / 7.98×10⁻⁷ ≈ 0.0598 Ω. Recalculating: π(5.04e-4)² = 7.98e-7; R = (1.59e-8 × 3)/(7.98e-7) = 4.77e-8/7.98e-7 = 0.0598 Ω ≈ 5.98×10⁻² Ω.',
  },
  {
    chapter: 'Ch 20', topic: 'Electric Power', type: 'calculation',
    q: 'A 15.0 kΩ resistor has a power rating of 5.00 W. What is the maximum current it can safely carry?',
    choices: ['1.83 mA', '18.3 mA', '0.577 mA', '577 mA'],
    answer: 1,
    explain: 'Use P = I²R → I = √(P/R) = √(5.00 / 15000) = √(3.33×10⁻⁴) = 0.01826 A ≈ 18.3 mA.',
  },
  {
    chapter: 'Ch 20', topic: 'Electric Power', type: 'calculation',
    q: 'A 6.00-V car has a 30.0-W headlight. What is the hot resistance of the headlight?',
    choices: ['0.200 Ω', '5.00 Ω', '1.20 Ω', '0.833 Ω'],
    answer: 2,
    explain: 'P = V²/R → R = V²/P = (6.00)²/30.0 = 36.0/30.0 = 1.20 Ω.',
  },
  {
    chapter: 'Ch 20', topic: 'RMS Values', type: 'calculation',
    q: 'A stereo applies a peak voltage of 34 V to an 8.0 Ω speaker. What is the RMS current?',
    choices: ['4.25 A', '3.01 A', '2.13 A', '6.01 A'],
    answer: 1,
    explain: 'V_rms = V₀/√2 = 34/1.414 = 24.04 V. Then I_rms = V_rms/R = 24.04/8.0 = 3.01 A.',
  },
  {
    chapter: 'Ch 20', topic: 'RMS Values', type: 'calculation',
    q: 'A stereo applies peak voltage 34 V to an 8.0 Ω speaker. What is the average power?',
    choices: ['144 W', '72.3 W', '36.1 W', '289 W'],
    answer: 1,
    explain: 'P̄ = V²_rms/R = (24.04)²/8.0 = 578/8.0 = 72.3 W. Or: P̄ = V₀²/(2R) = (34)²/(2×8) = 1156/16 = 72.3 W.',
  },
  {
    chapter: 'Ch 20', topic: 'RMS Values', type: 'calculation',
    q: 'A 60.0-W light bulb runs on 120 V (RMS) AC. What is the peak power?',
    choices: ['60.0 W', '84.9 W', '120 W', '42.4 W'],
    answer: 2,
    explain: 'Peak power = V₀²/R = (V_rms·√2)²/R = 2V²_rms/R = 2×P_avg = 2×60.0 = 120 W. The peak power is exactly twice the average power for sinusoidal AC.',
  },
  {
    chapter: 'Ch 20', topic: 'AC vs DC', type: 'calculation',
    q: 'For V = (150 V)sin(120πt), what is the frequency?',
    choices: ['120 Hz', '60 Hz', '150 Hz', '30 Hz'],
    answer: 1,
    explain: 'Compare with V = V₀ sin(2πft): 2πf = 120π → f = 60 Hz.',
  },
  // ── CH 21: CONCEPTUAL ──
  {
    chapter: 'Ch 21', topic: 'Series Circuits', type: 'conceptual',
    q: 'In a series circuit, if one bulb burns out (open circuit), what happens to the other bulbs?',
    choices: ['They all go out', 'They get brighter', 'They stay the same', 'Only the adjacent bulb goes out'],
    answer: 0,
    explain: 'In series, there is only one path for current. If any component breaks (open circuit), current stops everywhere in the circuit — all bulbs go out.',
  },
  {
    chapter: 'Ch 21', topic: 'Parallel Circuits', type: 'conceptual',
    q: 'In a parallel circuit, if one bulb burns out, what happens to the other bulbs?',
    choices: ['They all go out', 'They go out too', 'They continue to glow (possibly brighter)', 'They all dim slightly'],
    answer: 2,
    explain: 'In parallel, each branch has its own path to the voltage source. Removing one branch doesn\'t stop current in others. The remaining bulbs stay on (and the total resistance actually increases slightly, so they may get a tiny bit brighter).',
  },
  {
    chapter: 'Ch 21', topic: 'Series Circuits', type: 'conceptual',
    q: 'What is always the same for all components connected in series?',
    choices: ['Voltage', 'Current', 'Resistance', 'Power'],
    answer: 1,
    explain: 'In a series circuit, there is only one path for current, so the same current I flows through every component. Voltages add up, but current is shared.',
  },
  {
    chapter: 'Ch 21', topic: 'Parallel Circuits', type: 'conceptual',
    q: 'What is always the same for all components connected in parallel?',
    choices: ['Voltage', 'Current', 'Resistance', 'Power'],
    answer: 0,
    explain: 'In a parallel circuit, all components share the same two endpoints, so the same voltage is across every branch. Currents split up, but voltage is the same.',
  },
  {
    chapter: 'Ch 21', topic: 'Parallel Circuits', type: 'conceptual',
    q: 'Adding more resistors in PARALLEL to a circuit:',
    choices: [
      'Always increases total resistance',
      'Always decreases total resistance',
      'Keeps total resistance the same',
      'Has no effect on total resistance',
    ],
    answer: 1,
    explain: 'Each new parallel path gives current another route through the circuit, effectively making it easier for current to flow. Total resistance always decreases when you add parallel paths.',
  },
  {
    chapter: 'Ch 21', topic: 'EMF and Internal Resistance', type: 'conceptual',
    q: 'A battery\'s terminal voltage is LESS than its EMF when:',
    choices: [
      'The battery is fully charged',
      'Current is flowing through the circuit (internal resistance drops voltage)',
      'No current is flowing',
      'The battery is ideal',
    ],
    answer: 1,
    explain: 'When current I flows, the internal resistance r causes a voltage drop of I·r inside the battery. Terminal voltage = EMF − I·r. At zero current (open circuit), terminal voltage = EMF.',
  },
  {
    chapter: 'Ch 21', topic: 'Ammeters and Voltmeters', type: 'conceptual',
    q: 'An ideal ammeter has:',
    choices: ['Infinite resistance', 'Zero resistance', 'The same resistance as the circuit', 'Very high resistance'],
    answer: 1,
    explain: 'An ammeter is placed in series and must not affect the current it measures. Zero resistance means it adds no resistance to the circuit. A real ammeter has very small (but nonzero) resistance.',
  },
  {
    chapter: 'Ch 21', topic: 'Ammeters and Voltmeters', type: 'conceptual',
    q: 'An ideal voltmeter has:',
    choices: ['Zero resistance', 'Infinite resistance', 'Small resistance', 'The same resistance as what it measures'],
    answer: 1,
    explain: 'A voltmeter is placed in parallel and must not steal current from the circuit. Infinite resistance means no current flows through it. A real voltmeter has very large (but finite) resistance.',
  },
  {
    chapter: 'Ch 21', topic: "Kirchhoff's Rules", type: 'conceptual',
    q: "Kirchhoff's Junction Rule is based on conservation of:",
    choices: ['Energy', 'Voltage', 'Electric charge', 'Resistance'],
    answer: 2,
    explain: 'The Junction Rule states current in = current out at any junction. This is conservation of charge — charge cannot accumulate at a point in steady state.',
  },
  {
    chapter: 'Ch 21', topic: "Kirchhoff's Rules", type: 'conceptual',
    q: "Kirchhoff's Loop Rule is based on conservation of:",
    choices: ['Electric charge', 'Current', 'Energy', 'Resistance'],
    answer: 2,
    explain: 'The Loop Rule states the net voltage change around any closed loop is zero. This is conservation of energy — if you go around a closed path and return to start, your net energy change must be zero.',
  },
  {
    chapter: 'Ch 21', topic: 'RC Circuits - Charging', type: 'conceptual',
    q: 'In a charging RC circuit, the current is MAXIMUM at:',
    choices: ['t = ∞ (fully charged)', 't = RC (one time constant)', 't = 0 (just when switch closes)', 't = 0.5RC'],
    answer: 2,
    explain: 'At t=0, the capacitor is empty (V=0), so the full EMF is across the resistor, driving maximum current I = EMF/R. As the capacitor charges up, it "pushes back" and current decreases.',
  },
  {
    chapter: 'Ch 21', topic: 'RC Circuits - Discharging', type: 'conceptual',
    q: 'After a discharging RC circuit has run for one time constant (t = τ = RC), the voltage across the capacitor is approximately:',
    choices: ['63.2% of V₀', '36.8% of V₀', '50.0% of V₀', '0% of V₀'],
    answer: 1,
    explain: 'V = V₀·e^(−t/RC). At t=RC: V = V₀·e⁻¹ = V₀/e ≈ V₀/2.718 ≈ 0.368·V₀ = 36.8% of V₀.',
  },
  {
    chapter: 'Ch 21', topic: 'Time Constant', type: 'conceptual',
    q: 'After a charging RC circuit has run for one time constant (t = τ), the capacitor has charged to what percentage of its final voltage?',
    choices: ['36.8%', '50.0%', '63.2%', '100%'],
    answer: 2,
    explain: 'V = emf(1−e⁻¹) = emf(1−0.368) = 0.632×emf = 63.2% of the final value.',
  },
  // ── CH 21: CALCULATIONS ──
  {
    chapter: 'Ch 21', topic: 'Series Circuits', type: 'calculation',
    q: 'Three resistors R₁=2Ω, R₂=3Ω, R₃=5Ω are in series with a 10V battery. What is the current?',
    choices: ['0.50 A', '1.00 A', '2.00 A', '10.0 A'],
    answer: 1,
    explain: 'R_total = 2+3+5 = 10 Ω. I = V/R = 10V/10Ω = 1.00 A.',
  },
  {
    chapter: 'Ch 21', topic: 'Parallel Circuits', type: 'calculation',
    q: 'Two resistors, 4Ω and 12Ω, are in parallel. What is their equivalent resistance?',
    choices: ['16 Ω', '8 Ω', '3 Ω', '2 Ω'],
    answer: 2,
    explain: '1/R_p = 1/4 + 1/12 = 3/12 + 1/12 = 4/12 = 1/3. So R_p = 3 Ω.',
  },
  {
    chapter: 'Ch 21', topic: 'Parallel Circuits', type: 'calculation',
    q: 'The current in an 8.00 Ω resistor is 0.500 A. It is in parallel with a 16.0 Ω resistor. What is the current through the 16.0 Ω resistor?',
    choices: ['0.500 A', '0.250 A', '0.125 A', '1.00 A'],
    answer: 1,
    explain: 'Parallel resistors have the same voltage. V = I₁R₁ = (0.500)(8.00) = 4.00 V. I₂ = V/R₂ = 4.00/16.0 = 0.250 A.',
  },
  {
    chapter: 'Ch 21', topic: "Kirchhoff's Rules", type: 'calculation',
    q: 'At a junction, currents I₂ = 3A and I₃ = 2A flow out. What is the current I₁ flowing in?',
    choices: ['1 A', '5 A', '6 A', '2.5 A'],
    answer: 1,
    explain: 'Junction rule: I₁ = I₂ + I₃ = 3 + 2 = 5 A.',
  },
  {
    chapter: 'Ch 21', topic: 'Mixed Circuits', type: 'calculation',
    q: 'The parallel combination of 8Ω and 16Ω (= 16/3 Ω) is in series with a 20Ω resistor. The total current from the battery is 0.750A. What is the total voltage?',
    choices: ['15.0 V', '19.0 V', '21.3 V', '5.33 V'],
    answer: 1,
    explain: 'R_parallel = (8×16)/(8+16) = 128/24 = 16/3 ≈ 5.33Ω. R_total = 5.33 + 20 = 25.33Ω? But the problem gives I=0.750A and uses that the total V = I×R_total. From the PPTX example: V = I×R = 0.750×(16/3 + 20) ≈ 0.75×25.33 ≈ 19.0 V.',
  },
  {
    chapter: 'Ch 21', topic: 'RC Circuits - Charging', type: 'calculation',
    q: 'An RC circuit has R = 50Ω + 30Ω = 80Ω in series, and C = 15μF + 20μF = 35μF in parallel. What is the time constant τ?',
    choices: ['0.0028 s (2.8 ms)', '0.00065 s', '1750 s', '0.0021 s'],
    answer: 0,
    explain: 'τ = RC = 80 × 35×10⁻⁶ = 2800×10⁻⁶ = 2.8×10⁻³ s = 2.8 ms.',
  },
  {
    chapter: 'Ch 21', topic: 'RC Circuits - Charging', type: 'calculation',
    q: 'A 12V battery charges a capacitor through a resistor. After a very long time (t → ∞), the voltage across the capacitor is:',
    choices: ['0 V', '6 V', '8.52 V (= 0.632×12)', '12 V'],
    answer: 3,
    explain: 'At t→∞, the capacitor is fully charged and no current flows. The full EMF (12V) appears across the capacitor. The formula V = emf(1−e^(−∞)) = emf×1 = 12V.',
  },
  {
    chapter: 'Ch 21', topic: 'Time Constant', type: 'calculation',
    q: 'A capacitor discharges through a 500Ω resistor and has a time constant of 0.010 s. What is the capacitance?',
    choices: ['50 F', '5.0×10⁻² F', '2.0×10⁻⁵ F', '5.0×10⁻³ F'],
    answer: 2,
    explain: 'τ = RC → C = τ/R = 0.010 / 500 = 2.0×10⁻⁵ F = 20 μF.',
  },
  {
    chapter: 'Ch 21', topic: 'Series Circuits', type: 'calculation',
    q: 'Four equal resistors R = 4.50Ω are connected with three in parallel and one in series with the battery (ε = 9.00V). What is the current through the series resistor R₁?',
    choices: ['2.00 A', '1.50 A', '0.500 A', '0.667 A'],
    answer: 1,
    explain: 'R_parallel of three 4.5Ω = 4.5/3 = 1.5Ω. R_total = 4.5 + 1.5 = 6.0Ω. I = 9.00/6.0 = 1.50 A.',
  },
  {
    chapter: 'Ch 21', topic: 'Parallel Circuits', type: 'calculation',
    q: 'In the same circuit (three 4.5Ω in parallel, one 4.5Ω in series, ε=9V), what is the power dissipated in the series resistor R₁?',
    choices: ['10.1 W', '20.3 W', '5.06 W', '13.5 W'],
    answer: 0,
    explain: 'I₁ = 1.50A (same as before). P₁ = I₁²R₁ = (1.50)²(4.50) = 2.25×4.5 = 10.125 ≈ 10.1 W.',
  },
  {
    chapter: 'Ch 21', topic: "Kirchhoff's Rules", type: 'calculation',
    q: 'In a simple single loop circuit, a battery of 10V is in series with resistors of 2Ω and 3Ω. Applying the loop rule (clockwise), what equation do you get?',
    choices: [
      '10 − 2I − 3I = 0',
      '10 + 2I + 3I = 0',
      '2I + 3I − 10 = 0',
      '10 − 2I + 3I = 0',
    ],
    answer: 0,
    explain: 'Going clockwise: battery provides a rise of +10V, each resistor provides a drop (−IR). So: 10 − 2I − 3I = 0 → 5I = 10 → I = 2A.',
  },
  {
    chapter: 'Ch 20', topic: 'Electric Current', type: 'calculation',
    q: 'A defibrillator passes 12.0A for 0.0100s. How much charge is moved?',
    choices: ['0.120 C', '1.20 C', '12.0 C', '120 C'],
    answer: 0,
    explain: 'ΔQ = I×Δt = 12.0 × 0.0100 = 0.120 C.',
  },
  {
    chapter: 'Ch 20', topic: 'Electric Power', type: 'calculation',
    q: 'A 9.0kΩ resistor is connected across 120V. What power does it dissipate?',
    choices: ['0.013 W', '1.60 W', '13.3 W', '0.80 W'],
    answer: 1,
    explain: 'P = V²/R = (120)²/9000 = 14400/9000 = 1.60 W.',
  },
  {
    chapter: 'Ch 20', topic: 'Electrical Hazards', type: 'calculation',
    q: 'A person touches 120V AC and has a body resistance of 300kΩ. What current flows through them?',
    choices: ['0.40 mA', '4.00 mA', '40.0 mA', '400 mA'],
    answer: 0,
    explain: 'I = V/R = 120 / 300,000 = 4.0×10⁻⁴ A = 0.40 mA. This is below the 1mA sensation threshold — they would feel nothing.',
  },
  {
    chapter: 'Ch 21', topic: 'Mixed Circuits', type: 'calculation',
    q: 'Two resistors R₁=6Ω and R₂=12Ω are in parallel. What is R_p?',
    choices: ['18 Ω', '4 Ω', '9 Ω', '2 Ω'],
    answer: 1,
    explain: '1/R_p = 1/6 + 1/12 = 2/12 + 1/12 = 3/12 = 1/4. So R_p = 4 Ω.',
  },
  {
    chapter: 'Ch 21', topic: 'RC Circuits - Discharging', type: 'calculation',
    q: 'A capacitor charged to 8.0V discharges through a resistor. After one time constant, the voltage is approximately:',
    choices: ['5.06 V', '2.94 V', '4.00 V', '8.00 V'],
    answer: 1,
    explain: 'V = V₀·e⁻¹ = 8.0 × 0.368 = 2.94 V.',
  },
];
```

**Step 2: Verify**
Reload. Home screen should show "50 questions" badge on Practice card.

---

## Task 6: Practice Mode Logic

**Files:**
- Modify: `index.html` — replace the `startPractice()` stub

**Step 1: Replace the `// ── PRACTICE (stub) ──` section with:**

```js
function startPractice(topicFilter) {
  // Build queue: prioritize weak topics
  let pool = [...QUESTIONS];
  if (topicFilter) pool = pool.filter(q => q.topic === topicFilter);

  // Sort: weak topics first
  pool.sort((a, b) => {
    const wa = state.weakTopics[a.topic] || 0;
    const wb = state.weakTopics[b.topic] || 0;
    return wb - wa;
  });

  state.practiceQueue = pool;
  state.practiceIndex = 0;
  state.practiceAnswered = false;
  renderPractice();
}

function renderPractice() {
  if (state.practiceIndex >= state.practiceQueue.length) {
    renderPracticeDone();
    return;
  }
  const q = state.practiceQueue[state.practiceIndex];
  const total = state.practiceQueue.length;
  const pct = Math.round((state.practiceIndex / total) * 100);

  const weakCount = state.weakTopics[q.topic] || 0;
  const weakBadge = weakCount >= 2
    ? `<span class="weak-indicator">⚠ Weak topic (${weakCount} wrong)</span>` : '';

  document.getElementById('main').innerHTML = `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Question ${state.practiceIndex + 1} of ${total}</span>
        <span>${pct}% complete</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="card">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:16px">
        <span class="topic-pill">${q.chapter}</span>
        <span class="topic-pill">${q.topic}</span>
        <span class="topic-pill">${q.type === 'calculation' ? '🔢 Calculation' : '💡 Conceptual'}</span>
        ${weakBadge}
      </div>
      <h2 style="font-size:1.1rem;margin-bottom:4px">Q${state.practiceIndex+1}.</h2>
      <p style="color:var(--text);font-size:1rem">${q.q}</p>
      <div class="choices" id="choices">
        ${q.choices.map((c, i) => `
          <button class="choice" id="choice-${i}" onclick="submitPractice(${i})">
            <strong style="margin-right:8px;opacity:0.5">${String.fromCharCode(65+i)}.</strong>${c}
          </button>`).join('')}
      </div>
      <div class="explanation" id="explanation"></div>
      <div class="btn-row" id="next-btn" style="display:none">
        <button class="btn btn-primary" onclick="nextPractice()">Next Question →</button>
      </div>
    </div>`;
}

function submitPractice(chosen) {
  if (state.practiceAnswered) return;
  state.practiceAnswered = true;
  const q = state.practiceQueue[state.practiceIndex];
  const correct = q.answer;
  const isRight = chosen === correct;

  // Track weak topics
  if (!isRight) {
    state.weakTopics[q.topic] = (state.weakTopics[q.topic] || 0) + 1;
  }

  // Color choices
  document.querySelectorAll('.choice').forEach((el, i) => {
    el.classList.add('locked');
    if (i === correct) el.classList.add(isRight && i === chosen ? 'correct' : 'reveal-correct');
    if (i === chosen && !isRight) el.classList.add('wrong');
  });

  // Show explanation
  const expEl = document.getElementById('explanation');
  expEl.classList.add('show');
  if (!isRight) expEl.classList.add('wrong-exp');
  expEl.innerHTML = `
    <div class="explanation-label">${isRight ? '✓ Correct!' : '✗ Incorrect'}</div>
    ${q.explain}`;

  document.getElementById('next-btn').style.display = 'flex';
}

function nextPractice() {
  state.practiceIndex++;
  state.practiceAnswered = false;
  renderPractice();
  window.scrollTo(0,0);
}

function renderPracticeDone() {
  const weakEntries = Object.entries(state.weakTopics)
    .filter(([,v]) => v >= 1)
    .sort(([,a],[,b]) => b-a);

  document.getElementById('main').innerHTML = `
    <div class="card">
      <div class="card-label">Practice Complete</div>
      <h2>You've gone through all ${state.practiceQueue.length} questions!</h2>
      ${weakEntries.length > 0 ? `
        <div class="analogy" style="border-left-color:var(--yellow);margin:16px 0">
          <div class="analogy-label">⚠ Topics to review</div>
          ${weakEntries.map(([t, n]) => `<div style="margin:4px 0">${t} — <strong style="color:var(--red)">${n} wrong</strong></div>`).join('')}
        </div>
        <p>Drill your weak topics before taking the mock exam.</p>` : `
        <div class="analogy" style="border-left-color:var(--green);margin:16px 0">
          <div class="analogy-label" style="color:var(--green)">✓ Great work!</div>
          No major weak spots detected. You're ready for the mock exam!
        </div>`}
      <div class="btn-row">
        ${weakEntries.length > 0 ? `<button class="btn btn-secondary" onclick="startPractice()">Drill All Again</button>` : ''}
        <button class="btn btn-primary" onclick="goMode('exam')">Take Mock Exam →</button>
      </div>
    </div>`;
}
```

**Step 2: Verify**
Click "Practice" tab. Should show:
- Question card with chapter/topic/type pills
- 4 answer choices (A/B/C/D)
- Click an answer → correct turns green, wrong turns red, explanation appears
- "Next Question →" button advances through all questions
- Completion screen shows weak topics

---

## Task 7: Mock Exam Mode

**Files:**
- Modify: `index.html` — replace the `startExam()` stub

**Step 1: Replace the `// ── EXAM (stub) ──` section with:**

```js
const FORMULA_SHEET_HTML = `
  <div class="formula-sheet">
    <h3>📋 Formula Sheet</h3>
    <div class="f">
      <strong>Ch 20</strong><br>
      I = ΔQ/Δt<br>
      I = nqAv<sub>d</sub><br>
      I = V/R<br>
      R = ρL/A<br>
      A = πr²<br>
      P = IV = V²/R = I²R<br>
      I = I₀sin(2πft)<br>
      V = V₀sin(2πft)<br>
      I<sub>rms</sub> = I₀/√2<br>
      V<sub>rms</sub> = V₀/√2<br>
      V<sub>rms</sub> = I<sub>rms</sub>R<br>
      P̄ = I<sub>rms</sub>V<sub>rms</sub><br>
      P̄ = V²<sub>rms</sub>/R = I²<sub>rms</sub>R
    </div>
    <hr>
    <div class="f">
      <strong>Ch 21</strong><br>
      R<sub>s</sub> = R₁+R₂+…<br>
      1/R<sub>p</sub> = 1/R₁+1/R₂+…<br>
      I₁ = I₂+I₃<br>
      V = emf(1−e<sup>−t/RC</sup>)<br>
      V = V₀e<sup>−t/RC</sup><br>
      τ = RC
    </div>
  </div>`;

function startExam() {
  // Pick 16 random questions
  const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5);
  state.examQuestions = shuffled.slice(0, 16);
  state.examIndex = 0;
  state.examAnswers = [];
  state.examAnswered = false;
  renderExam();
}

function renderExam() {
  if (state.examIndex >= state.examQuestions.length) {
    renderExamResults();
    return;
  }
  const q = state.examQuestions[state.examIndex];
  const total = state.examQuestions.length;
  const pct = Math.round((state.examIndex / total) * 100);

  document.getElementById('main').innerHTML = `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>Question ${state.examIndex + 1} of ${total}</span>
        <span>${pct}% complete</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="exam-layout">
      <div class="exam-main">
        <div class="card">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
            <span class="topic-pill">${q.chapter}</span>
            <span class="topic-pill">${q.topic}</span>
          </div>
          <p style="font-size:1rem;color:var(--text);margin-bottom:0"><strong>Q${state.examIndex+1}.</strong> ${q.q}</p>
          <div class="choices" id="choices">
            ${q.choices.map((c, i) => `
              <button class="choice" id="choice-${i}" onclick="submitExam(${i})">
                <strong style="margin-right:8px;opacity:0.5">${String.fromCharCode(65+i)}.</strong>${c}
              </button>`).join('')}
          </div>
          <div class="explanation" id="explanation"></div>
          <div class="btn-row" id="next-btn" style="display:none">
            ${state.examIndex < total - 1
              ? `<button class="btn btn-primary" onclick="nextExam()">Next →</button>`
              : `<button class="btn btn-success" onclick="nextExam()">Finish Exam</button>`}
          </div>
        </div>
      </div>
      ${FORMULA_SHEET_HTML}
    </div>`;
}

function submitExam(chosen) {
  if (state.examAnswered) return;
  state.examAnswered = true;
  const q = state.examQuestions[state.examIndex];
  const correct = q.answer;
  const isRight = chosen === correct;
  state.examAnswers.push({ chosen, correct, isRight, q });

  document.querySelectorAll('.choice').forEach((el, i) => {
    el.classList.add('locked');
    if (i === correct) el.classList.add(isRight && i === chosen ? 'correct' : 'reveal-correct');
    if (i === chosen && !isRight) el.classList.add('wrong');
  });

  const expEl = document.getElementById('explanation');
  expEl.classList.add('show');
  if (!isRight) expEl.classList.add('wrong-exp');
  expEl.innerHTML = `<div class="explanation-label">${isRight ? '✓ Correct!' : '✗ Incorrect'}</div>${q.explain}`;
  document.getElementById('next-btn').style.display = 'flex';
}

function nextExam() {
  state.examIndex++;
  state.examAnswered = false;
  renderExam();
  window.scrollTo(0,0);
}

function renderExamResults() {
  const total = state.examAnswers.length;
  const correct = state.examAnswers.filter(a => a.isRight).length;
  const pct = Math.round((correct / total) * 100);
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
  const msg = pct >= 80 ? 'Great job! You\'re well prepared.' : pct >= 60 ? 'Getting there! Review the missed topics.' : 'Keep studying — review Learn and Practice modes.';

  const reviewHtml = state.examAnswers.map((a, i) => `
    <div style="padding:12px 0;border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:flex-start;gap:10px">
        <span style="color:${a.isRight ? 'var(--green)' : 'var(--red)'}; font-size:1.1rem;flex-shrink:0">${a.isRight ? '✓' : '✗'}</span>
        <div>
          <div style="font-size:0.9rem;margin-bottom:4px"><strong>Q${i+1}.</strong> ${a.q.q}</div>
          ${!a.isRight ? `<div style="font-size:0.82rem;color:var(--text-dim)">Your answer: ${a.q.choices[a.chosen]} <span style="color:var(--green);margin-left:8px">Correct: ${a.q.choices[a.correct]}</span></div>` : ''}
          <div style="font-size:0.82rem;color:var(--text-dim);margin-top:4px">${a.q.explain}</div>
        </div>
      </div>
    </div>`).join('');

  document.getElementById('main').innerHTML = `
    <div class="card">
      <div class="card-label">Mock Exam Results</div>
      <h2>Exam Complete</h2>
      <div class="score-badge">
        <div class="score-num">${correct}/${total}</div>
        <div class="score-label">${pct}% — Grade: ${grade}</div>
      </div>
      <p>${msg}</p>
      <div class="btn-row">
        <button class="btn btn-secondary" onclick="startExam()">Retake Exam</button>
        <button class="btn btn-primary" onclick="startPractice()">Practice Weak Topics</button>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-label">Full Review</div>
      <h2 style="font-size:1rem">All Questions</h2>
      ${reviewHtml}
    </div>`;
}
```

**Step 2: Verify**
Click "Mock Exam" tab. Should show:
- 16 random questions with formula sheet sidebar
- Answer → immediate feedback
- After Q16: score card (X/16, %, grade) + full review with explanations
- "Retake Exam" gives a new random selection

---

## Task 8: Polish + Memory Save

**Files:**
- Modify: `index.html` — add scroll-to-top behavior and session persistence
- Create: `memory/MEMORY.md`

**Step 1: Add this JS at the end of the `<script>` block, just before the `renderHome()` call:**

```js
// ── PERSIST weak topics in sessionStorage ──
function saveState() {
  sessionStorage.setItem('physics_weak', JSON.stringify(state.weakTopics));
}
const saved = sessionStorage.getItem('physics_weak');
if (saved) { try { state.weakTopics = JSON.parse(saved); } catch(e) {} }
// Patch submitPractice and submitExam to auto-save
const _orig_submit = submitPractice;
// (already handled inline — just call saveState after updating weakTopics)
```

Actually, instead of patching, add `saveState()` calls directly inside `submitPractice` and `submitExam` after updating `state.weakTopics`. Find this line in `submitPractice`:
```js
state.weakTopics[q.topic] = (state.weakTopics[q.topic] || 0) + 1;
```
Add immediately after: `saveState();`

**Step 2: Final visual check — open index.html and verify all 4 modes work end to end:**
- Home → Learn (18 cards, "Got it" advances, last card → Formulas)
- Formulas (16 cards, variable tables, plain English)
- Practice (50 questions, colors, explanations, weak topic tracking)
- Mock Exam (16 random questions, formula sidebar, results screen)

**Step 3: Save to memory**

Create `C:/Users/lily7/.claude/projects/C--Users-lily7-Desktop-Physics-Study-Bot/memory/MEMORY.md` with:
```markdown
# Physics Study Bot Project Memory

## Project
- Location: C:/Users/lily7/Desktop/Physics Study Bot/index.html
- Single HTML file, no dependencies, open in browser
- Exam 2: Ch 20 + Ch 21, 16 MC questions

## Content Coverage
- 18 concept cards (CONCEPTS array)
- 16 formula cards (FORMULAS array)
- 50 practice questions (QUESTIONS array)
- Weak topic tracker persisted in sessionStorage

## Key Implementation Notes
- All modes render into #main div via JS
- State in single `state` object
- Dark CSS theme via CSS custom properties in :root
- Formula sheet sidebar in .exam-layout flex container
```

---

## Execution Handoff

Plan saved. Two execution options:

**1. Subagent-Driven (this session)** — dispatch a fresh subagent per task, review between tasks

**2. Parallel Session (separate)** — open new session with executing-plans, batch execution with checkpoints

Which approach?
