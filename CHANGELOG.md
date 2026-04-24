# Project Changelog & Version History

This document tracks all the changes made to the portfolio project and maps them to specific versions.

## [Version 2] - Current (Latest)
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
