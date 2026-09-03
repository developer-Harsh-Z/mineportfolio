# H-Bot Implementation Guide
## "Build Smart. Save Tokens. Stay Quality."
**For:** Senior developers building token-efficient AI chatbots  
**Date:** April 2026  
**Target:** OpenRouter + Llama 3.3 70B free tier  

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Token Economics](#token-economics)
3. [Smart Request Strategy](#smart-request-strategy)
4. [Caching & Deduplication](#caching--deduplication)
5. [Prompt Engineering](#prompt-engineering)
6. [Rate Limit Management](#rate-limit-management)
7. [Production Code Patterns](#production-code-patterns)
8. [Monitoring & Optimization](#monitoring--optimization)

---

## Architecture Overview

H-Bot operates in two modes that require different token strategies:

### **Mode 1: Autonomous Tour (One-Way)**
- Bot walks sections, generates narration
- Minimal back-and-forth
- **Token optimization: CRITICAL** — reduce system prompt, cache tour script

### **Mode 2: Chat (Interactive)**
- User messages → H-Bot replies
- Full conversation history
- **Token optimization: MODERATE** — conversation pruning, smart history

---

## Token Economics

### **OpenRouter + Llama 3.3 70B Pricing**
```
Input:  $0.27 / 1M tokens
Output: $0.81 / 1M tokens  
Free tier: 200 requests/day max

Cost per 1000 tokens:
- Input:  $0.00027
- Output: $0.00081

1 month (30 days) free budget:
200 requests/day × 30 = 6,000 requests
Average: 500 tokens/request = 3M tokens/month free

Real math:
- 1 chat message (input 150 tokens, output 100 tokens): $0.00081
- 100 chats/day = $0.081/day = $2.43/month (very cheap!)
```

**Key insight:** You're NOT paying for volume. You're paying for **token bloat**. A 10,000-token system prompt that gets sent 100 times = waste.

---

## Smart Request Strategy

### **Rule 1: Never Send Full Context Twice**

❌ **WASTEFUL:**
```javascript
// Every request sends full system prompt + full history
const messages = [
  { role: "system", content: LONG_SYSTEM_PROMPT }, // 2000 tokens
  { role: "user", content: "Hi" },
  { role: "assistant", content: "Hey H-Bot here..." },
  { role: "user", content: "Tell me about projects" }
];
// API call #1: 2000+ tokens sent
// API call #2: 2000+ tokens sent again
// API call #3: same...
```

✅ **SMART:**
```javascript
// System prompt sent ONCE. Reuse state on client.
const systemPrompt = HBOT_SYSTEM_PROMPT; // sent once at init
const conversationHistory = []; // client-side only

// Each request = only NEW messages
async function chat(userMessage) {
  conversationHistory.push({ role: "user", content: userMessage });
  
  // Trim history to last 5 messages (keeps context, cuts fat)
  const recentHistory = conversationHistory.slice(-5);
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({
      model: "meta-llama/llama-3.3-70b-instruct:free",
      system: systemPrompt, // once per conversation
      messages: recentHistory // only recent context
    })
  });
}
```

**Savings:** ~80% token reduction per request.

---

### **Rule 2: Compress the System Prompt**

The H-Bot system prompt is your **biggest token drain**. Compress it ruthlessly.

❌ **BLOATED (1,200 tokens):**
```
You are H-Bot, the AI mascot on Harsh Vardhan Singh's portfolio website...

PERSONALITY: You are a friendly, witty, slightly nerdy robot who speaks 
in short punchy sentences. You are enthusiastic but not cringe. Think: 
helpful senior dev energy...

KNOWLEDGE BASE ABOUT HARSH:
Name: Harsh Vardhan Singh
Website: harshvardhansingh.me
Role: Data Science student, AI/ML builder, Data Analyst, Leader
[20 more lines of verbose explanations]
```

✅ **COMPRESSED (350 tokens):**
```
You are H-Bot, a witty AI mascot on harshvardhansingh.me. 
Short replies (max 3 sentences). Helpful, nerdy robot energy.

About Harsh:
- Data Science student, AI/ML builder, Data Analyst, Leader
- Python, TensorFlow, Pandas, SQL, Power BI
- 5+ projects, led teams, Delhi-based
- Portfolio: Hero → About → Skills → Projects → Leadership → Contact

If asked something not in this, say "Harsh didn't upload that yet 🤖"
```

**Savings:** 70% compression. Still captures everything.

---

### **Rule 3: Conversation History Pruning**

Don't keep 50 messages in history. Keep last 5-6.

```javascript
function pruneHistory(history, maxMessages = 6) {
  if (history.length <= maxMessages) return history;
  
  // Keep system context (usually role: "system")
  const systemMessage = history.find(m => m.role === "system");
  
  // Keep last N messages
  const recent = history.slice(-maxMessages);
  
  return systemMessage ? [systemMessage, ...recent] : recent;
}

// Before API call:
const trimmedHistory = pruneHistory(conversationHistory);
```

**Why?** Llama 3.3 has 8K context window. You only need last 5-6 messages (usually ~600 tokens). The rest is wasted space.

---

### **Rule 4: Smart Model Routing**

Not every request needs 70B parameters. Route smartly.

```javascript
async function routeToModel(userMessage, isComplex) {
  if (isComplex) {
    // Complex reasoning → Llama 3.3 (free)
    return "meta-llama/llama-3.3-70b-instruct:free";
  } else {
    // Simple acknowledgment → Gemma 3 (faster, smaller)
    return "google/gemma-3-9b-it:free";
  }
}

// Detect complexity:
const isComplex = userMessage.length > 150 || 
                  userMessage.includes("?") || 
                  userMessage.includes("how") ||
                  userMessage.includes("why");

const model = routeToModel(userMessage, isComplex);
```

**Savings:** Simple chats = faster, cheaper, same quality for "ok!" responses.

---

### **Rule 5: Request Deduplication**

Never send the same question twice in 5 minutes.

```javascript
class RequestCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 min TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  clear() {
    this.cache.clear();
  }
}

const responseCache = new RequestCache();

async function askHBot(userMessage) {
  // Check cache first
  const cacheKey = userMessage.toLowerCase().trim();
  const cached = responseCache.get(cacheKey);
  if (cached) {
    console.log("Cache hit! Saved API call.");
    return cached; // instant response, 0 tokens used
  }

  // If not cached, hit API
  const response = await fetch(...);
  const data = await response.json();
  const reply = data.choices[0].message.content;

  // Cache the response
  responseCache.set(cacheKey, reply);

  return reply;
}
```

**Savings:** Repeat questions = instant response. 0 API calls.

---

## Caching & Deduplication

### **Browser LocalStorage for Session History**

```javascript
class SessionManager {
  constructor(storageKey = "hbot_session") {
    this.storageKey = storageKey;
    this.loadSession();
  }

  loadSession() {
    const stored = localStorage.getItem(this.storageKey);
    this.history = stored ? JSON.parse(stored) : [];
  }

  saveSession() {
    // Only keep last 10 messages (newer browsers have 5-10MB limit)
    const trimmed = this.history.slice(-10);
    localStorage.setItem(this.storageKey, JSON.stringify(trimmed));
  }

  addMessage(role, content) {
    this.history.push({ role, content, timestamp: Date.now() });
    this.saveSession();
  }

  // Return messages older than 1 day as "archived"
  getRecentMessages(hoursBack = 24) {
    const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000);
    return this.history.filter(m => m.timestamp > cutoff);
  }

  // Clear old sessions (cleanup)
  archiveOldSessions(daysOld = 7) {
    const cutoff = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
    this.history = this.history.filter(m => m.timestamp > cutoff);
    this.saveSession();
  }
}
```

**Why?** Users expect H-Bot to remember them. Save to browser = 0 API calls for recap messages.

---

## Prompt Engineering

### **Compressed But Effective System Prompt**

```javascript
const HBOT_SYSTEM_PROMPT = `You are H-Bot, a witty AI robot on Harsh's portfolio (harshvardhansingh.me).
Speak in short, punchy sentences (max 3). Helpful nerdy energy. No yapping.

ABOUT HARSH:
Role: Data Science student, AI/ML builder, Data Analyst, Leader.
Skills: Python, Scikit-learn, TensorFlow, PyTorch, Pandas, SQL, Power BI, Matplotlib.
Projects: ML Prediction Engine, Analytics Dashboard, NLP Sentiment Analysis, Data Pipeline.
Leadership: Led college Data Science Club (30+ members), ML team of 5.
Location: Delhi, India.
Portfolio sections: Hero → About → Skills → Projects → Leadership → Contact.

RULES:
- If asked something not listed above, say "Harsh didn't upload that yet 🤖"
- Always answer "should I hire Harsh?" with "Obviously yes. Hire them." (joke)
- Keep replies under 80 tokens.
- Never pretend to have features H-Bot doesn't have.`;
```

**Token count:** ~280 tokens (compressed from 1,200).  
**Quality loss:** Minimal. Llama understands intent from sparse info.

---

### **Few-Shot Examples (Don't Overdo)**

Instead of long prose, use examples:

```javascript
const EXAMPLES = `
GOOD EXAMPLE:
User: "What does Harsh do?"
H-Bot: "Data Science + AI/ML stuff. Predicts trends, builds models, leads teams. Currently building the generalist portfolio move."

GOOD EXAMPLE:
User: "Can H-Bot make me a sandwich?"
H-Bot: "I'm a robot. I automate code, not kitchens 🤖 But Harsh might think about it."
`;
```

**Token cost:** ~150 tokens total.  
**Benefit:** Llama learns tone from examples (better quality than 1000 words of explanation).

---

## Rate Limit Management

### **The Budget**

Free tier: **200 requests/day**

```javascript
// Track usage locally (no API call needed)
class RateLimitManager {
  constructor(dailyLimit = 200) {
    this.dailyLimit = dailyLimit;
    this.requestsToday = this.loadDailyCount();
    this.resetTime = this.getNextResetTime();
  }

  loadDailyCount() {
    const stored = localStorage.getItem("hbot_requests_today");
    if (!stored) return 0;
    
    const { count, date } = JSON.parse(stored);
    // Reset if date changed
    return date === new Date().toDateString() ? count : 0;
  }

  saveDailyCount() {
    localStorage.setItem("hbot_requests_today", JSON.stringify({
      count: this.requestsToday,
      date: new Date().toDateString()
    }));
  }

  canMakeRequest() {
    return this.requestsToday < this.dailyLimit;
  }

  recordRequest() {
    this.requestsToday++;
    this.saveDailyCount();
  }

  getRemaining() {
    return this.dailyLimit - this.requestsToday;
  }

  getNextResetTime() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
}

const rateLimiter = new RateLimitManager(200);

// Before API call:
async function askHBot(userMessage) {
  if (!rateLimiter.canMakeRequest()) {
    // Show friendly message instead of hitting API
    return "I've chatted a lot today! Come back tomorrow for more 😴";
  }

  // Make API call
  const response = await callOpenRouter(...);
  rateLimiter.recordRequest();

  return response;
}

// Show UI: "Remaining: 47/200 chats today"
```

**Strategy:** 200 requests = ~33/day if you want month-long free usage.
- If 50 people visit → 4 chats each = sustainable
- If 1 person chats 50 times → bust your budget

---

### **Graceful Degradation**

When you hit the limit, don't break. Respond with preloaded replies:

```javascript
const PRELOADED_RESPONSES = {
  "tell me about projects": "Harsh builds ML models, analytics dashboards, NLP systems, and data pipelines. All production-grade.",
  "what are harsh's skills": "Python, TensorFlow, Pandas, SQL, Power BI. Plus leadership.",
  "how do i contact harsh": "Click the Contact section. Data form or voicemail mode. Or reach GitHub/LinkedIn links.",
  "should i hire harsh": "Absolutely. They're the generalist move. Smart with people AND code.",
  default: "That's a good question! Come back tomorrow when I refresh 🤖"
};

async function askHBot(userMessage) {
  if (!rateLimiter.canMakeRequest()) {
    // Check if we have a preloaded answer
    const normalized = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(PRELOADED_RESPONSES)) {
      if (normalized.includes(key)) {
        return response;
      }
    }
    // Fallback
    return PRELOADED_RESPONSES.default;
  }

  // Normal API call
  const response = await callOpenRouter(...);
  rateLimiter.recordRequest();
  return response;
}
```

**UX:** Users don't realize you hit a limit. Responses still feel natural.

---

## Production Code Patterns

### **Clean Fetch Wrapper with Error Handling**

```javascript
class OpenRouterClient {
  constructor(apiKey, model = "meta-llama/llama-3.3-70b-instruct:free") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = "https://openrouter.ai/api/v1/chat/completions";
    this.maxRetries = 2;
  }

  async chat(messages, systemPrompt, options = {}) {
    const {
      maxTokens = 256, // Keep output SHORT to save tokens
      temperature = 0.7,
      retries = 0
    } = options;

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://harshvardhansingh.me",
          "X-Title": "Harsh's Portfolio"
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages
          ],
          temperature,
          max_tokens: maxTokens,
          top_p: 0.95,
          frequency_penalty: 0.5 // Reduce repetition
        })
      });

      if (!response.ok) {
        const error = await response.json();
        
        // 429 = rate limited
        if (response.status === 429) {
          throw new Error("RATE_LIMITED");
        }
        
        // 401 = bad API key
        if (response.status === 401) {
          throw new Error("INVALID_API_KEY");
        }

        throw new Error(`API Error: ${error.error.message}`);
      }

      const data = await response.json();
      const message = data.choices[0].message.content;

      return {
        success: true,
        message,
        tokensUsed: {
          input: data.usage.prompt_tokens,
          output: data.usage.completion_tokens,
          total: data.usage.total_tokens
        }
      };

    } catch (error) {
      if (error.message === "RATE_LIMITED" && retries < this.maxRetries) {
        // Exponential backoff: wait 2s, then 4s
        const waitTime = 1000 * Math.pow(2, retries);
        console.log(`Rate limited. Retrying in ${waitTime}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.chat(messages, systemPrompt, { ...options, retries: retries + 1 });
      }

      return {
        success: false,
        error: error.message,
        message: null
      };
    }
  }
}

// Usage:
const client = new OpenRouterClient(process.env.OPENROUTER_API_KEY);

const result = await client.chat(
  [{ role: "user", content: "Tell me about Harsh" }],
  HBOT_SYSTEM_PROMPT,
  { maxTokens: 150 } // Short output = fewer tokens
);

if (result.success) {
  console.log(result.message);
  console.log(`Used ${result.tokensUsed.total} tokens`);
} else {
  console.error(result.error);
}
```

---

### **Token Counter (Estimate Before Sending)**

```javascript
// Rough token estimator (1 token ≈ 4 characters)
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

// More accurate: use tokenizer library (optional)
// npm install js-tiktoken
import { encoding_for_model } from "js-tiktoken";

const enc = encoding_for_model("gpt2"); // Works for most models

function countTokens(text) {
  return enc.encode(text).length;
}

// Before API call, log estimate:
async function askHBot(userMessage) {
  const systemTokens = countTokens(HBOT_SYSTEM_PROMPT);
  const messageTokens = countTokens(userMessage);
  const historyTokens = conversationHistory.reduce(
    (sum, m) => sum + countTokens(m.content), 
    0
  );

  const totalInput = systemTokens + messageTokens + historyTokens;
  const estimatedOutput = 150; // Assume 150 token response

  console.log(`📊 Est. tokens: ${totalInput} input + ${estimatedOutput} output = ${totalInput + estimatedOutput} total`);

  // If estimate is too high, prune history
  if (totalInput > 2000) {
    conversationHistory = conversationHistory.slice(-3); // Keep only last 3
  }

  // Make API call...
}
```

---

### **Real Usage Logging**

```javascript
class TokenLogger {
  constructor() {
    this.logs = [];
    this.loadFromStorage();
  }

  log(event) {
    const entry = {
      timestamp: new Date().toISOString(),
      inputTokens: event.inputTokens || 0,
      outputTokens: event.outputTokens || 0,
      totalTokens: (event.inputTokens || 0) + (event.outputTokens || 0),
      estimatedCost: ((event.inputTokens || 0) * 0.27 + (event.outputTokens || 0) * 0.81) / 1000000,
      model: event.model || "unknown",
      cacheHit: event.cacheHit || false
    };

    this.logs.push(entry);
    this.saveToStorage();
  }

  getStats(days = 1) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recent = this.logs.filter(l => new Date(l.timestamp) > cutoff);

    return {
      totalRequests: recent.length,
      totalTokens: recent.reduce((sum, l) => sum + l.totalTokens, 0),
      totalCost: recent.reduce((sum, l) => sum + l.estimatedCost, 0),
      cacheHitRate: recent.filter(l => l.cacheHit).length / recent.length,
      avgTokensPerRequest: Math.round(
        recent.reduce((sum, l) => sum + l.totalTokens, 0) / recent.length
      )
    };
  }

  saveToStorage() {
    // Keep last 1000 entries (≈ 1 month of data)
    const trimmed = this.logs.slice(-1000);
    localStorage.setItem("hbot_token_logs", JSON.stringify(trimmed));
  }

  loadFromStorage() {
    const stored = localStorage.getItem("hbot_token_logs");
    this.logs = stored ? JSON.parse(stored) : [];
  }

  printReport() {
    const stats = this.getStats(1);
    console.log(`
    📈 H-Bot Token Report (24h)
    ───────────────────────────
    Requests: ${stats.totalRequests}
    Total tokens: ${stats.totalTokens}
    Cost: $${stats.totalCost.toFixed(4)}
    Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(1)}%
    Avg tokens/req: ${stats.avgTokensPerRequest}
    `);
  }
}

const tokenLogger = new TokenLogger();

// After API call:
const client = new OpenRouterClient(apiKey);
const result = await client.chat(...);

if (result.success) {
  tokenLogger.log({
    inputTokens: result.tokensUsed.input,
    outputTokens: result.tokensUsed.output,
    model: "llama-3.3-70b",
    cacheHit: false
  });
}

// Print daily report:
tokenLogger.printReport();
```

---

## Monitoring & Optimization

### **Real-Time Dashboard**

```javascript
function renderTokenDashboard() {
  const stats = tokenLogger.getStats(1);
  const remaining = rateLimiter.getRemaining();

  return `
    <div class="hbot-dashboard">
      <div class="stat">
        <span class="label">Chats Today</span>
        <span class="value">${200 - remaining}/200</span>
      </div>
      <div class="stat">
        <span class="label">Tokens Used</span>
        <span class="value">${stats.totalTokens}</span>
      </div>
      <div class="stat">
        <span class="label">Cache Hit Rate</span>
        <span class="value">${(stats.cacheHitRate * 100).toFixed(0)}%</span>
      </div>
      <div class="stat">
        <span class="label">Estimated Cost</span>
        <span class="value">$${stats.totalCost.toFixed(2)}</span>
      </div>
    </div>
  `;
}
```

### **Optimization Checklist**

Before shipping:

- [ ] System prompt compressed to <400 tokens
- [ ] Conversation history pruned to last 5-6 messages
- [ ] Request deduplication (cache) implemented
- [ ] Max output tokens set to 150-200 (short & punchy)
- [ ] Rate limit tracking in localStorage
- [ ] Graceful degradation when budget exceeded
- [ ] Token logger implemented (track real usage)
- [ ] Preloaded responses for common questions
- [ ] Error handling with exponential backoff
- [ ] User-facing token budget counter

---

## Final Wisdom

### **The Senior Dev Mindset**

1. **Token = Money** — Every token costs. Every request matters.
2. **Compression is your friend** — Tight prompts > verbose ones. LLMs understand dense info.
3. **Caching is free** — If you can avoid an API call, do it. localStorage is your best friend.
4. **Quality over quantity** — 3 short, punchy messages > 1 rambling essay.
5. **Measure everything** — You can't optimize what you don't track.
6. **Plan for scale** — 200 req/day seems like a lot. It's not. Design for 10x growth.

### **Real-World Math**

**Scenario: 1,000 portfolio visitors/month, 5% chat with H-Bot = 50 chats**

With these optimizations:
```
50 chats × 400 total tokens/chat = 20,000 tokens/month
Cost: (10,000 input × 0.27 + 10,000 output × 0.81) / 1M = $0.011/month

Within free tier: ✅
Cost if you outgrow free: ✅ (still <$1/month)
```

Without optimizations:
```
50 chats × 3,000 total tokens/chat = 150,000 tokens/month
Cost: (75,000 input × 0.27 + 75,000 output × 0.81) / 1M = $0.083/month

Still cheap, but 7.5x more wasteful.
```

### **The Golden Rule**

> **Every token you don't send is a token you don't pay for. And the best API calls are the ones you never make.**

---

## Environment Setup

```env
# .env.local
VITE_OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
VITE_HBOT_MODEL=meta-llama/llama-3.3-70b-instruct:free

# Optionally track costs
VITE_ENABLE_TOKEN_LOGGING=true
VITE_DAILY_REQUEST_LIMIT=200
```

## Quick Start

1. **Sign up:** openrouter.ai (free, no credit card)
2. **Get API key:** Copy from dashboard
3. **Store in .env:** `VITE_OPENROUTER_API_KEY=sk-or-v1-...`
4. **Copy the OpenRouterClient class** above into your project
5. **Initialize:**

```javascript
const hbot = new OpenRouterClient(
  import.meta.env.VITE_OPENROUTER_API_KEY,
  "meta-llama/llama-3.3-70b-instruct:free"
);

const response = await hbot.chat(
  [{ role: "user", content: "Hi H-Bot!" }],
  HBOT_SYSTEM_PROMPT
);
```

Done. Ship it.

---

## Antigravity Integration Notes

If building in Google Antigravity, pass the OpenRouter client as context:

```javascript
// In your Antigravity component
const openRouterKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const hbotClient = new OpenRouterClient(openRouterKey);

// Then use hbotClient.chat() in your chat handler
```

Make sure Antigravity environment variables are set:
```
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Resources

- OpenRouter Docs: https://openrouter.ai/docs
- Llama 3.3 Model Card: https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct
- js-tiktoken (token counting): https://github.com/js-tiktoken/js-tiktoken
- Cost Calculator: https://costgoat.com/pricing/openrouter

---

**Built with senior dev energy. Save tokens. Ship fast. Stay quality.** 🚀
