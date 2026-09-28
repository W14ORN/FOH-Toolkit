# FOH Toolkit — Prototype 1

A free, mobile-first PWA for live sound engineers.

## Included in this prototype
- Verified desk-independent channel preset library
- Console translation notes for Allen & Heath, X32/M32, WING, Yamaha and Soundcraft
- EQ curve visualisation
- Live microphone RTA using the Web Audio API
- Ring-out assistant that detects persistent narrow peaks and suggests a starting frequency / cut / Q
- External audio-input selection where the browser exposes connected microphones/interfaces
- Saved shows and channel lists (stored locally on the device)
- Community preset submission + moderation workflow demo
- Offline caching and installable PWA manifest
- No paid API, library or subscription dependency

## Important prototype limitations
- Community submissions are local to the current browser/device. A shared backend comes later.
- RTA dB values are relative unless calibrated against an SPL meter.
- The ring-out assistant is advisory only and does not control a console.
- Browser microphone access requires HTTPS (or localhost for development).

## Run locally
From this folder:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` on the same computer.

## Free phone deployment with GitHub Pages
1. Create a public GitHub repository named `foh-toolkit`.
2. Put the contents of this folder in the repository root and push to `main`.
3. In GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions**.
5. The included `.github/workflows/pages.yml` deploys the site over HTTPS.
6. Open the Pages URL on your phone and allow microphone access.
7. iPhone: Safari → Share → **Add to Home Screen**. Android/Chrome: use **Install app** when offered.

## Suggested next build
- Supabase free-tier auth + shared community database
- Proper moderator roles and audit history
- Favourites and engineer profiles
- More official presets and genres
- Calibration workflow for measurement microphones
- Saved venue/monitor ring-out profiles
- Console-specific export where file formats permit it
