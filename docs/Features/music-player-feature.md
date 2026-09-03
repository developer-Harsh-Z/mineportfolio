# Feature Spec — Music Player
## "The Frequency" — YouTube × Geo-Detection × Cassette UI
**Feature ID:** MUSIC-001
**Folder:** /features/music-player-feature.md
**Status:** Ready to build

---

## Concept

A fixed floating cassette-shaped music player that lives in the bottom-right corner of every page. On site load it stays silent — user must click the cassette icon to start. Once clicked it expands into a capsule showing track info, waveform bars, and a shuffle button.

Music is fully dynamic — on page load the player detects the visitor's country via IP geolocation, then searches YouTube for music that matches their region. Indian visitors get Hindi lo-fi / Bollywood chill. Everyone else gets international lo-fi / ambient / cinematic. Every shuffle pulls a fresh random track from YouTube's live results.

---

## Design System (match portfolio exactly)

```css
--bg: #0d0b09
--surface: #171310
--accent: #ff3d00
--text: #f0e8d8
--muted: #7a6a5a
--border: rgba(240,232,216,0.1)

Fonts:
- 'Harsh' (custom ttf) → player track name
- JetBrains Mono → all labels, time, artist
```

---

## APIs Used

| API | Purpose | Cost | Key Needed |
|---|---|---|---|
| `ipapi.co/json/` | Detect visitor country | Free, no key | No |
| YouTube Data API v3 | Search tracks by genre + country | Free 10k req/day | Yes — Google Cloud |
| YouTube IFrame Player API | Play videos in hidden iframe | Free unlimited | No |

---

## Setup Requirements

### YouTube Data API Key
1. Go to console.cloud.google.com
2. Create new project → "Portfolio Music"
3. Enable "YouTube Data API v3"
4. Credentials → Create API Key
5. Restrict key to your domain (security)
6. Store as environment variable: `VITE_YT_API_KEY` or `NEXT_PUBLIC_YT_API_KEY`

### No other setup needed
- ipapi.co works with zero auth
- YouTube IFrame API loads via script tag

---

## Search Query Logic (Geo-Based)

```javascript
const SEARCH_QUERIES = {
  // India
  IN: [
    "hindi lofi beats study",
    "bollywood chill lo-fi",
    "indian lofi hip hop",
    "hindi aesthetic music",
    "lo-fi hindi songs chill",
  ],

  // USA / UK / Australia / Canada
  US: ["lofi hip hop chill beats", "ambient study music"],
  GB: ["lofi hip hop chill beats", "uk ambient electronic"],
  AU: ["lofi chill study beats", "ambient instrumental"],
  CA: ["lofi hip hop relax", "canadian indie ambient"],

  // Default (all other countries)
  DEFAULT: [
    "lofi hip hop beats study",
    "cinematic ambient music",
    "chill instrumental beats",
    "aesthetic lo-fi music",
  ],
};

function getQueryForCountry(countryCode) {
  const queries = SEARCH_QUERIES[countryCode] || SEARCH_QUERIES.DEFAULT;
  return queries[Math.floor(Math.random() * queries.length)];
}
```

---

## Full Component Architecture

```
/components
  /MusicPlayer
    MusicPlayer.jsx          ← parent, manages all state
    CassetteIcon.jsx         ← collapsed state icon (always visible)
    PlayerCapsule.jsx        ← expanded state with controls
    WaveformBars.jsx         ← animated bars when playing
    HiddenYTPlayer.jsx       ← invisible YouTube iframe
    useGeoDetect.js          ← custom hook: IP → country code
    useYouTubeSearch.js      ← custom hook: country → video IDs
    useYouTubePlayer.js      ← custom hook: controls hidden iframe
    music-player.module.css  ← all scoped styles
```

---

## State Machine

```
IDLE (collapsed, no music loaded)
  ↓ user clicks cassette icon
LOADING (fetching geo + YouTube search)
  ↓ results ready
READY (expanded, paused)
  ↓ user clicks play
PLAYING (reels spinning, waveform animating)
  ↓ user clicks pause
PAUSED (reels stopped, bars frozen)
  ↓ user clicks shuffle ↺
SHUFFLING (brief spin animation, next track loads)
  ↓ auto plays next
PLAYING
```

---

## Detailed Component Specs

---

### MusicPlayer.jsx — Parent Component

State variables:
```javascript
const [isExpanded, setIsExpanded] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [country, setCountry] = useState(null);
const [videoIds, setVideoIds] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [currentTrack, setCurrentTrack] = useState(null);
// currentTrack = { title, channelTitle, videoId, thumbnail }
```

On mount: silently fetch geo + YouTube results in background (preload so expansion is instant).
On cassette icon click: setIsExpanded(true) → if not loaded yet show brief spinner inside capsule.

---

### CassetteIcon.jsx — The Toggle Button (Always Visible)

**Position:** fixed, bottom: 28px, right: 28px, z-index: 1000

**Visual (CSS only — no images):**
A pill-shaped button (border-radius: 50px), width 56px, height 36px.
Background: var(--surface).
Border: 1px solid var(--border).

Inside: two mini reel circles (8px each, gap 6px, centered):
```css
.mini-reel {
  width: 9px; height: 9px;
  border-radius: 50%;
  border: 1.5px solid var(--muted);
  display: flex; align-items: center; justify-content: center;
}
.mini-reel-inner {
  width: 3px; height: 3px;
  border-radius: 50%;
  background: var(--muted);
}
```

When playing: reel border and inner dot turn #ff3d00. Both reels spin:
```css
.reel-playing { animation: spin 1.5s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

Hover: border-color becomes #ff3d00, transition 0.3s.

A tiny red dot (6px circle, #ff3d00) in top-right corner of the pill when music is playing — like a notification dot. Shows "live" state even when collapsed.

Tooltip on hover: "▶ play music" or "now playing" when active — JetBrains Mono 10px, appears above button.

---

### PlayerCapsule.jsx — Expanded State

**Animation:** when isExpanded true, capsule grows from 56px width to full width (280px) using max-width transition:
```css
.capsule { 
  max-width: 56px; 
  transition: max-width 0.5s cubic-bezier(0.76, 0, 0.24, 1);
  overflow: hidden;
}
.capsule.expanded { max-width: 300px; }
```

**Capsule layout (flex row, align center, gap 10px):**

1. **CassetteIcon** (stays, becomes part of capsule)

2. **Track Info** (fades in):
   - Track title: Harsh font italic, 13px, #f0e8d8, max-width 120px, overflow hidden, text-overflow ellipsis, white-space nowrap
   - Artist/channel: JetBrains Mono, 10px, #7a6a5a, same overflow rules
   - Country indicator: tiny flag emoji + JetBrains Mono 9px muted (e.g. "🇮🇳 india" or "🌍 global")

3. **WaveformBars** (5 bars, #ff3d00, animate when playing, freeze when paused)

4. **Play/Pause button**:
   - 28px circle, border 1px rgba(240,232,216,0.15), background transparent
   - Play icon: CSS triangle. Pause: two 2px×10px rects. Toggle on click.
   - Hover: border-color #ff3d00

5. **Shuffle button ↺**:
   - 28px circle, same style
   - SVG refresh icon (stroke #7a6a5a, fill none, stroke-width 2)
   - On click: rotate 360deg animation, then load next track
   - Hover: border-color #ff3d00, icon stroke #f0e8d8

6. **Progress bar** (bottom of capsule, full width, 2px height):
   - Track: rgba(240,232,216,0.06)
   - Fill: #ff3d00, updates via YouTube player currentTime / duration
   - border-radius: 0 0 50px 50px

7. **Close button** (×):
   - Far right, 20px, JetBrains Mono, #7a6a5a
   - On click: pause → collapse capsule

---

### WaveformBars.jsx

Five bars, each 3px wide, border-radius 2px, background #ff3d00.
When playing: CSS keyframe animation, each bar has different height range and delay:

```css
.bar-1 { height: 8px;  animation: wave 1.0s ease-in-out infinite; }
.bar-2 { height: 14px; animation: wave 1.0s ease-in-out infinite 0.15s; }
.bar-3 { height: 20px; animation: wave 1.0s ease-in-out infinite 0.30s; }
.bar-4 { height: 12px; animation: wave 1.0s ease-in-out infinite 0.45s; }
.bar-5 { height: 18px; animation: wave 1.0s ease-in-out infinite 0.60s; }

@keyframes wave {
  0%, 100% { transform: scaleY(0.4); }
  50%       { transform: scaleY(1.0); }
}
```

When paused: animation-play-state: paused. All bars shrink to 4px height.
Transition height 0.3s on pause/play toggle.

---

### HiddenYTPlayer.jsx — The Invisible Engine

```jsx
// Hidden iframe — user never sees this
<div style={{ position: 'fixed', top: '-9999px', left: '-9999px', 
              width: '1px', height: '1px', overflow: 'hidden' }}>
  <div id="yt-player-hidden" />
</div>
```

YouTube IFrame API initialization:
```javascript
// Load API script once
useEffect(() => {
  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  window.onYouTubeIframeAPIReady = () => {
    playerRef.current = new window.YT.Player('yt-player-hidden', {
      height: '1', width: '1',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onStateChange,
        onError: onPlayerError,
      }
    });
  };
}, []);
```

Error handling (video embedding disabled):
```javascript
function onPlayerError(event) {
  // Error codes 5 (HTML5 error) or 101/150 (embedding not allowed)
  // Auto skip to next track
  if ([5, 101, 150].includes(event.data)) {
    nextTrack(); // silently move to next
  }
}
```

---

### useGeoDetect.js — Custom Hook

```javascript
export function useGeoDetect() {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        setCountry(data.country_code); // "IN", "US", "GB" etc
      })
      .catch(() => {
        setCountry('DEFAULT'); // fallback
      })
      .finally(() => setLoading(false));
  }, []);

  return { country, loading };
}
```

---

### useYouTubeSearch.js — Custom Hook

```javascript
const API_KEY = process.env.NEXT_PUBLIC_YT_API_KEY;
const MAX_RESULTS = 15;

export function useYouTubeSearch(country) {
  const [videoIds, setVideoIds] = useState([]);
  const [trackMeta, setTrackMeta] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async (query) => {
    setLoading(true);
    const url = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&videoCategoryId=10` + // category 10 = Music
      `&q=${encodeURIComponent(query)}` +
      `&maxResults=${MAX_RESULTS}` +
      `&videoEmbeddable=true` +  // only embeddable videos
      `&key=${API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const items = data.items || [];

      const ids = items.map(i => i.id.videoId);
      const meta = items.map(i => ({
        videoId: i.id.videoId,
        title: i.snippet.title,
        channelTitle: i.snippet.channelTitle,
        thumbnail: i.snippet.thumbnails.default.url,
      }));

      // Shuffle the results for randomness
      const shuffled = meta.sort(() => Math.random() - 0.5);
      setVideoIds(shuffled.map(m => m.videoId));
      setTrackMeta(shuffled);
    } catch (err) {
      console.error('YouTube search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (country) {
      const query = getQueryForCountry(country);
      search(query);
    }
  }, [country]);

  return { videoIds, trackMeta, loading, refetch: () => search(getQueryForCountry(country)) };
}
```

---

## Track Shuffle Logic

```javascript
function shuffleTrack() {
  // Rotate shuffle button
  setShuffling(true);
  setTimeout(() => setShuffling(false), 500);

  // 70% chance: pick from existing loaded results (instant)
  // 30% chance: fetch fresh search results (new variety)
  if (Math.random() > 0.3 || videoIds.length < 3) {
    const remaining = videoIds.filter((_, i) => i !== currentIndex);
    const next = remaining[Math.floor(Math.random() * remaining.length)];
    const nextIdx = videoIds.indexOf(next);
    setCurrentIndex(nextIdx);
    playerRef.current.loadVideoById(next);
  } else {
    // Fresh search with different query
    const newQuery = getQueryForCountry(country); // picks random query from list
    refetch(newQuery);
    setCurrentIndex(0);
  }
}
```

---

## CSS — Key Styles

```css
/* Fixed position — always visible */
.player-wrapper {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

/* Capsule */
.capsule {
  display: flex;
  align-items: center;
  background: #171310;
  border: 1px solid rgba(240,232,216,0.1);
  border-radius: 50px;
  padding: 10px;
  gap: 0;
  max-width: 56px;
  overflow: hidden;
  transition: max-width 0.5s cubic-bezier(0.76, 0, 0.24, 1),
              padding 0.4s cubic-bezier(0.76, 0, 0.24, 1),
              gap 0.4s cubic-bezier(0.76, 0, 0.24, 1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
}

.capsule.expanded {
  max-width: 300px;
  padding: 10px 14px 10px 10px;
  gap: 10px;
}

/* Track info fade */
.track-info {
  opacity: 0;
  transition: opacity 0.3s 0.2s; /* delay so it fades in after expansion */
  white-space: nowrap;
  overflow: hidden;
}
.capsule.expanded .track-info { opacity: 1; }

/* Loading pulse */
.loading-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #ff3d00;
  animation: loadPulse 1s ease-in-out infinite;
}
@keyframes loadPulse {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50%       { opacity: 1;   transform: scale(1.2); }
}

/* Shuffle spin */
.shuffle-btn.spinning svg {
  animation: rotateSpin 0.5s cubic-bezier(0.23,1,0.32,1);
}
@keyframes rotateSpin { to { transform: rotate(360deg); } }

/* Progress bar */
.progress-wrap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 2px;
  background: rgba(240,232,216,0.06);
  border-radius: 0 0 50px 50px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #ff3d00;
  border-radius: 50px;
  transition: width 0.5s linear;
}

/* Notification dot */
.playing-dot {
  position: absolute;
  top: -3px; right: -3px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #ff3d00;
  border: 2px solid #0d0b09;
  opacity: 0;
  transition: opacity 0.3s;
}
.playing-dot.visible { opacity: 1; }
```

---

## Mobile Behaviour

```
max-width: 768px:
- Capsule expands to max-width: 240px (not 300px)
- Track title max-width: 90px
- Bottom: 20px, right: 16px
- On very small screens (< 380px): capsule max-width 200px
```

---

## Environment Variables

```env
# .env.local (Next.js) or .env (Vite)
NEXT_PUBLIC_YT_API_KEY=your_youtube_data_api_v3_key_here
```

---

## Antigravity Build Prompt

> Copy everything below and paste into Google Antigravity.

---

Build a floating music player React component called "The Frequency" for a portfolio website. It uses YouTube IFrame API for playback and ipapi.co for geo-detection. The player is always fixed in the bottom-right corner. On page load it is collapsed (silent). User clicks to expand and play.

DESIGN SYSTEM:
--bg: #0d0b09 | --surface: #171310 | --accent: #ff3d00
--text: #f0e8d8 | --muted: #7a6a5a | --border: rgba(240,232,216,0.1)
Font display: 'Harsh' (custom ttf). Font labels: 'JetBrains Mono' Google Fonts.
All transitions use cubic-bezier(0.76, 0, 0.24, 1) unless stated otherwise.

ENVIRONMENT VARIABLE:
YouTube API key stored as process.env.NEXT_PUBLIC_YT_API_KEY

---

HIDDEN YOUTUBE PLAYER:
Create a div positioned fixed at top: -9999px, left: -9999px, width: 1px, height: 1px.
Inside: a div with id="yt-player-hidden".
On component mount, dynamically append script tag src="https://www.youtube.com/iframe_api" to document.head (only once — check if already loaded).
Set window.onYouTubeIframeAPIReady to initialize YT.Player on element "yt-player-hidden" with playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, rel: 0 }.
Store player instance in useRef.
onError handler: if event.data is 5, 101, or 150 (embedding disabled), automatically call nextTrack() to silently skip.
onStateChange handler: when state === YT.PlayerState.ENDED, auto call nextTrack().

---

GEO DETECTION (run on mount, silently in background):
fetch('https://ipapi.co/json/') → extract country_code.
Catch any error → set country to 'DEFAULT'.
Store in state: const [country, setCountry] = useState(null).

---

SEARCH QUERY MAP:
```
const QUERIES = {
  IN: ["hindi lofi beats study", "bollywood chill lo-fi", "indian lofi hip hop", "hindi aesthetic music", "lo-fi hindi songs chill"],
  US: ["lofi hip hop chill beats", "ambient study music"],
  GB: ["lofi hip hop chill beats", "uk ambient electronic"],
  DEFAULT: ["lofi hip hop beats study", "cinematic ambient music", "chill instrumental beats", "aesthetic lo-fi music"]
};
```
Function getQuery(code): return random item from QUERIES[code] || QUERIES.DEFAULT.

---

YOUTUBE SEARCH FUNCTION:
async function searchYouTube(query):
  URL: https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoCategoryId=10&videoEmbeddable=true&maxResults=15&q={encoded query}&key={API_KEY}
  Parse response → map items to { videoId: item.id.videoId, title: item.snippet.title, channelTitle: item.snippet.channelTitle }
  Shuffle results randomly (sort(() => Math.random() - 0.5))
  Store in state: videoList (array of track objects), currentIndex (0)
  Call this function once geo resolves. Results preloaded before user clicks.

---

STATE:
```javascript
const [isExpanded, setIsExpanded] = useState(false);
const [isPlaying, setIsPlaying] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [isShuffling, setIsShuffling] = useState(false);
const [country, setCountry] = useState(null);
const [videoList, setVideoList] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [progress, setProgress] = useState(0);
const playerRef = useRef(null);
const progressIntervalRef = useRef(null);
```

---

PLAYER WRAPPER (fixed position):
position: fixed, bottom: 28px, right: 28px, z-index: 1000.
display flex, flex-direction column, align-items flex-end, gap 8px.

---

CASSETTE ICON (collapsed state — always the leftmost element of capsule):
A pill-shaped div: border-radius 50px, background #171310, border 1px rgba(240,232,216,0.1).
Width 36px, height 36px, border-radius 50%, display flex, align-items center, justify-content center.
Inside: two mini reel circles (flex row, gap 5px):
  Each reel: 9px × 9px, border-radius 50%, border 1.5px solid #7a6a5a, display flex, align-items center, justify-content center.
  Inner dot: 3px × 3px, border-radius 50%, background #7a6a5a.
When isPlaying: reel border-color #ff3d00, inner dot background #ff3d00. Both reels get CSS animation spin 1.5s linear infinite (rotate 360deg).
Hover: outer border-color #ff3d00.
A notification dot (6px circle, #ff3d00, border 2px solid #0d0b09): position absolute, top -2px, right -2px. opacity 0 normally, opacity 1 when isPlaying.
onClick: if (!isExpanded) { setIsExpanded(true); if videoList.length > 0 { startPlaying(); } }

---

CAPSULE (the full expanded player):
Wraps cassette icon + all controls.
display flex, align-items center, background #171310, border 1px rgba(240,232,216,0.1), border-radius 50px.
padding: 10px when collapsed, 10px 14px 10px 10px when expanded.
max-width: 56px collapsed → 300px expanded.
gap: 0 collapsed → 10px expanded.
overflow: hidden.
transition: max-width 0.5s cubic-bezier(0.76,0,0.24,1), padding 0.4s, gap 0.4s.
box-shadow: 0 8px 32px rgba(0,0,0,0.4).
position relative (for progress bar child).

INSIDE CAPSULE (only visible when expanded, opacity transition with 0.2s delay):

1. TRACK INFO (flex column, gap 2px, overflow hidden, white-space nowrap):
   - Title: Harsh font italic 13px, #f0e8d8, max-width 120px, text-overflow ellipsis
   - Channel: JetBrains Mono 10px, #7a6a5a, text-overflow ellipsis
   - Country tag: JetBrains Mono 9px, #7a6a5a (e.g. "🇮🇳 india" if IN, "🌍 global" otherwise)
   Show "loading..." in JetBrains Mono 11px #7a6a5a while isLoading.

2. WAVEFORM BARS (5 bars, 3px wide each, border-radius 2px, background #ff3d00, display flex gap 2px align-items center):
   Heights: 8px, 14px, 20px, 12px, 18px.
   When isPlaying: CSS keyframe animation wave (scaleY 0.4 → 1.0 → 0.4, 1s ease-in-out infinite), each bar staggered by 0.15s.
   When paused: animation-play-state paused, all bars height 4px (transition 0.3s).

3. PLAY/PAUSE BUTTON (28px circle, border 1px rgba(240,232,216,0.15), background transparent, cursor pointer):
   When paused: show CSS triangle pointing right (play icon) using border trick or SVG polygon.
   When playing: show two vertical rectangles (pause icon).
   Hover: border-color #ff3d00.
   onClick: togglePlay(). If isPlaying: playerRef.current.pauseVideo(), setIsPlaying(false), clear progress interval. Else: playerRef.current.playVideo(), setIsPlaying(true), start progress interval.

4. SHUFFLE BUTTON ↺ (28px circle, same border style):
   SVG icon: viewBox 0 0 24 24, polyline points="23 4 23 10 17 10", path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10". stroke #7a6a5a, fill none, stroke-width 2, stroke-linecap round. 12px icon.
   When isShuffling: rotate 360deg animation 0.5s.
   Hover: border-color #ff3d00, icon stroke #f0e8d8.
   onClick: shuffleTrack().

5. CLOSE BUTTON (×, 16px, JetBrains Mono, #7a6a5a, no border, cursor pointer):
   onClick: playerRef.current.pauseVideo(), setIsPlaying(false), setIsExpanded(false).
   Hover: color #f0e8d8.

6. PROGRESS BAR (position absolute, bottom 0, left 0, right 0, height 2px):
   Track: rgba(240,232,216,0.06), border-radius 0 0 50px 50px.
   Fill: #ff3d00, width = progress%, transition width 0.5s linear.
   Update: setInterval every 500ms → (playerRef.current.getCurrentTime() / playerRef.current.getDuration()) * 100.

---

FUNCTIONS:

startPlaying():
  const track = videoList[currentIndex];
  playerRef.current.loadVideoById(track.videoId);
  playerRef.current.playVideo();
  setIsPlaying(true);
  start progress interval;

nextTrack():
  const next = (currentIndex + 1) % videoList.length;
  setCurrentIndex(next);
  playerRef.current.loadVideoById(videoList[next].videoId);
  if (isPlaying) playerRef.current.playVideo();

shuffleTrack():
  setIsShuffling(true);
  setTimeout(() => setIsShuffling(false), 500);
  
  // 70% use existing list, 30% fetch fresh
  if (Math.random() > 0.3) {
    const indices = videoList.map((_,i) => i).filter(i => i !== currentIndex);
    const nextIdx = indices[Math.floor(Math.random() * indices.length)];
    setCurrentIndex(nextIdx);
    playerRef.current.loadVideoById(videoList[nextIdx].videoId);
    if (isPlaying) playerRef.current.playVideo();
  } else {
    const newQuery = getQuery(country);
    searchYouTube(newQuery); // refetches and resets list
  }
  setProgress(0);

---

MOBILE (max-width 768px):
capsule max-width expanded: 240px.
track title max-width: 90px.
bottom: 20px, right: 16px.

---

IMPORTANT NOTES:
- The player never auto-plays on page load. User must click cassette icon first.
- Always filter for videoEmbeddable=true in YouTube search to minimise errors.
- On YouTube error codes 5, 101, 150: silently call nextTrack(), never show error to user.
- All colours must exactly match the design system — no purple, blue, green anywhere except the waveform bars' animation end state.
- Export as MusicPlayer.jsx. Import and place it in the root layout so it persists across all page sections/routes.
- Store API key only in environment variable, never hardcoded in source.
- Add a comment at top of file: "// Remove NEXT_PUBLIC_YT_API_KEY from .env before pushing to GitHub"
