# Feature Spec — Contact Form
## "The Signal" — Data Form × Voicemail Hybrid
**Feature ID:** CONTACT-001  
**Folder:** /features/contact-form-feature.md  
**Status:** Ready to build  

---

## Concept

A contact section that has **two modes** — the visitor picks how they want to reach out:

**Mode A — Type It (Data Form)**  
A living, breathing form where typing triggers real-time data visualisations. The form IS the dashboard.

**Mode B — Say It (Voicemail)**  
A retro cassette recorder in the browser. Visitor records their voice. AI transcribes it live. Both audio + transcript get sent.

The two modes sit side by side as two cards the visitor picks from first. Choosing a mode triggers a cinematic transition into that experience.

---

## Visual Design

Follows the portfolio design system:
- Background: `#0d0b09` (warm obsidian)
- Accent: `#ff3d00` (vermillion)
- Text: `#f0e8d8` (parchment)
- Muted: `#7a6a5a`
- Border: `rgba(240,232,216,0.1)`
- Fonts: Harsh (display), Instrument Serif (body), JetBrains Mono (labels/code)

---

## MODE PICKER (Entry State)

Full section with chapter label: `Chapter 05 — Let's Talk`

Giant heading: `How do you want to reach me?` — Harsh font, ~64px

Two large mode cards side by side (each ~45% width, centered):

**Card A — Type It**
- Icon: animated bar chart (3 bars that bounce subtly in CSS)
- Label: `The Data Form` — Harsh font 28px
- Subtext: `Your words, visualised live` — JetBrains Mono 12px muted
- Tag: `[keyboard]` — pill border style

**Card B — Say It**
- Icon: animated cassette reel (CSS rotation on the spools)
- Label: `The Voicemail` — Harsh font 28px
- Subtext: `Record. Transcribe. Send.` — JetBrains Mono 12px muted
- Tag: `[microphone]` — pill border style

On hover: card border becomes `#ff3d00`, subtle background warms.
On click: selected card expands to full width, other card slides out — `cubic-bezier(0.76, 0, 0.24, 1)` 0.6s.

---

## MODE A — The Data Form

### Layout
Full width form area. Left side: form fields (60%). Right side: live data visualisations (40%).

### Form Fields

**Field 1 — Name**
- Input: JetBrains Mono, 15px, borderless bottom-border only (1px `--border`)
- Placeholder: `your name here_` with blinking cursor
- On type: triggers Word Cloud viz on the right → each character typed morphs the cloud

**Field 2 — Email**
- Standard email input, same style
- Validation: on blur, shows `✓ valid` in green or `✗ try again` in vermillion — JetBrains Mono 11px

**Field 3 — What's this about?**
- 4 pill-select options (not a dropdown): `Job Offer` · `Collaboration` · `Freelance` · `Just Saying Hi`
- Selected pill: fills `#ff3d00`, text goes dark
- Selecting one changes the right-side chart TYPE (job = radar, collab = network graph, freelance = bar chart, hi = simple wave)

**Field 4 — Message**
- Textarea, 6 rows, same border style
- Character counter: JetBrains Mono 10px bottom-right, muted
- On type: THREE live things update on right side simultaneously:
  1. Sentiment score bar (negative → neutral → positive, color shifts red→yellow→green)
  2. Message length bar chart (grows with each word)
  3. Keyword tags extracted from the message in real time (simple word frequency)

### Right Side — Live Visualisations
Panel label: `// live data` — JetBrains Mono 10px, muted, top-left
Three stacked mini-viz cards:

**Viz 1 — Sentiment Analyser**
- Label: `message sentiment`
- A single horizontal bar, color-transitions from `#ff3d00` (negative) through `#f5e2c0` (neutral) to `#57ff8c` (positive) based on simple keyword matching (happy/excited/interested = positive, urgent/asap/unfortunately = negative)
- Score shown as number: `-1.0` to `+1.0` — updates on every keystroke

**Viz 2 — Message Complexity**
- Label: `word breakdown`
- Mini bar chart: 3 bars — word count, sentence count, avg word length
- Bars animate height as user types
- All in vermillion, varying opacity

**Viz 3 — Keywords**
- Label: `extracted keywords`
- Tags appear and disappear as user types meaningful words
- Ignore: the, a, is, are, I, you, etc.
- Show top 5 keywords as animated pill tags in `--border` style

### Submit Button (Mode A)
Full width button, label: `run send_message.py` — JetBrains Mono 14px
On click: button transforms into a terminal block:
```
> initialising message payload...
> validating fields............. ✓
> encoding sentiment data........ ✓
> dispatching to harsh@harshvardhansingh.me
> message delivered ✓
> exit code 0
```
Each line types out one by one with 200ms delay. Then success state: `Message received. Harsh will get back to you.` — Harsh font italic, `#ff3d00`.

---

## MODE B — The Voicemail

### Layout
Centered, single column. Feels intimate and focused.

### Step 1 — The Recorder (Idle State)

A large retro cassette illustration (CSS/SVG):
- Two circular reels with subtle CSS rotation animation (idle = very slow, 0.5rpm feel)
- Cassette body: dark surface `#171310`, border `rgba(240,232,216,0.15)`
- Label on cassette: `TO: HARSH` — Harsh font italic
- Below cassette: a horizontal tape-scrub bar (waveform placeholder, flat line)

Below cassette:
- Giant record button: 64px circle, `#ff3d00` fill, white center dot
- Label: `tap to record` — JetBrains Mono 12px muted

### Step 2 — Recording State

- Cassette reels spin FAST (CSS animation speeds up to ~2rpm)
- Record button pulses: scale 1 → 1.08 → 1, opacity pulse
- Waveform bar comes alive: real-time audio waveform visualisation using Web Audio API (AnalyserNode → canvas drawing loop)
- Timer counts up: `00:00` → `00:01` → ... — JetBrains Mono, 24px, vermillion
- A live transcript appears BELOW the cassette as the user speaks — using browser SpeechRecognition API (webkit fallback) — text fades in word by word
- Max recording time: 90 seconds. At 80s: timer pulses red warning.

Stop button replaces record button: square icon (CSS), same size.

### Step 3 — Review State

Cassette reels stop. Waveform freezes showing the recording shape.

Two columns appear below cassette:

**Left — Audio Playback**
- Play/pause button (triangle icon in CSS)
- Scrub bar with progress indicator in `#ff3d00`
- Duration: `recorded: 00:23` — JetBrains Mono muted

**Right — Transcript**
- Label: `// auto-transcribed` — JetBrains Mono 10px muted
- Full transcript text in Instrument Serif 15px, editable (contenteditable or textarea)
- User can fix any transcription errors
- Below: `Name` and `Email` fields appear (same style as Mode A)

**Re-record option:** small link-style button `× start over` — JetBrains Mono 11px muted, top right

### Submit Button (Mode B)
Label: `seal & send` — Harsh font italic 20px
On click:
1. A circular wax seal animation plays over the cassette — a circle draws itself in `#ff3d00`, then the letter `H` stamps into it with a scale-bounce
2. Text below: `sealing your message...`
3. Then: `Sent. Harsh will hear your voice.` — Harsh font italic, `#ff3d00`

Both audio file (WebM/MP3) + transcript text are sent via EmailJS or a serverless function.

---

## Technical Implementation

### APIs & Libraries
| Need | Solution |
|---|---|
| Voice recording | `MediaRecorder API` (browser native) |
| Live waveform | `Web Audio API` — `AnalyserNode` + `canvas` |
| Live transcription | `SpeechRecognition API` (webkit prefix for Safari) |
| Sentiment analysis | Simple keyword dictionary (no API needed — 200 word map) |
| Email sending | `EmailJS` (free tier, no backend needed) |
| Animations | `Framer Motion` or pure CSS transitions |
| Charts/Viz | `D3.js` lightweight or `Chart.js` |

### File Structure
```
/components
  /Contact
    Contact.jsx              ← parent, mode picker
    ModeA_DataForm.jsx       ← data form with live viz
    ModeB_Voicemail.jsx      ← cassette recorder
    LiveSentiment.jsx        ← sentiment bar component
    LiveKeywords.jsx         ← keyword tag extractor
    LiveBarChart.jsx         ← word count bars
    CassetteVisual.jsx       ← CSS cassette illustration
    WaveformCanvas.jsx       ← real-time audio waveform
    TerminalSubmit.jsx       ← typewriter terminal output
    WaxSeal.jsx              ← animated wax seal
    contact.module.css       ← all styles scoped
```

### EmailJS Payload
```json
{
  "mode": "voicemail | dataform",
  "from_name": "{{name}}",
  "from_email": "{{email}}",
  "intent": "{{intent}}",
  "message": "{{message_or_transcript}}",
  "sentiment_score": "{{score}}",
  "audio_url": "{{uploaded_audio_url | null}}"
}
```

---

## Antigravity Build Prompt

> Paste this into Google Antigravity to build the contact section component.

---

Build a unique contact form React component called "The Signal" that combines two modes: a live data-visualisation form (Mode A) and a voice message recorder (Mode B). This is part of a portfolio website for a Data Science student named Harsh.

DESIGN SYSTEM (match exactly):
Background: #0d0b09. Accent: #ff3d00. Text: #f0e8d8. Muted: #7a6a5a. Border: rgba(240,232,216,0.1). Surface: #171310.
Fonts: 'Harsh' (custom ttf, display), 'Instrument Serif' (Google, body), 'JetBrains Mono' (Google, labels/code).

ENTRY STATE — MODE PICKER:
Full section. Chapter label top: "Chapter 05 — Let's Talk" — JetBrains Mono 11px, #7a6a5a, uppercase, letter-spacing 0.4em.
Heading: "How do you want to reach me?" — Harsh font 64px, #f0e8d8.
Two cards side by side (flex, gap 24px, justify-center, margin-top 48px):
Card A "The Data Form" — icon: 3 bouncing bars (CSS keyframe, staggered), label Harsh font 28px, subline JetBrains Mono 12px muted "Your words, visualised live", pill tag "[keyboard]".
Card B "The Voicemail" — icon: spinning cassette reels (CSS), label "The Voicemail", subline "Record. Transcribe. Send.", pill tag "[microphone]".
Cards: background #171310, border 1px rgba(240,232,216,0.1), border-radius 12px, padding 40px 32px, cursor pointer.
On hover: border-color #ff3d00 (transition 0.3s).
On click: selected card expands (flex-grow), other slides out, easing cubic-bezier(0.76,0,0.24,1) 0.6s. useState to track selectedMode ('dataform' | 'voicemail' | null).

MODE A — DATA FORM:
Two-column layout (60/40 split, gap 48px) that appears after card selection.

LEFT — FORM:
Field 1: Name input. JetBrains Mono 15px. No outer border — only border-bottom 1px rgba(240,232,216,0.15). Placeholder: "your name here_". Background transparent. Color #f0e8d8. On change: update nameValue state.

Field 2: Email input. Same style. On blur: validate with regex. Show "✓ valid" in #57ff8c or "✗ try again" in #ff3d00, JetBrains Mono 11px, below field.

Field 3: Intent selector. Four pill buttons in a flex row: "Job Offer" · "Collaboration" · "Freelance" · "Just Saying Hi". Default: border 1px rgba(240,232,216,0.1), #7a6a5a, JetBrains Mono 11px, padding 6px 14px, border-radius 20px. Selected: background #ff3d00, border-color #ff3d00, color #0d0b09. useState for selectedIntent.

Field 4: Message textarea. 6 rows. Same border-bottom style. On change: run sentiment analysis, extract keywords, update word count. All updates stored in state.

Submit button (full width, margin-top 32px): label "run send_message.py" — JetBrains Mono 14px, border 1px rgba(240,232,216,0.15), background transparent, color #f0e8d8. On click: if valid, set submitting=true and render TerminalOutput component.

TERMINAL OUTPUT component: renders lines one by one with 200ms delay each using useEffect + index state:
Line 1: "> initialising message payload..."
Line 2: "> validating fields............. ✓"
Line 3: "> encoding sentiment data........ ✓"
Line 4: "> dispatching to harsh@harshvardhansingh.me"
Line 5: "> message delivered ✓"
Line 6: "> exit code 0"
All in JetBrains Mono 13px, #7a6a5a, with ✓ marks in #57ff8c. After all lines: show "Message received. Harsh will get back to you." in Harsh font italic 24px, #ff3d00.

RIGHT — LIVE VISUALISATIONS (40% column):
Panel label top: "// live data" — JetBrains Mono 10px, #7a6a5a.
Three stacked cards (background #171310, border 1px rgba(240,232,216,0.08), border-radius 8px, padding 16px 20px, gap 12px):

VIZ 1 — SENTIMENT BAR:
Label: "message sentiment" — JetBrains Mono 10px muted.
A horizontal bar (height 6px, border-radius 3px, background rgba(240,232,216,0.1)).
Inner fill: width animates from 0-100% based on score. Color transitions: score < -0.3 = #ff3d00, -0.3 to 0.3 = #f5e2c0, > 0.3 = #57ff8c. Use CSS transition 0.3s on width and background-color.
Score display: JetBrains Mono 20px below, shows value from -1.0 to +1.0.
Sentiment function: check message text for positive words (great, excited, love, interested, hello, hi, amazing, opportunity, collab, work, build) = +0.2 each, negative words (urgent, asap, unfortunately, problem, issue, sorry) = -0.2 each. Clamp to [-1, 1].

VIZ 2 — WORD BREAKDOWN:
Label: "word breakdown" — JetBrains Mono 10px muted.
3 mini bars side by side (flex, gap 8px, align-end, height 60px):
Bar 1: word count (max display 100 words = full height), label "words"
Bar 2: sentence count (max 20 = full height), label "sentences"  
Bar 3: avg word length chars (max 10 = full height), label "avg len"
Each bar: width 100%, background #ff3d00, opacity varies (0.9, 0.6, 0.4). Border-radius 2px top only. Height animates with CSS transition 0.4s. Labels JetBrains Mono 9px below each bar, #7a6a5a.

VIZ 3 — KEYWORDS:
Label: "extracted keywords" — JetBrains Mono 10px muted.
Filter message words: lowercase, remove stopwords (the, a, an, is, are, i, you, we, and, or, but, in, on, at, to, for, of, with, my, your, it, be, have, do, this, that, was, will, can, me). Show top 5 remaining words as animated pill tags.
Each tag: JetBrains Mono 10px, padding 3px 10px, border 1px rgba(240,232,216,0.15), #7a6a5a, border-radius 20px. Appear with opacity 0→1 transition 0.3s. If no meaningful words yet: show "// start typing..." faded.

MODE B — VOICEMAIL:
Single column, centered, max-width 480px, margin auto.

CASSETTE VISUAL (CSS component):
A div styled as a cassette tape:
- Outer: width 280px, height 180px, background #171310, border 1px rgba(240,232,216,0.15), border-radius 8px, position relative, margin auto
- Two reel circles: position absolute, top 40px, left 55px and right 55px. Each 60px diameter, border 2px rgba(240,232,216,0.2), border-radius 50%. Inner spoke: 3 lines from center (use box-shadow trick or SVG). CSS animation: rotate 360deg. Idle: animation-duration 8s. Recording: animation-duration 1.5s. Stopped: animation-play-state paused. Transition duration 0.5s.
- Cassette label area: centered strip, background rgba(240,232,216,0.05), padding 8px 16px, bottom 20px. Text: "TO: HARSH" — Harsh font italic 16px, #f0e8d8.
- Tape window: rectangular cutout look in center top area using border-radius and box-shadow inset.

WAVEFORM CANVAS:
A canvas element (width 100%, height 60px) below the cassette.
Idle: flat line in center, color rgba(240,232,216,0.2).
Recording: use getUserMedia + AudioContext + AnalyserNode. In requestAnimationFrame loop: getByteTimeDomainData → draw waveform bars or line. Color: #ff3d00. Stop when recording stops, freeze last frame.

RECORD BUTTON:
64px circle button, background #ff3d00, border none, cursor pointer. Center: 16px white circle (inner dot, represents record).
Recording state: button pulses (CSS keyframe scale 1→1.08→1, 1s infinite). Inner dot becomes 12px square (stop icon).
Timer: JetBrains Mono 24px, #ff3d00, below button. Counts up with setInterval every 1s. Format: "00:00".
Max 90 seconds. At 80s: timer color pulses between #ff3d00 and #f5e2c0.

LIVE TRANSCRIPT:
Below waveform. Label: "// live transcript" — JetBrains Mono 10px muted.
Use browser SpeechRecognition API (window.SpeechRecognition || window.webkitSpeechRecognition). interim results: show in italic, #7a6a5a. Final results: show in Instrument Serif 15px, #f0e8d8. Words fade in one by one using CSS opacity transition.
If browser doesn't support SpeechRecognition: show note "// live transcript available in Chrome" in muted text, still allow recording + manual transcript edit.

REVIEW STATE (after stopping):
Reels stop spinning. Show two-column section below cassette:

Left — playback:
Create audio blob URL from recorded chunks. HTMLAudioElement for playback.
Play/pause button: CSS triangle/square toggle, 40px, border 1px rgba(240,232,216,0.2), border-radius 50%.
Progress bar: thin 2px line, fill #ff3d00, updates with timeupdate event.
Duration label: JetBrains Mono 11px muted "recorded: 00:23"

Right — transcript:
Label "// auto-transcribed" JetBrains Mono 10px muted.
Editable textarea with transcript text. Same border-bottom style as Mode A.
Below: Name and Email fields, same style as Mode A.

Re-record button: top right of section, "× start over" JetBrains Mono 11px #7a6a5a, no border, cursor pointer. On click: reset all state.

SUBMIT BUTTON (Mode B):
Label: "seal & send" — Harsh font italic 20px, #f0e8d8, border 1px rgba(240,232,216,0.15), padding 16px 48px, background transparent.
On click: animate wax seal. 
WAX SEAL ANIMATION: position absolute centered over cassette. A circle (80px) draws itself using SVG stroke-dashoffset animation: stroke #ff3d00, fill none, 1.5s. Then an "H" in Harsh font 28px #ff3d00 appears with scale 0→1 bounce (cubic-bezier(0.34,1.56,0.64,1)). Then entire seal fades and success text appears: "Sent. Harsh will hear your voice." Harsh font italic 24px, #ff3d00.

SENDING LOGIC (both modes):
Use EmailJS with your template. For Mode B: first try to upload audio blob to a temporary store (can be a simple POST to a serverless function or skip audio upload and just send transcript + note that audio was recorded). Form fields are validated before send. Show loading spinner (rotating circle, 24px, border 2px, border-top-color #ff3d00) during send.

GENERAL:
All transitions use cubic-bezier(0.23,1,0.32,1) unless specified otherwise.
No lorem ipsum. No placeholder images. 
Section padding: 120px 5vw.
Mobile (max 768px): all two-column layouts go single column. Mode picker cards stack vertically. Cassette scales to 240px wide.
Export as a single Contact.jsx file with all sub-components included, plus a contact.module.css file for styles.
