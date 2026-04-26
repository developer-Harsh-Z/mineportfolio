# H-Bot in Antigravity: Quick Reference Card
## Copy-Paste Everything You Need

---

## 1️⃣ OPENROUTER API KEY

Go to: https://openrouter.ai → Sign in → Dashboard → API Keys

Copy your key. It looks like:
```
sk-or-v1-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Keep this safe. Don't share it.

---

## 2️⃣ ANTIGRAVITY PROMPT

**Copy this ENTIRE text and paste into Antigravity:**

```
Build a walking AI mascot React component called "H-Bot" for a portfolio website using OpenRouter's Llama 3.3 70B (free tier). 

SETUP: Get API key from openrouter.ai, store as NEXT_PUBLIC_OPENROUTER_API_KEY in .env

DESIGN SYSTEM:
--bg: #0d0b09 | --surface: #171310 | --accent: #ff3d00
--text: #f0e8d8 | --muted: #7a6a5a | --border: rgba(240,232,216,0.1)

HBOT VISUAL (pure CSS):
- HEAD: 32×28px box, 7px eyes (#ff3d00 with glow), antenna above
- BODY: 36×30px box, "H" letter centered (#ff3d00)
- LEGS: two 8×12px boxes below
- Animations: blink (3s), antennaBob (2s), botFloat (3s)
- Walk: legs rotate ±15deg, body tilts 3deg, scaleX(-1) to flip

FLOOR LINE: position fixed, bottom 60px, height 1px, rgba(240,232,216,0.06)

SCROLL-LINKED POSITIONS:
hero: 8%, about: 20%, skills: 38%, projects: 55%, leadership: 72%, contact: 88%

STATES: idle → tour_prompt (3s) → Yes: touring | No: idle_walking → Click bot: chat

SPEECH BUBBLE: position absolute above bot, bottom calc(100% + 12px), left 50%, max-width 300px
- Tour mode: typewriter text, narrates each section
- Chat mode: user input field + message history

TOUR SCRIPT:
hero: "Hey! I'm H-Bot 🤖 | This is Harsh's world. | Let's explore it. 👇"
about: "Chapter 01 — The Origin. | Started with spreadsheets. | Ended up building AI. 📖"
skills: "Chapter 02 — The Arsenal. | AI · Data · Analytics · Leadership. | Hover the cards. 👆"
projects: "Chapter 03 — The Work. | Real data. Real problems. | Real solutions. 🔥"
leadership: "Chapter 04 — The Leader. | He builds AND leads. | Clubs. Teams. Events."
contact: "Chapter 05 — The End. | That's the tour! 🎉 | Click me anytime to chat. 👋"

SYSTEM PROMPT (keep under 350 tokens for efficiency):
You are H-Bot, a witty AI robot on harshvardhansingh.me. Short punchy sentences (max 3). Helpful nerdy energy.

ABOUT HARSH:
- Role: Data Science student, AI/ML builder, Data Analyst, Leader
- Skills: Python, Scikit-learn, TensorFlow, PyTorch, Pandas, NumPy, SQL, Power BI, Matplotlib, Seaborn
- Projects: ML Prediction Engine, Analytics Dashboard, NLP Sentiment Analyser, Data Pipeline Automation
- Leadership: Led college Data Science Club (30+ members), Project Lead ML team (5 people)
- Location: Delhi, India

RULES: If asked something not above, say "Harsh didn't upload that yet 🤖" Answer "should I hire Harsh?" with "Obviously. They're the generalist move." Keep replies under 80 tokens.

API CALL (save tokens):
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer {API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "https://harshvardhansingh.me",
    "X-Title": "Harsh's Portfolio"
  },
  body: JSON.stringify({
    model: "meta-llama/llama-3.3-70b-instruct:free",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history.slice(-5)],
    max_tokens: 150,
    temperature: 0.7,
    frequency_penalty: 0.5
  })
})

TOKEN OPTIMIZATION:
1. Keep system prompt <350 tokens
2. Send only recent 5-6 messages from history
3. Set max_tokens to 150 (short replies)
4. Cache duplicate questions (localStorage)
5. Graceful message at 200 req/day limit

RATE LIMITS: 20 req/min, 200 req/day (free tier)
If limit hit, show preloaded response instead of API call

CHAT UI:
- Header: "H-Bot · // ask me anything" + close button
- Chat log: user messages right-aligned (orange tint), H-Bot messages left-aligned (dark)
- Input: borderless "// ask me anything..." placeholder
- Typing: 3 dots pulsing while awaiting response

MOBILE: Scale to 70%, bubble max-width 260px

Export: HBot.jsx + hbot.module.css
Place in App.jsx after loader completes
Z-index: 900
All transitions: cubic-bezier(0.23,1,0.32,1)
```

---

## 3️⃣ FILL IN YOUR INFO

In the generated code, find and replace:

```javascript
const HBOT_SYSTEM_PROMPT = `...
  - Projects: [YOUR PROJECTS]
  - Leadership: [YOUR ROLES]
  - Location: [YOUR CITY]
`;
```

**Examples:**

Projects:
```
ML Sentiment Analysis using BERT, Real-time Stock Price Prediction Dashboard, Data Pipeline Automation with Airflow
```

Leadership:
```
Led college Data Science Club (30 members), Organized 2 ML hackathons, Tech lead for AI club project
```

Location:
```
Delhi, India
```

---

## 4️⃣ ADD API KEY TO ENVIRONMENT

In your `.env.local` file:

```
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
```

Replace `xxxxxxxxxxxxx` with your actual key from Step 1.

**Or in Antigravity:**
- Settings (gear icon)
- Environment Variables
- Add: `NEXT_PUBLIC_OPENROUTER_API_KEY` = your key
- Save

---

## 5️⃣ TEST CHECKLIST

After deploying:

- [ ] Page loads without console errors (F12)
- [ ] After 3 seconds: "Hey! Want a tour?" appears
- [ ] Click YES: H-Bot walks + narrates sections
- [ ] Click NO: H-Bot walks silently
- [ ] Click H-Bot: Chat bubble opens
- [ ] Type message: Get response within 2-3 seconds
- [ ] Scroll page: H-Bot moves with sections
- [ ] Mobile: H-Bot visible, chat works

---

## 6️⃣ COMMON ERRORS & FIXES

| Error | Fix |
|-------|-----|
| "API key undefined" | Add to .env: `NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...` |
| H-Bot doesn't show | Check z-index is 900+, import in App.jsx |
| Chat doesn't reply | Check API key is correct, check quota (200/day) |
| Tour doesn't auto-start | Check setTimeout 3000ms is there |
| "Rate limited" | Wait until tomorrow (quota resets daily) |

---

## 7️⃣ FILE STRUCTURE (After Building)

```
src/
├── App.jsx (add import HBot + <HBot />)
├── components/
│   └── HBot.jsx (full component)
└── styles/
    └── hbot.module.css (styling)

.env.local (add NEXT_PUBLIC_OPENROUTER_API_KEY)
```

---

## 8️⃣ COST BREAKDOWN

**Free tier:** 200 requests/day = enough for 50-100 visitors chatting

**If you outgrow:**
- 1,000 chats/month ≈ $0.80
- 10,000 chats/month ≈ $8.00

**You will stay free** unless you have insane traffic.

---

## 9️⃣ TOKEN SAVING TIPS

**Compress system prompt:**
```javascript
// ❌ 1,200 tokens (BAD)
You are H-Bot, the AI mascot on Harsh Vardhan Singh's portfolio website. 
You are a friendly, witty, slightly nerdy robot who speaks in short punchy sentences...
[20 more lines]

// ✅ 280 tokens (GOOD)
You are H-Bot, a witty AI robot. Short punchy sentences. Helpful nerdy energy.

ABOUT HARSH:
- Role: Data Science student, AI/ML builder, Data Analyst, Leader
- Skills: Python, TensorFlow, Pandas, SQL, Power BI
[minimal list]
```

**Keep conversation history short:**
```javascript
// Keep only last 5 messages, not 50
messages: conversationHistory.slice(-5)
```

**Set output limit:**
```javascript
max_tokens: 150 // Short replies = save money
```

---

## 🔟 DEPLOYMENT FLOW

1. Build in Antigravity
2. Test in Preview
3. Check all items in Test Checklist
4. Deploy to Production
5. Share the live URL
6. Monitor usage (optional)

---

## 🎯 SUCCESS CRITERIA

✅ H-Bot walks when scrolling  
✅ Tour auto-starts after 3 seconds  
✅ Chat responds to messages  
✅ No console errors  
✅ Works on mobile  
✅ Under free tier budget  

**If all ✅, you shipped H-Bot successfully! 🚀**

---

## 📚 Full Docs

For detailed info, see:
- `ANTIGRAVITY-IMPLEMENTATION-GUIDE.md` (complete walkthrough)
- `hbot-feature.md` (full spec)
- `hbot-implementation-guide.md` (token optimization + code patterns)

---

## 🆘 Still Stuck?

1. Re-read the ANTIGRAVITY-IMPLEMENTATION-GUIDE.md
2. Check Troubleshooting section
3. Look for console errors (F12 → Console)
4. Make sure API key is in .env
5. Double-check placeholder info is filled

**You got this!** 🤖
