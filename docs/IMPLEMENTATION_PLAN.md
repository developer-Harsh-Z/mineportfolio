# Implementation Plan: H-Bot & Contact Section Enhancements

## 1. Completed Tasks
### H-Bot Overhaul
- [x] **Logic Fix**: Implemented `requestAnimationFrame` ticker to fix the bot's static position.
- [x] **Groq Integration**: Switched backend to Groq API using `llama-3.1-8b-instant`.
- [x] **Rate Limiting**: Added 2-second cooldown and reduced message history to 3 to respect 6K TPM limit.
- [x] **Aesthetics**: Fixed unreadable text in Light Mode by using theme-aware CSS variables (`--text-primary`, `--text-dim`).
- [x] **Responsive**: Added window resize listener to maintain relative positioning.

## 2. Upcoming Tasks
### Voice Attachment Feature (Contact Section)
- [x] **Goal**: Send actual voice recordings directly as email attachments instead of just transcripts.
- [x] **Method**: Convert Audio Blob to Base64 string and send via EmailJS.

#### Technical Steps:
- [x] 1. **Utility Function**: Create `blobToBase64(blob)` helper in `Contact.jsx`.
- [x] 2. **State Update**: Store the base64 string in `ModeB` component state after recording stops.
- [x] 3. **API Payload**: Add `voice_attachment` field to `emailjs.send` parameters.
- [ ] 4. **EmailJS Configuration**: (User Action Required) Add `{{voice_attachment}}` as a dynamic attachment in the EmailJS dashboard.

## 3. Maintenance & Polish
- [ ] Monitor Groq API usage for 429 errors.
- [ ] Verify Base64 string size for voice notes (limit: < 400KB).
- [ ] Update documentation and changelogs.
