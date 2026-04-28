# Implementation Plan: H-Bot Visual & Functional Overhaul

## Phase 1: Visual Excellence & Identity
- [x] **Color Inversion (Light Mode)**: Reverse body and eye colors to improve visibility as requested (Body: Accent, Eyes: Surface).
- [x] **Chat Panel "Cloud" Design**: Refine the chat container shape to look more like an organic cloud/bubble rather than a simple rounded rectangle.
- [x] **Premium Polish**: Add subtle shadows and glassmorphism effects to the chat panel.

## Phase 2: User Interaction & Experience
- [x] **Secondary Bubble**: If "No Thanks" is clicked, show a gentle hint: *"You can also chat with me by clicking 'H'!"*
- [x] **Global Dismiss**: Implement a window click listener to dismiss active bubbles/prompts.
- [x] **Persistence**: Ensure chat history is preserved across mode changes without full component resets.
- [x] **Personalization**: Modify the system prompt/flow to ask for the user's name at the start and store it in state for the conversation.

## Phase 3: Mascot Logic (Mascot Behavior)
- [x] **Idle Behaviors**: 
    - [x] Random walking when no scrolling occurs.
    - [x] "Sleeping" state with 'zzz' animation if inactive for > 30s.
    - [x] "Climbing" behavior when at the screen edges.
- [x] **Movement Optimization**: Refine the ticker to be even smoother and less taxing on the CPU.

## Phase 4: Tour System Refinement
- [x] **Latency Fix**: Improve `IntersectionObserver` threshold and frequency to eliminate lag in section detection.
- [x] **Dynamic Narration**: Make the tour feel more "alive" with variable typing speeds and micro-emojis.

## Phase 5: Cross-Platform Optimization
- [x] **Responsive Scaling**: Use viewport units (vw/vh) and media queries to scale H-Bot and the chat UI for Mobile, Tablet, and Desktop.

---
*Priority: Phase 1 & 2 will be tackled first to fix the immediate visual/UX feedback.*
