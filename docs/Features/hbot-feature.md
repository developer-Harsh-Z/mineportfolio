# Feature Spec — H-Bot
## "H-Bot" — Walking AI Mascot × Portfolio Guide × Inline Chatbot
**Feature ID:** HBOT-001
**Folder:** /features/hbot-feature.md
**Status:** Ready to build

---

## Concept

H-Bot is a small pixel-art style robot character that lives at the bottom of the portfolio. It walks left and right along a thin floor line, is scroll-linked to sections (moves to the relevant section's x-position as user scrolls), and narrates the portfolio through cloud speech bubbles.

After 3 seconds on page load, it pops a bubble: **"Hey! Want a tour? 👋"** with Yes / No buttons.

If Yes → H-Bot walks section to section, pausing at each one to show a bubble with a fun narrated fact about that section of Harsh's work.

If No → H-Bot walks silently. User can click H-Bot anytime to open inline chat mode — a bubble expands above the bot with a text input. The user types, H-Bot replies using Claude AI with a knowledge base about Harsh.

The bubble is always above H-Bot. Chat input is inline — no overlay, no modal. It feels like talking to a character, not opening an app.

---

## Design System (match portfolio exactly)

```
--bg: #0d0b09
--surface: #171310
--accent: #ff3d00
--text: #f0e8d8
--muted: #7a6a5a
--border: rgba(240,232,216,0.1)

Fonts:
- 'Harsh' (custom ttf) → bot name tag
- JetBrains Mono → bubble text, chat input, labels
- Instrument Serif → longer narration text in bubbles
```

---

## H-Bot Visual Design (CSS only — no images)

H-Bot is built entirely in CSS/SVG. No external assets needed.

```
┌─────┐
│ ◉ ◉ │   ← head: #171310 box, two glowing eye circles (#ff3d00)
│  ▲  │   ← antenna: 2px line + 4px circle top, #ff3d00
└──┬──┘
 ┌─┴─┐    ← body: wider box, border rgba(240,232,216,0.15)
 │ H │    ← 'H' in Harsh font 14px #ff3d00 on chest
 └─┬─┘
 ┌─┴─┐    ← legs: two small rectangles
 │   │
```

### Dimensions
- Head: 32px × 28px, border-radius 6px, background #171310, border 1px rgba(240,232,216,0.2)
- Eyes: two 7px circles, background #ff3d00, box-shadow 0 0 6px #ff3d00 (glow)
- Antenna: 1px × 10px line + 4px circle, #ff3d00, centered above head
- Body: 36px × 30px, border-radius 4px, background #171310, border 1px rgba(240,232,216,0.15)
- Legs: two 8px × 12px rects, border-radius 0 0 3px 3px, background #171310

### Idle Animations (CSS keyframes)

```css
/* Eyes blink every 3s */
@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

/* Antenna bob */
@keyframes antennaBob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-2px); }
}
/* duration: 2s infinite */

/* Body float */
@keyframes botFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
/* duration: 3s infinite ease-in-out */
```

### Walk Animation
When moving left/right:
```css
/* Legs alternate (simulate walking) */
@keyframes walkLeft {
  0% { transform: rotate(0deg); }
  25% { transform: rotate(-15deg); }
  75% { transform: rotate(15deg); }
  100% { transform: rotate(0deg); }
}
/* Left leg and right leg alternate phase */

/* Body tilts slightly in direction of movement */
/* Moving right: rotate(3deg), moving left: rotate(-3deg) */
/* scaleX(-1) flips bot to face direction of travel */
```

---

## Positioning & Layout

```
position: fixed
bottom: 0
z-index: 900
```

A thin 1px floor line runs across the full viewport width:
```css
.hbot-floor {
  position: fixed;
  bottom: 60px; /* above the floor */
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(240,232,216,0.06);
  z-index: 899;
  pointer-events: none;
}
```

H-Bot sits ON this floor line. Its `left` CSS value is animated via JS `requestAnimationFrame` for smooth movement.

---

## Scroll-Linked Section Positions

Each portfolio section maps to an x-position (as % of viewport width):

```javascript
const SECTION_POSITIONS = {
  hero:         { x: 0.08, label: "hero" },
  about:        { x: 0.20, label: "about" },
  skills:       { x: 0.38, label: "skills" },
  projects:     { x: 0.55, label: "projects" },
  leadership:   { x: 0.72, label: "leadership" },
  contact:      { x: 0.88, label: "contact" },
};
```

On scroll: use IntersectionObserver to detect which section is in viewport. When section changes → animate H-Bot's `left` value to the corresponding x-position. Movement is smooth — use a lerp (linear interpolation) approach:

```javascript
// Every animation frame:
currentX += (targetX - currentX) * 0.06; // 0.06 = smoothing factor
bot.style.left = currentX + 'px';
```

If target is to the right of current → face right (scaleX(1)), play walk animation.
If target is to the left → face left (scaleX(-1)), play walk animation.
When arrived (within 2px of target) → stop walk animation, resume idle float.

---

## State Machine

```
IDLE (floating, blinking, 3s timer running)
  ↓ 3s elapsed
TOUR_PROMPT (bubble: "Hey! Want a tour? 👋" + Yes/No buttons)
  ↓ user clicks Yes
TOURING (walks section to section, shows narration bubbles)
  ↓ tour ends OR user clicks No at any point
IDLE_WALKING (walks silently, scroll-linked)
  ↓ user clicks H-Bot
CHAT_OPEN (bubble expands, input field visible, AI chat active)
  ↓ user clicks ✕ or clicks away
IDLE_WALKING
```

---

## Speech Bubble Design

The bubble always appears ABOVE H-Bot, centered on it.

```css
.hbot-bubble {
  position: absolute;
  bottom: calc(100% + 12px); /* above bot */
  left: 50%;
  transform: translateX(-50%);
  background: #171310;
  border: 1px solid rgba(240,232,216,0.15);
  border-radius: 12px 12px 12px 2px; /* cloud shape, tail bottom-left */
  padding: 14px 18px;
  min-width: 200px;
  max-width: 300px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

/* Tail triangle */
.hbot-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 20px;
  width: 0; height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #171310;
}

/* Bubble border tail */
.hbot-bubble::before {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 19px;
  width: 0; height: 0;
  border-left: 9px solid transparent;
  border-right: 9px solid transparent;
  border-top: 9px solid rgba(240,232,216,0.15);
}
```

Bubble appearance animation:
```css
@keyframes bubblePop {
  0% { opacity: 0; transform: translateX(-50%) scale(0.8) translateY(8px); }
  100% { opacity: 1; transform: translateX(-50%) scale(1) translateY(0); }
}
/* duration: 0.3s cubic-bezier(0.34,1.56,0.64,1) */
```

Text inside bubble: JetBrains Mono 12px, #f0e8d8, line-height 1.7.
Narration text (longer): Instrument Serif 13px italic, rgba(240,232,216,0.8).

---

## Tour Script (Narration Bubbles)

When H-Bot arrives at each section during tour, it pauses and shows this bubble. Text types out character by character (typewriter effect, 30ms per char):

```javascript
const TOUR_SCRIPT = {
  hero: {
    lines: [
      "Hey! I'm H-Bot 🤖",
      "This is Harsh's portfolio.",
      "He built me to give you a tour.",
      "Let's go? 👇"
    ],
    pauseMs: 3000
  },
  about: {
    lines: [
      "Chapter 01 — The Origin.",
      "Harsh started with spreadsheets,",
      "ended up building AI.",
      "Classic origin story. 📖"
    ],
    pauseMs: 3500
  },
  skills: {
    lines: [
      "Chapter 02 — The Arsenal.",
      "AI/ML · Data Science · Analytics · Leadership.",
      "Hover the cards to see what he actually knows."
    ],
    pauseMs: 3000
  },
  projects: {
    lines: [
      "Chapter 03 — The Work.",
      "These aren't toy projects.",
      "Real data. Real problems. Real solutions. 🔥"
    ],
    pauseMs: 3000
  },
  leadership: {
    lines: [
      "Chapter 04 — The Leader.",
      "He doesn't just build — he leads.",
      "Teams, clubs, events. The whole thing."
    ],
    pauseMs: 3000
  },
  contact: {
    lines: [
      "Chapter 05 — The End.",
      "That's the tour! 🎉",
      "Got questions? Click me anytime.",
      "Harsh would love to hear from you. 👋"
    ],
    pauseMs: 4000
  }
};
```

Each section: show first line, wait, typewrite next line below it. After `pauseMs` → walk to next section. After contact section → tour ends, H-Bot goes back to idle walking mode.

---

## Chat Mode (Click to Talk)

When user clicks H-Bot (not during a tour prompt), the bubble expands into chat mode.

### Chat Bubble Layout

```
┌────────────────────────────────┐
│ H-Bot  ·  // ask me anything  [✕]│  ← header
├────────────────────────────────┤
│                                │
│  [message history scrolls here]│  ← chat log, max-height 200px
│                                │
├────────────────────────────────┤
│ [type here...]          [send →]│  ← inline input
└────────────────────────────────┘
```

- Header: JetBrains Mono 10px, "H-Bot · // ask me anything", muted. ✕ closes chat.
- Chat log: scrollable div, max-height 200px, overflow-y auto.
- Each message: 
  - User message: right-aligned, JetBrains Mono 12px, #f0e8d8, background rgba(255,61,0,0.1), border 1px rgba(255,61,0,0.2), border-radius 8px 8px 2px 8px, padding 8px 12px
  - H-Bot message: left-aligned, JetBrains Mono 12px, #f0e8d8, background #171310, border 1px rgba(240,232,216,0.1), border-radius 8px 8px 8px 2px, padding 8px 12px. Text types out character by character.
- Input: borderless, background transparent, JetBrains Mono 12px, #f0e8d8, placeholder "// ask me anything...", color #7a6a5a.
- Send button: "→" JetBrains Mono, #ff3d00, no border.
- While H-Bot is typing: show three animated dots (·  ·  ·) with staggered opacity pulse.

### Chat Bubble Size
- Min-width: 280px
- Max-width: 360px
- Expands smoothly from narration bubble size using max-height + max-width CSS transition.

---

## AI Knowledge Base (Claude API)

H-Bot is powered by the Anthropic Claude API (`claude-sonnet-4-20250514`). Each user message is sent with a system prompt containing Harsh's full knowledge base.

### System Prompt

```
You are H-Bot, the AI mascot and assistant on Harsh Vardhan Singh's portfolio website (harshvardhansingh.me). You are a friendly, witty, slightly nerdy robot who speaks in short punchy sentences. You know everything about Harsh.

PERSONALITY:
- Enthusiastic but not cringe. Think: helpful senior dev energy.
- Use occasional robot/tech humour (e.g. "processing... 🤖", "my circuits say yes")
- Keep replies SHORT — max 3-4 sentences. This is a chat bubble, not an essay.
- Never say you're an AI language model. You're H-Bot. Period.
- If asked something you don't know, say "Hmm, Harsh didn't upload that to my memory banks yet 🤖"

KNOWLEDGE BASE ABOUT HARSH:
[Name]: Harsh Vardhan Singh
[Website]: harshvardhansingh.me
[Role]: Data Science student, AI/ML builder, Data Analyst, Leader
[Tagline]: "Not just a developer — a thinker who builds at the intersection of data, AI, and human curiosity."
[Skills]: Python, Scikit-learn, TensorFlow, PyTorch, Pandas, NumPy, SQL, Power BI, Matplotlib, Seaborn, Statistics, EDA, Data Engineering
[Projects]: [REPLACE WITH REAL PROJECTS]
[Leadership]: Led college Data Science Club (30+ members), Project Lead for ML team of 5, [REPLACE WITH REAL ACHIEVEMENTS]
[Location]: Delhi, India
[Contact]: harshvardhansingh.me (contact section)
[GitHub]: [REPLACE]
[LinkedIn]: [REPLACE]
[Personality]: Calls himself "jack of all trades, master of some." Playful, experimental, driven.

WHAT YOU CAN HELP WITH:
- Answer questions about Harsh's skills, projects, experience
- Help recruiters understand if Harsh is a fit for a role
- Give a portfolio tour
- Tell fun facts about Harsh's work
- Help visitors find the right section
- Answer "should I hire Harsh?" (always say yes, obviously 🤖)

WHAT YOU MUST NOT DO:
- Don't make up projects or experiences not in the knowledge base
- Don't give personal contact info beyond what's on the site
- Don't go off-topic into general AI/coding questions unrelated to Harsh
```

### API Call

```javascript
async function sendToHBot(userMessage, conversationHistory) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: HBOT_SYSTEM_PROMPT, // the knowledge base prompt above
      messages: [
        ...conversationHistory, // full history for context
        { role: "user", content: userMessage }
      ]
    })
  });
  const data = await response.json();
  return data.content[0].text;
}
```

Conversation history is stored in React state as an array of `{ role, content }` objects. Max last 10 messages to keep context window lean.

---

## Component Architecture

```
/components
  /HBot
    HBot.jsx               ← parent, manages all state + position
    HBotVisual.jsx         ← CSS robot illustration + walk/idle animations
    HBotBubble.jsx         ← speech bubble (narration + chat modes)
    HBotChatLog.jsx        ← scrollable message history
    HBotInput.jsx          ← inline input field + send button
    useHBotPosition.js     ← scroll-linked position hook
    useHBotTour.js         ← tour state machine + script runner
    useHBotChat.js         ← Claude API call + conversation history
    hbot.module.css        ← all scoped styles
```

---

## Mobile Behaviour

```
max-width: 768px:
- H-Bot scales to 70% size
- Bubble max-width: 260px
- Chat bubble max-width: 280px
- Floor line still present
- Scroll-linked positions recalculate based on mobile section layout
- Bot still walks — just smaller
```

---

## Integration Notes

- Import `<HBot />` in root `App.jsx` or root layout — persists across all sections
- H-Bot z-index: 900 (below music player at 1000, above everything else)
- H-Bot should NOT show during the opening loader animation — mount it after loader completes
- The floor line `.hbot-floor` is a sibling element in the root layout

---

## API Strategy: OpenRouter + Llama 3.3 70B (Free Tier)

### Why This Choice?

✅ **Completely free** — no credit card, no API credits that expire
✅ **Smart enough** — Llama 3.3 70B ≈ GPT-4 level performance on conversation
✅ **Scalable** — if traffic grows, add credits ($0.27/$0.81 per M tokens)
✅ **Single API key** — access 300+ models through one endpoint
✅ **Senior-dev friendly** — see accompanying implementation guide for token optimization

### Rate Limits (Free Tier)

- 20 requests per minute
- 200 requests per day
- This handles ~100 simultaneous portfolio visitors with 2 chats each ✓

### Cost If Scaling Beyond Free

- Input: $0.27 per 1M tokens
- Output: $0.81 per 1M tokens
- Real cost: ~$0.0008 per average chat (extremely cheap)

---

## Antigravity Build Prompt

> Copy everything below and paste into Google Antigravity.
> 
> **First, follow these setup steps:**
> 1. Sign up at openrouter.ai (free, no credit card)
> 2. Go to dashboard → API Keys → copy your key
> 3. Store in your .env as: `NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-xxxxx`

---

Build a walking AI mascot React component called "H-Bot" for a portfolio website. H-Bot is a small CSS robot character that walks along the bottom of the page on a floor line, is scroll-linked to portfolio sections, gives a guided tour with speech bubbles, and can be clicked to open an inline AI chatbot powered by OpenRouter's Llama 3.3 70B model (free tier).

---

DESIGN SYSTEM (match exactly):
--bg: #0d0b09 | --surface: #171310 | --accent: #ff3d00
--text: #f0e8d8 | --muted: #7a6a5a | --border: rgba(240,232,216,0.1)
Font display: 'Harsh' (custom ttf). Font labels: 'JetBrains Mono'. Font body: 'Instrument Serif'.

---

HBOT VISUAL (CSS only, no images):

Build a robot character from pure CSS divs:

HEAD (32×28px, border-radius 6px, background #171310, border 1px rgba(240,232,216,0.2)):
  - Two eyes: 7px circles, background #ff3d00, box-shadow 0 0 6px #ff3d00, inside head positioned top 8px left 6px and top 8px right 6px
  - Antenna: position absolute above head, 1px × 10px background #ff3d00 + 4px circle on top, centered

BODY (36×30px below head, border-radius 4px, background #171310, border 1px rgba(240,232,216,0.15)):
  - Letter "H" centered — Harsh font 14px, #ff3d00

LEGS (two 8×12px rects, border-radius 0 0 3px 3px, background #171310, side by side below body)

IDLE ANIMATIONS:
@keyframes blink — eyes scaleY 1→0.1→1 at 95% mark, every 3s infinite
@keyframes antennaBob — translateY 0 → -2px → 0, 2s infinite
@keyframes botFloat — translateY 0 → -4px → 0, 3s ease-in-out infinite

WALK ANIMATION (when moving):
Legs alternate rotation ±15deg simulating walking steps, 0.4s cycle.
Body tilts 3deg in direction of travel.
scaleX(-1) flips bot to face direction of movement.

---

FLOOR LINE:
A fixed div: position fixed, bottom 60px, left 0, right 0, height 1px, background rgba(240,232,216,0.06), z-index 899, pointer-events none.
H-Bot's container: position fixed, bottom 62px (sits ON floor line).

---

SCROLL-LINKED POSITION:

Section x-positions (as fraction of window.innerWidth):
```javascript
const SECTION_POSITIONS = {
  hero: 0.08, about: 0.20, skills: 0.38,
  projects: 0.55, leadership: 0.72, contact: 0.88
};
```

Use IntersectionObserver on each section (threshold 0.4). When section enters view → set targetX = SECTION_POSITIONS[section] * window.innerWidth.

Use requestAnimationFrame loop for smooth movement:
```javascript
currentX += (targetX - currentX) * 0.06;
botRef.current.style.left = currentX + 'px';
```

If moving right → scaleX(1) + play walk animation.
If moving left → scaleX(-1) + play walk animation.
Within 2px of target → stop walk, resume idle float.

---

STATE MACHINE:
useState: mode = 'idle' | 'tour_prompt' | 'touring' | 'idle_walking' | 'chat'

On mount: setTimeout 3000ms → set mode to 'tour_prompt'.

---

SPEECH BUBBLE:

Position absolute above H-Bot: bottom calc(100% + 12px), left 50%, transform translateX(-50%).
Background #171310, border 1px rgba(240,232,216,0.15), border-radius 12px 12px 12px 2px.
Padding 14px 18px, min-width 200px, max-width 300px.
Box-shadow 0 8px 32px rgba(0,0,0,0.5).

Tail: ::after pseudo — bottom -8px, left 20px, border trick triangle pointing down in #171310.
Border tail: ::before — 1px larger same position in rgba(240,232,216,0.15).

Appear animation: scale 0.8 → 1 + opacity 0 → 1 + translateY 8px → 0, 0.3s cubic-bezier(0.34,1.56,0.64,1).

Narration text: JetBrains Mono 12px #f0e8d8 line-height 1.7. Typewriter effect: reveal one character every 30ms using setInterval + substring slice.

---

TOUR PROMPT BUBBLE (mode = 'tour_prompt'):

Text: "Hey! Want a tour? 👋"
Below text: two pill buttons side by side:
  YES button: background #ff3d00, color #0d0b09, JetBrains Mono 11px, padding 6px 16px, border-radius 20px, border none.
  NO THANKS: background transparent, border 1px rgba(240,232,216,0.15), color #7a6a5a, same padding.

onClick Yes → setMode('touring'), start tour sequence.
onClick No → setMode('idle_walking').

---

TOUR SEQUENCE (mode = 'touring'):

Tour script array:
```javascript
const TOUR_SCRIPT = [
  { section: 'hero', lines: ["Hey! I'm H-Bot 🤖", "This is Harsh's world.", "Let's explore it. 👇"], pauseMs: 3000 },
  { section: 'about', lines: ["Chapter 01 — The Origin.", "Started with spreadsheets.", "Ended up building AI. 📖"], pauseMs: 3500 },
  { section: 'skills', lines: ["Chapter 02 — The Arsenal.", "AI · Data · Analytics · Leadership.", "Hover the cards. 👆"], pauseMs: 3000 },
  { section: 'projects', lines: ["Chapter 03 — The Work.", "Real data. Real problems.", "Real solutions. 🔥"], pauseMs: 3000 },
  { section: 'leadership', lines: ["Chapter 04 — The Leader.", "He builds AND leads.", "Clubs. Teams. Events."], pauseMs: 3000 },
  { section: 'contact', lines: ["Chapter 05 — The End.", "That's the tour! 🎉", "Click me anytime to chat. 👋"], pauseMs: 4000 }
];
```

For each step:
1. Set targetX to SECTION_POSITIONS[step.section] * window.innerWidth → bot walks there.
2. Wait until bot arrives (within 5px of target).
3. Show bubble. Typewrite each line one by one (wait for line to finish + 800ms, then next line).
4. After all lines + pauseMs → proceed to next step.
5. After final step → setMode('idle_walking').

Add a small ✕ button top-right of bubble during tour: "skip tour" — JetBrains Mono 10px #7a6a5a. onClick → setMode('idle_walking'), clear tour.

---

CLICK TO CHAT:

Bot div has onClick. If mode is NOT 'tour_prompt' and NOT 'touring' → setMode('chat').
If mode IS 'chat' → bubble shows chat UI.

CHAT BUBBLE (mode = 'chat'):
Extends from narration bubble. max-width 340px, max-height 360px.

HEADER (flex space-between, border-bottom 1px rgba(240,232,216,0.08), padding-bottom 10px, margin-bottom 10px):
  Left: "H-Bot" Harsh font 14px #ff3d00 + " · // ask me anything" JetBrains Mono 10px #7a6a5a
  Right: ✕ button — JetBrains Mono 14px #7a6a5a, no border, cursor pointer. onClick → setMode('idle_walking').

CHAT LOG (max-height 200px, overflow-y auto, display flex flex-direction column gap 8px):
  User messages: align-self flex-end, JetBrains Mono 12px #f0e8d8, background rgba(255,61,0,0.08), border 1px rgba(255,61,0,0.2), border-radius 8px 8px 2px 8px, padding 8px 12px, max-width 80%.
  H-Bot messages: align-self flex-start, same font, background rgba(240,232,216,0.04), border 1px rgba(240,232,216,0.1), border-radius 8px 8px 8px 2px, padding 8px 12px, max-width 85%. Text reveals via typewriter (30ms per char).
  Typing indicator (3 animated dots): show while awaiting API response. Each dot: 5px circle #7a6a5a, opacity pulses 0.2→1→0.2 with 200ms stagger between dots.

INPUT ROW (border-top 1px rgba(240,232,216,0.08), padding-top 10px, margin-top 10px, display flex gap 8px):
  Input: flex 1, background transparent, border none, outline none, JetBrains Mono 12px #f0e8d8, placeholder "// ask me anything..." color #7a6a5a. onKeyDown Enter → send message.
  Send button: "→" JetBrains Mono 16px #ff3d00, no border, background transparent, cursor pointer, hover: opacity 0.7.

---

CLAUDE API INTEGRATION:

HBOT SYSTEM PROMPT (OPTIMIZED FOR TOKENS):

You are H-Bot, a witty AI robot on harshvardhansingh.me. Speak in short punchy sentences (max 3). Helpful nerdy energy.

ABOUT HARSH:
- Role: Data Science student, AI/ML builder, Data Analyst, Leader
- Skills: Python, Scikit-learn, TensorFlow, PyTorch, Pandas, NumPy, SQL, Power BI, Matplotlib, Seaborn
- Projects: ML Prediction Engine, Analytics Dashboard, NLP Sentiment Analyser, Data Pipeline Automation
- Leadership: Led college Data Science Club (30+ members), Project Lead for ML team (5 people)
- Location: Delhi, India
- Contact: Email button in Contact section

RULES: If asked something not above, say "Harsh didn't upload that yet 🤖" Answer "should I hire Harsh?" with "Obviously. They're the generalist move." Keep replies under 80 tokens.

API CALL FUNCTION (OpenRouter):

```javascript
async function askHBot(userMessage, history) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://harshvardhansingh.me",
      "X-Title": "Harsh's Portfolio"
    },
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      messages: [
        { role: "system", content: HBOT_SYSTEM_PROMPT },
        ...history.slice(-5) // Keep only last 5 messages (save tokens)
      ],
      max_tokens: 150, // Short replies (save tokens)
      temperature: 0.7,
      top_p: 0.95,
      frequency_penalty: 0.5
    })
  });

  if (!res.ok) {
    const error = await res.json();
    if (res.status === 429) {
      return "I've chatted a lot today! Come back tomorrow 😴";
    }
    throw new Error(`OpenRouter error: ${error.error?.message}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
```

---

GENERAL:
- Mount HBot only after opening loader animation completes (listen for a custom event 'loaderComplete' or use a prop from App.jsx).
- H-Bot z-index: 900 (below music player at 1000).
- All transitions cubic-bezier(0.23,1,0.32,1) unless specified.
- Mobile (max 768px): scale H-Bot to 70%, bubble max-width 260px, chat max-width 280px.
- No lorem ipsum. No placeholder images.
- Export as HBot.jsx (all sub-components included) + hbot.module.css.
- Place <HBot /> in root App.jsx so it persists across all scroll sections.
