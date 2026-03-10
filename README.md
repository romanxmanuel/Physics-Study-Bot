# ⚡ Physics 2 Study Bot

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Active-green.svg)]()
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web-brightgreen.svg)]()

_A free, interactive study tool for UCF Physics 2 (Chapters 20 & 21)_

</div>

---

## 🎯 What is This?

Physics 2 Study Bot is a **single-file web app** that helps you master electric current, circuits, and RC circuits through four interactive study modes. No installation required — just open it in your browser and start learning.

> 💡 **Perfect for:** UCF Physics 2 students preparing for Exam 2 (Chapters 20 & 21)

---

## ✨ Features

### 📖 Learn Mode
Understand each concept in plain English before touching any formulas. Includes helpful water-pipe analogies to build intuition.

### 🔢 Formulas Mode
Every exam formula, broken down variable-by-variable with units explained. Quick reference when doing practice problems.

### 🎯 Practice Mode
Multiple-choice questions with full explanations. The app tracks your weak topics and re-drills them automatically.

### 📝 Mock Exam
Simulate the real exam with 16 multiple-choice questions and an integrated formula sheet — just like the actual test.

---

## 🚀 How to Use

**It's incredibly simple:**

1. Download or clone this repository
2. Double-click `index.html`
3. Start studying in your browser!

```
No server required
No npm install
No build step
Works offline
```

---

## 📚 Topics Covered

| Chapter | Topics |
|---------|--------|
| **Ch 20** | Electric Current, Ohm's Law, Resistance, Resistors in Series & Parallel, Power, Electromotive Force (emf), Internal Resistance, Ammeters & Voltmeters, Kirchhoff's Junction & Loop Rules |
| **Ch 21** | Capacitors, Capacitance, RC Circuits (Charging & Discharging), Time Constant (τ), Complex Circuit Analysis |

---

## 🛠️ Tech Stack

- **100% Pure HTML/CSS/JavaScript** — zero dependencies
- **Single file architecture** — entire app in `index.html`
- **Dark theme** with mobile-responsive design
- **localStorage** for progress tracking
- No frameworks, no build tools, no npm

---

## 🎨 Preview

The app features a sleek **dark theme** with four navigation tabs. Here's what each mode offers:

- **Home:** Welcome screen with 4 clickable cards for each study mode
- **Learn:** 14 concept cards with water-pipe analogies and key points
- **Practice:** 20 multiple-choice questions with instant feedback and explanations
- **Mock Exam:** 16-question timed test with formula sheet sidebar

> 📸 _Screenshots coming soon!_

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Adding New Questions
Edit the `QUESTIONS` array in `index.html`:

```javascript
{
  topic: "series",
  question: "Your question here",
  choices: ["A", "B", "C", "D"],
  correct: 0, // index of correct answer
  explanation: "Why this answer is correct..."
}
```

### Adding New Concepts
Edit the `CONCEPTS` array in `index.html`:

```javascript
{
  title: "Concept Title",
  topic: "unique-topic-id",
  waterAnalogy: "Plain English analogy...",
  explanation: "Technical explanation...",
  keyPoints: ["Point 1", "Point 2"],
  formula: "Optional formula" // if applicable
}
```

### Adding Formulas
Edit the `FORMULAS` array in `index.html`:

```javascript
{
  name: "Formula Name",
  formula: "V = IR",
  variables: [
    { symbol: "V", meaning: "Voltage", unit: "Volts (V)" },
    { symbol: "I", meaning: "Current", unit: "Amperes (A)" },
    { symbol: "R", meaning: "Resistance", unit: "Ohms (Ω)" }
  ],
  topic: "resistance"
}
```

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add new Kirchhoff questions'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Credits

### Study Materials
The content in this app is based on:

- **University of Central Florida** — Physics 2 Course Materials
- **Textbook:** [Physics for Scientists and Engineers](https://www.cengage.com/c/serway-physics-scientists-engineers-9e/9781305548989) by Serway & Jewett
- **Chapter 20:** Electric Current and Resistance
- **Chapter 21:** Capacitors, RC Circuits, and Circuit Analysis

### Inspiration
- Water-pipe analogies adapted from classic physics pedagogy
- Dark UI inspired by modern developer tools
- Spaced repetition concept for weak-topic tracking

---

## ⚡ Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/physics-study-bot.git

# Open in browser
cd physics-study-bot
start index.html  # Windows
open index.html   # macOS
xdg-open index.html  # Linux
```

---

<div align="center">

**Made with 🔋 for physics students everywhere**

</div>
