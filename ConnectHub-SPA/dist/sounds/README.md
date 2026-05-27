# /public/sounds — Audio Assets

This directory holds short audio cues used by the Live section.

| File | Used in | Trigger |
|------|---------|---------|
| `gift.mp3` | LiveWatchPage.jsx | Played when a viewer sends a gift of 100+ coins (MISS-NEW-03 fix) |

## How to add the gift sound

1. Source a short celebratory chime / pop / fanfare sound (≤1s, ≤30KB).
   - Free options: freesound.org, pixabay.com/music, zapsplat.com
   - Recommended format: MP3 48kHz stereo, normalized to -12 LUFS
2. Name it exactly `gift.mp3` and drop it in this folder.
3. Vite will serve it at `/sounds/gift.mp3` automatically — no import needed.

The code in LiveWatchPage.jsx already plays it:
```js
try { new Audio('/sounds/gift.mp3').play(); } catch {}
```
The `try/catch` silently swallows the error if the file is missing,
so the app will not crash in the meantime.
