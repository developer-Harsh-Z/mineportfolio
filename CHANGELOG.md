# Project Changelog & Version History

This document tracks all the changes made to the portfolio project and maps them to specific versions.

## [Version 7] - The Intelligence (H-Bot Overhaul)
**Date:** April 28, 2026
**Summary:** Upgraded H-Bot with a more powerful LLM backend and fixed core movement/visual bugs.

### Added
- Integrated **Groq API** with `llama-3.1-8b-instant` for ultra-fast chat responses.
- Implemented **requestAnimationFrame movement logic** allowing H-Bot to smoothly "walk" between sections.
- Added a **2-second chat cooldown** and optimized context windows (3-message history) to respect API rate limits (6K TPM).
- Fixed **Light Mode unreadability** by transitioning H-Bot's CSS to a fully theme-aware design system.
- Added **window resize handling** to ensure H-Bot remains correctly positioned on all screen sizes.

### Fixed
- Resolved "static bot" bug where the robot wouldn't move from its starting position.
- Fixed 400 Bad Request error by mapping internal chat roles to API-compliant roles (`bot` → `assistant`).
- Fixed low-contrast text in speech bubbles for the light theme.


## [Version 6] - The Frequency (Music Player)
**Date:** April 25, 2026
**Summary:** Integrated a geo-aware, cassette-style music player.

### Added
- Implemented "The Frequency" component with YouTube IFrame API integration.
- Added IP-based geolocation detection to personalize music selection (e.g., Hindi lo-fi for India, Ambient for Global).
- Built a floating cassette UI that expands into a full player with waveform animations and shuffle logic.
- Integrated a hidden YouTube engine for seamless background playback.
- Added environment variable support for YouTube Data API keys.

## [Version 5] - Signal Contact System
**Date:** April 25, 2026
**Summary:** High-fidelity interactive contact interface with real-time feedback.

### Added
- Created "The Signal" contact system with two modes: Data Form and Voicemail.
- Integrated EmailJS for live email delivery from both modes.
- Implemented real-time voice-to-text transcription for the Voicemail feature using the Web Speech API.
- Added a cinematic "Terminal Output" animation for form submission feedback.
- Designed a custom "Wax Seal" animation for a premium tactile feel on voicemail submission.
- Fixed visibility issues using `IntersectionObserver` to trigger reveal animations reliably.

## [Version 4] - Interactive Hero

### Added/Changed
- Replaced the React Three Fiber 3D model with `harsh_img.png`.
- Added premium 3D tilt hover animations using React `onMouseMove` state calculation.
- Implemented continuous floating CSS animation (`@keyframes`) for dynamic resting state.
- Enhanced the background glow behind the image for a more integrated, cinematic feel.
- Removed unused `three` dependencies and the `<Canvas>` wrapper.

## [Version 3] - 3D Model Integration
**Date:** April 24, 2026
**Summary:** Cinematic 3D Hero Model Integration

### Added
- Installed `three`, `@react-three/fiber`, and `@react-three/drei`.
- Built `<HeroModel />` component to load `model (1).glb` and apply animations from `Standing Greeting.fbx`.
- Implemented cursor-tracking logic using `useFrame` to make the character's head/body follow the mouse movement.
- Integrated an absolute-positioned `<Canvas />` behind the hero typography with lighting and contact shadows.

## [Version 2] - Theme Toggle
**Date:** April 24, 2026
**Summary:** Added Light / Dark Mode Toggle

### Added
- Integrated a new light-mode design system with variables for parchment backgrounds, bright vermillion accents, and dark text.
- Built a `theme` state in `App.jsx` using React `useState` and `useEffect`.
- Implemented `localStorage` persistence to remember the user's selected theme across reloads.
- Added a desktop theme toggle button inside the `<nav>` component.
- Added a mobile theme toggle button inside the full-screen mobile menu.
- Switched hardcoded `rgba()` values in `index.css` to CSS custom properties (`var(--glow-color)`, `var(--ghost-text)`) to allow smooth transitions between themes.

## [Version 1] - React Migration
**Date:** April 24, 2026
**Summary:** Converted vanilla HTML/JS to a secure React + Vite Web Application

### Added
- Initialized a new **Vite** environment.
- Converted standard DOM elements into functional React components inside `App.jsx`.
- Converted all imperative JavaScript animations (custom cursor, split-screen loader, intersection observers) into React `useEffect` hooks with proper memory leak cleanups.
- Migrated global styles to `src/index.css`.
- Secured static assets by shifting them to the `public/` directory for production readiness.
- Validated all mobile-responsive grid templates and layout shifts.

---

*Note: The project is now version-controlled. Any rollback requests will automatically revert `src/App.jsx` and `src/index.css` to the exact state of the requested version.*
