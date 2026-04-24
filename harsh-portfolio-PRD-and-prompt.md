# PRD — Harsh's Portfolio Website
**Version:** 1.0 | **Owner:** Harsh | **Builder:** Google Antigravity

---

## 1. PRODUCT VISION

A cinematic, storytelling personal portfolio for a Data Science student who builds AI/ML projects, works in analytics, and leads teams. The site should feel like a **director's cut of a person** — not a resume, but a narrative. Playful, experimental, deeply personal.

**One-liner:** "Not just a developer — a thinker who builds at the intersection of data, AI, and human curiosity."

---

## 2. DESIGN SYSTEM

### Colors
| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#0d0b09` | Page background (warm obsidian) |
| `--surface` | `#171310` | Card / section surfaces |
| `--accent` | `#ff3d00` | Primary accent (electric vermillion) |
| `--accent-warm` | `#f5e2c0` | Secondary warm highlight |
| `--text-primary` | `#f0e8d8` | Main text |
| `--text-muted` | `#7a6a5a` | Labels, captions, secondary text |
| `--border` | `rgba(240,232,216,0.1)` | Borders, dividers |

### Typography
- **Display / Headings:** `harsh.ttf` (user's custom handwriting font — upload to font assets)
- **Body / Editorial:** `Instrument Serif` (Google Fonts — warm, italic-first, storytelling)
- **Labels / Code / Data:** `JetBrains Mono` (Google Fonts — technical identity)

### Motion Principles
- All page reveals: `cubic-bezier(0.76, 0, 0.24, 1)` — sharp ease, cinematic feel
- Scroll animations: elements translate Y from +50px to 0, opacity 0 to 1
- Stagger: 120ms between sibling elements
- Opening animation: ~3.5 seconds total
- No bouncy/spring animations — everything deliberate and weighted

### Custom Cursor
- Small filled circle 8px in `#ff3d00` — follows mouse exactly
- Larger ring 40px in `rgba(255,61,0,0.3)` — follows with 120ms lag
- On hover over links: cursor scales 2x, ring expands to 60px

---

## 3. SITE ARCHITECTURE

```
/ (home)
├── [LOADER] Opening animation (~3.2s)
├── [NAV] Fixed top navigation
├── [SECTION 1] Hero
├── [SECTION 2] About / My Story
├── [SECTION 3] Skills (interactive cards)
├── [SECTION 4] Projects
├── [SECTION 5] Leadership & Achievements
├── [SECTION 6] Contact + Socials
└── [FOOTER]
```

---

## 4. SECTION SPECIFICATIONS

### [LOADER] Opening Animation
**Sequence:**
1. Full screen `#0d0b09` background
2. Ghost counter: harsh.ttf ~200px, `rgba(240,232,216,0.04)`, counts 0→100, ease-out
3. Progress bar bottom: 1px line fills in `#ff3d00`, percentage in JetBrains Mono 11px
4. Three text lines clip-reveal from bottom (overflow hidden, translateY 110%→0):
   - `— Welcome to —` — JetBrains Mono 12px, muted, letter-spacing 0.35em — at 1.0s
   - `Harsh's` — harsh.ttf ~90px, #f0e8d8 — at 1.2s
   - `World.` — harsh.ttf ~90px, italic, #ff3d00 — at 1.4s
5. At 3.0s: text fades/slides up. Overlay splits — top panel slides up, bottom slides down — easing cubic-bezier(0.76,0,0.24,1) 0.9s

### [NAV]
- Logo: `H.` — H in harsh.ttf, dot in #ff3d00
- Links: Story · Skills · Projects · Leadership · Contact
- JetBrains Mono 11px, uppercase, 0.15em spacing, #7a6a5a → #f0e8d8 on hover
- Scroll: background rgba(13,11,9,0.85) + blur(12px) + border-bottom

### [SECTION 1] Hero
- Full 100vh, content bottom-left
- Grid background + radial glow
- Eyebrow: 40px #ff3d00 line + `// Student · Builder · Data Person`
- Headline: Not just a / developer. / A *thinker* / who builds. — "thinker" italic + #ff3d00
- Stats bottom-right: 5+ AI Projects · 3 Domains
- Scroll reveal on all elements after loader

### [SECTION 2] About / My Story
- Chapter 01 — The Origin
- 40/60 two-column, left sticky
- Ghost "01" number + "Who is Harsh?" heading — "Harsh?" italic + #ff3d00
- Four Instrument Serif paragraphs (storytelling tone, see full copy below)
- Info table: Primary Domain / Secondary / Hidden Superpower / Current Status (pulsing dot)

### [SECTION 3] Skills
- Chapter 02 — The Arsenal
- 2×2 grid, 1px border grid
- Cards: hover → left border grows in #ff3d00, background warms
- Four cards: AI/ML · Data Science · Data Analytics · Leadership

### [SECTION 4] Projects
- Chapter 03 — The Work
- Full-width list rows
- Hover: row slides right 20px + ↗ in #ff3d00 appears
- Project name in harsh.ttf ~52px

### [SECTION 5] Leadership
- Chapter 04 — The Leader
- Sticky left heading + vertical timeline right
- Timeline: 1px vertical border, #ff3d00 dots, items animate in on scroll

### [SECTION 6] Contact
- Chapter 05 — Let's Talk
- Giant heading: "Let's build together." — "together." italic + #ff3d00
- Email button: outlined → fills #ff3d00 on hover
- GitHub · LinkedIn · Resume links

---

## 5. ASSETS NEEDED FROM USER

- [ ] `harsh.ttf` — upload to `/fonts/` folder
- [ ] Real project names, descriptions, tech stacks, links
- [ ] Leadership timeline content (roles, dates, descriptions)
- [ ] Email address
- [ ] GitHub URL
- [ ] LinkedIn URL
- [ ] Resume PDF

---
---

# ANTIGRAVITY MASTER PROMPT
> Copy everything below this line and paste into Google Antigravity.

---

Build a cinematic storytelling personal portfolio website for "Harsh" — a Data Science student who builds AI/ML projects, works in data analytics, and has strong leadership experience. The site should feel like a filmmaker's portfolio that happens to be about data and AI — not a typical dev portfolio.

FONT SETUP:
- Display/Headings: Custom font called 'Harsh' loaded from harsh.ttf (user uploads file). Declare with @font-face, font-family: 'Harsh'. Use for ALL headings, logo, large text, and opening animation. Apply letter-spacing: -0.02em.
- Body: Instrument Serif from Google Fonts (import regular + italic). Use for paragraph text. Use italic variant for emphasis words.
- Labels/Code: JetBrains Mono from Google Fonts (300, 400 weights). Use for all small labels, tags, nav links, captions.

COLOR SYSTEM — use ONLY these values, no purple, blue or green anywhere:
--bg: #0d0b09 (warm obsidian, page background)
--surface: #171310 (cards and section surfaces)
--accent: #ff3d00 (electric vermillion, primary accent)
--accent-warm: #f5e2c0 (parchment, secondary highlight)
--text-primary: #f0e8d8 (main text)
--text-muted: #7a6a5a (labels, captions, secondary text)
--border: rgba(240,232,216,0.1) (all borders and dividers)

CUSTOM CURSOR:
Replace default cursor with a small solid circle (8px) in #ff3d00 that follows mouse precisely. Add a ring (40px diameter) in rgba(255,61,0,0.3) that follows with ~120ms lag using requestAnimationFrame. On hover over any link or button: dot scales to 2x, ring expands to 60px diameter. Use CSS transition for the scale.

OPENING ANIMATION (runs on page load, ~3.2 seconds before main content appears):
Create a full-page overlay div positioned fixed, inset 0, background #0d0b09, z-index 9000.

Inside the overlay:
1. A large ghost number element centered in the background — 'Harsh' font, ~200px, color rgba(240,232,216,0.04). Animate it counting from 0 to 100 over 2.5 seconds using setInterval with ease-out curve.
2. A progress bar at the bottom of the overlay: container is full width, 1px height, background rgba(240,232,216,0.1). Inner fill div starts at width 0% and grows to 100% matching the counter. Fill color: #ff3d00. Below the bar: flex row showing "Loading experience" left and percentage right, both JetBrains Mono 11px, #7a6a5a.
3. Center of overlay: three text lines, each wrapped in a div with overflow: hidden. The inner span starts at translateY(110%) opacity 0 and animates to translateY(0) opacity 1:
   - Line 1 animates at 1.0s: "— Welcome to —" in JetBrains Mono, 12px, letter-spacing 0.35em, #7a6a5a
   - Line 2 animates at 1.2s: "Harsh's" in Harsh font, 80-100px, #f0e8d8
   - Line 3 animates at 1.4s: "World." in Harsh font italic, 80-100px, #ff3d00
4. At 3.0 seconds: lines fade out (opacity 0, translateY -30px). The overlay splits into two panels — position absolute top half (height 50%) and bottom half (height 50%) both in #0d0b09 — top panel animates translateY(-100%), bottom panel animates translateY(100%), easing cubic-bezier(0.76, 0, 0.24, 1) over 0.9s. After split completes, remove the overlay from DOM.

FIXED NAVIGATION:
Logo left: "H." — H in Harsh font 20px, the period in #ff3d00.
Links right (JetBrains Mono 11px, uppercase, letter-spacing 0.15em, color #7a6a5a): Story · Skills · Projects · Leadership · Contact. Hover color: #f0e8d8.
On scroll past 60px: nav background becomes rgba(13,11,9,0.85) with backdrop-filter blur(12px) and 1px bottom border var(--border).

SECTION 1 — HERO (min-height: 100vh):
Background: #0d0b09. Add a subtle grid using CSS background-image with 1px lines at rgba(240,232,216,0.05) repeating every 80px. Add a radial-gradient glow: rgba(255,61,0,0.05) centered at 50% 40%, spread ~600px.
Content: flex column, justify-content flex-end, padding 0 5vw 80px.

Eyebrow (flex row, align-center, gap 16px, margin-bottom 24px):
- A div 40px wide, 1px height, background #ff3d00
- Text: "// Student · Builder · Data Person" — JetBrains Mono 12px, #ff3d00

Headline (Harsh font, font-size clamp(52px,9vw,130px), line-height 0.95, letter-spacing -0.03em, color #f0e8d8, margin-bottom 48px):
Not just a[br]developer.[br]A [span italic #ff3d00]thinker[/span][br]who builds.

Bottom row (flex, space-between, align flex-end, flex-wrap wrap, gap 40px):
Left: "// Data Science student. AI/ML builder. Analytics thinker. Leadership by default. The generalist who ships." — JetBrains Mono 13px, #7a6a5a, max-width 400px, line-height 1.8
Right: two stat blocks (flex gap 48px), each right-aligned:
  "5+" in Harsh font 48px #f0e8d8, below: "AI Projects" JetBrains Mono 10px #7a6a5a uppercase
  "3" in Harsh font 48px #f0e8d8, below: "Domains" JetBrains Mono 10px #7a6a5a uppercase

After loader: hero elements animate in with translateY(40px)→0, opacity 0→1, stagger 150ms per element.

SECTION 2 — ABOUT / MY STORY:
Border-top 1px var(--border). Padding 120px 5vw.
Chapter label: "Chapter 01 — The Origin" — JetBrains Mono 11px, #7a6a5a, letter-spacing 0.4em, uppercase. Display flex with a flex-1 right element as a 1px line in var(--border). Margin-bottom 60px.

Two-column grid (40% 60%, gap 80px):

LEFT COLUMN (position sticky, top 120px):
Ghost number "01" — Harsh font 180px, color rgba(240,232,216,0.04), line-height 1, margin-left -10px.
Heading below (margin-top -40px): Harsh font clamp(36px,5vw,64px), line-height 1.1, letter-spacing -0.02em.
Line 1: "Who is"
Line 2: "Harsh?" — this line in italic Harsh font + color #ff3d00

RIGHT COLUMN (padding-top 40px):
Four paragraphs, Instrument Serif 16px, line-height 2, rgba(240,232,216,0.65), margin-bottom 28px each. Bold/strong text uses color #f0e8d8, font-weight 400:

Para 1: "I started where most data people do — staring at a spreadsheet, wondering why numbers weren't telling a story. Then I learned to make them talk."

Para 2: "From building ML models that predict behaviour, to dashboards that reveal patterns nobody noticed — I've learned that the best insights live at the intersection of domains."

Para 3: "I'm the person who reads the data, codes the solution, leads the team, and still asks 'but why does this actually matter to a human being?'"

Para 4: "Some call it being a generalist. I call it being dangerous in the best way."

Info table below paragraphs (margin-top 48px, border-top 1px var(--border)):
Four rows, each with flex space-between, padding 18px 0, border-bottom 1px var(--border):
Row 1: "// Primary Domain" (JetBrains Mono 12px #7a6a5a) | "Data Science + AI/ML" (Instrument Serif 20px #f0e8d8)
Row 2: "// Secondary" | "Data Analytics"
Row 3: "// Hidden Superpower" | "Leadership"
Row 4: "// Current Status" | flex row: "Actively building" + 8px circle in #ff3d00 (CSS keyframe pulse animation, opacity 1→0.3→1, 1.5s infinite)

SECTION 3 — SKILLS:
Border-top 1px var(--border). Padding 120px 5vw.
Chapter label: "Chapter 02 — The Arsenal"

Grid of 4 cards (2x2, gap 1px, background var(--border), border 1px var(--border)):
Each card: background #0d0b09, padding 40px 32px, position relative, overflow hidden.
Left border effect: pseudo-element ::before — position absolute, left 0, top 0, width 2px, height 0, background #ff3d00. On card hover: height animates to 100% (transition 0.4s cubic-bezier(0.23,1,0.32,1)).
Card hover background: rgba(255,61,0,0.03).

Card 1: Icon "◈" (#ff3d00 28px, margin-bottom 20px). Title "AI & Machine Learning" Harsh font 26px. Description: "Building models that actually generalise. From regression to neural nets — I understand the math and the tradeoffs." Tags: Python · Scikit-learn · TensorFlow · PyTorch

Card 2: Icon "◉". Title "Data Science". Description: "End-to-end pipelines. Cleaning messy data, feature engineering, modelling, communicating results that non-data people actually understand." Tags: Pandas · NumPy · Statistics · EDA

Card 3: Icon "◇". Title "Data Analytics". Description: "Turning raw data into decisions. Dashboards, KPIs, trend analysis — the kind that changes what a team does on Monday." Tags: SQL · Power BI · Matplotlib · Seaborn

Card 4: Icon "◎". Title "Leadership". Description: "The skill that multiplies everything else. I've led teams, driven projects, and know how to move people toward a shared goal." Tags: Team Lead · Strategy · Communication

Tag style: JetBrains Mono 10px, uppercase, letter-spacing 0.12em, padding 4px 10px, border 1px var(--border), color #7a6a5a. On card hover: border-color rgba(255,61,0,0.3), color rgba(255,61,0,0.7).

SECTION 4 — PROJECTS:
Border-top 1px var(--border). Padding 120px 5vw.
Chapter label: "Chapter 03 — The Work"

Vertical list. Each row: display grid, columns (80px 1fr auto), gap 32px, align-center, padding 40px 0, border-bottom 1px var(--border), position relative, transition padding-left 0.4s cubic-bezier(0.23,1,0.32,1).

On hover: padding-left increases to 20px.
Arrow "↗" — position absolute right 0, font-size 20px, color #ff3d00, opacity 0, transform translate(-8px, 8px). On hover: opacity 1, transform translate(0,0), transition 0.3s.

Row structure:
- Number: JetBrains Mono 14px, #7a6a5a, align-self start, padding-top 6px
- Center: Project name in Harsh font clamp(28px,4vw,56px), line-height 1.1, then below: tech stack JetBrains Mono 12px #7a6a5a
- Right: badge(s) + year stacked, align right. Badge: JetBrains Mono 10px uppercase, padding 5px 12px, border 1px var(--border), #7a6a5a

Projects:
_01 · ML Prediction Engine · Python · Scikit-learn · [AI/ML] [2024]
_02 · Analytics Dashboard · SQL · Power BI · [Analytics] [2024]
_03 · NLP Sentiment Analyser · Python · Transformers · [AI/NLP] [2024]
_04 · Data Pipeline Automation · Python · Pandas · [Data Eng.] [2023]

SECTION 5 — LEADERSHIP & ACHIEVEMENTS:
Border-top 1px var(--border). Padding 120px 5vw.
Chapter label: "Chapter 04 — The Leader"

Two-column grid (40% 60%, gap 80px):

LEFT (sticky, top 120px):
Ghost "04" — Harsh font 180px, rgba(240,232,216,0.04).
Heading (margin-top -40px): Harsh font 48px, line-height 1.1.
"When data meets leadership," (line 1)
"things get [italic #ff3d00]done.[/italic]" (line 2)

RIGHT — vertical timeline:
Wrapper with position relative, padding-left 28px.
Vertical line: position absolute, left 0, top 0, bottom 0, width 1px, background var(--border).

Each timeline item (margin-bottom 48px, position relative):
- Dot: position absolute, left -32px, top 8px, width 8px, height 8px, border-radius 50%, background #ff3d00
- Date: JetBrains Mono 11px, #7a6a5a, uppercase, letter-spacing 0.2em, margin-bottom 8px
- Title: Harsh font 26px, #f0e8d8, margin-bottom 8px
- Description: Instrument Serif 14px, rgba(240,232,216,0.65), line-height 1.8

Timeline items (user replaces with real content):
2024 · Led college Data Science Club · 30+ members, organised workshops and hackathons connecting students with real industry problems.
2024 · Project Lead — ML Team · Coordinated a team of 5 on an end-to-end ML project. Managed timelines, code reviews, and the final presentation.
2023 · [Achievement / Position / Award] · Replace with your real achievement here.

SECTION 6 — CONTACT:
Border-top 1px var(--border). Padding 120px 5vw. Display flex, flex-direction column, align-items center, text-align center.

Chapter label (align-self flex-start, full width): "Chapter 05 — Let's Talk"

Small text (JetBrains Mono 12px, #7a6a5a, letter-spacing 0.25em, uppercase, margin-bottom 16px): "Got a project, idea, or opportunity?"

Main heading (Harsh font, font-size clamp(52px,10vw,140px), line-height 0.9, letter-spacing -0.04em, margin 40px 0):
"Let's[br]build[br][italic #ff3d00]together.[/italic]"

Email CTA button (display inline-flex, gap 12px, align-center, JetBrains Mono 14px, letter-spacing 0.2em, uppercase, color #f0e8d8, padding 18px 40px, border 1px var(--border), background transparent, cursor pointer):
"harsh@example.com ↗"
Hover: background #ff3d00, border-color #ff3d00, color #0d0b09. Transition 0.3s.

Social links (flex, gap 32px, margin-top 60px):
GitHub ↗ · LinkedIn ↗ · Resume ↗
JetBrains Mono 11px, uppercase, letter-spacing 0.2em, color #7a6a5a, no underline. Hover: #f0e8d8.

FOOTER:
Border-top 1px var(--border). Padding 32px 5vw. Flex space-between. JetBrains Mono 11px, #7a6a5a, letter-spacing 0.15em.
Left: "© 2025 Harsh" | Center: "Designed with intention. Built with data." | Right: "Delhi, India"

SCROLL REVEAL:
All section content should be hidden on load (opacity 0, translateY 40px). Use IntersectionObserver (threshold 0.12). When element enters viewport: transition to opacity 1, translateY 0, duration 0.8s, easing cubic-bezier(0.23,1,0.32,1). Sibling elements stagger with 120ms incremental delay.

MOBILE (max-width 768px):
- All two-column grids: single column
- Hero text: ~52px
- Opening animation text: ~44px
- Navigation: hamburger icon, tap opens full-screen overlay (#0d0b09), links in Harsh font large, centered
- Skills grid: single column
- Section padding: 80px 6vw

IMPORTANT:
- Load harsh.ttf via @font-face from ./fonts/harsh.ttf
- No lorem ipsum anywhere
- No stock photos
- No gradient text effects
- No purple, blue, or green colors anywhere — strictly warm obsidian, vermillion, and parchment palette only
- All placeholder text marked with [brackets] must be easy for user to find and replace
