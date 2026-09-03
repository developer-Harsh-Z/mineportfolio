# The Development Journey — Harsh's Portfolio

This document chronicles the evolution of this portfolio from a static HTML concept to a high-fidelity, interactive, and intelligent React web application.

---

## 🎬 Phase 1: The Migration (The Foundation)
**Objective:** Transform a standard vanilla HTML/JS site into a modern, scalable React architecture.

The journey began by stripping away the imperative DOM manipulations of the past and embracing the declarative power of **React**. We initialized a **Vite** environment for lightning-fast development and optimized every legacy asset. The "Split-Screen Loader" was the first complex logic migrated, ensuring a cinematic entrance for every visitor.

## 🌗 Phase 2: The Duality (Theme Engine)
**Objective:** Create a seamless transition between "The Darkness" and "The Light."

We built a custom theme engine that doesn't just swap colors, but shifts the entire mood. The dark mode uses deep charcoals and glowing vermillion, while the light mode evokes premium parchment and sharp ink. Using `localStorage` and CSS variables, we ensured the user's preference persists across the entire journey.

## 👁️ Phase 3: The Gaze (The Hero Section)
**Objective:** Build a hero section that feels alive.

We experimented with 3D models using React Three Fiber, but ultimately pivoted to a high-performance 2D image solution for better accessibility. By calculating mouse position in real-time, we implemented a 3D-tilt effect on Harsh's portrait, making it feel as if the user is truly interacting with a physical card.

## 🛰️ Phase 4: The Signal (The Contact System)
**Objective:** Turn a simple contact form into an experience.

We built "The Signal"—a multi-modal communication hub.
- **Mode A (Data Form):** A terminal-style interface that logs every step of the submission process.
- **Mode B (Voicemail):** A nostalgic cassette recorder that uses the Web Speech API to transcribe user voices in real-time.
Everything was wired to **EmailJS**, ensuring real-world reliability without the need for a complex backend.

## 📻 Phase 5: The Frequency (Music Player)
**Objective:** Personalize the visitor's auditory experience.

The final major addition was a geo-aware music player. By detecting the visitor's IP location, the site now tailors its soundtrack. Indian visitors are greeted with the warmth of Hindi lo-fi, while global visitors experience ambient cinematic beats. This was achieved by integrating the **YouTube Data API** and a custom invisible IFrame engine.

---

## 🛠️ The Tech Stack
- **Framework:** React + Vite
- **Styling:** Vanilla CSS (Design Systems approach)
- **APIs:** YouTube Data API v3, ipapi.co, EmailJS, Web Speech API
- **Deployment:** Vercel

## 🧠 Philosophy
This project was built with a single mantra: **"Designed with intention. Built with data."** Every animation is purposeful, every transition is timed, and every feature serves to tell the story of a developer who thinks as much as he builds.

---
*Last Updated: April 25, 2026*
