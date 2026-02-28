# Tuner

Mobile-first guitar tuner built with React, TypeScript, and Vite.

This repository is public because I wanted to showcase how I build frontend products end to end: product thinking, UI architecture, browser APIs, PWA behavior, mobile-first design, and iterative refinement based on real usage.

## What this project demonstrates

- Building a real client-side app, not just a static interface
- Working with the Web Audio API for microphone capture
- Implementing pitch detection and tuning feedback in the browser
- Designing a focused mobile-first interface around a single core task
- Structuring a React codebase with clear module boundaries
- Shipping an installable PWA experience

## Product overview

`Tuner` is a one-screen guitar tuner focused on practical mobile usage.

It runs fully in the browser, with no backend, and helps tune a standard 6-string guitar in real time.

Core capabilities:

- Real-time microphone capture
- Pitch detection with autocorrelation
- Auto string targeting
- Manual string targeting
- Frequency, note, cents, and gauge feedback
- Capture profiles for different device and microphone conditions
- PWA install flow
- i18n support in Portuguese, English, and Spanish

## Tech stack

- React
- TypeScript
- Vite
- Web Audio API
- Service Worker
- Web App Manifest

## Why I made this public

I use this repository as a portfolio project to demonstrate:

- frontend engineering quality
- app architecture decisions
- UX iteration for a real use case
- browser platform integration
- shipping discipline from prototype to deployable app

## Architecture

The project is intentionally split by responsibility so the app remains easy to maintain as it evolves.

### Audio

- `src/lib/audio/audioContext.ts`
- `src/lib/audio/microphone.ts`
- `src/lib/audio/frameAnalysis.ts`
- `src/lib/audio/captureProfiles.ts`

Responsible for microphone access, fallback constraints, frame preparation, and capture profile definitions.

### Pitch

- `src/lib/pitch/autocorrelate.ts`

Contains the pitch detection logic and related confidence heuristics.

### Music domain

- `src/lib/music/notes.ts`
- `src/shared/constants/tuner.ts`

Handles note conversion, cents calculation, and guitar string targeting.

### Storage and preferences

- `src/lib/storage/tunerPreferences.ts`
- `src/lib/storage/locale.ts`
- `src/lib/storage/pwaInstall.ts`

Persists tuner preferences, locale, and install-flow dismissal state.

### Tuner feature

- `src/features/tuner/hooks/useTuner.ts`
- `src/features/tuner/hooks/usePwaInstall.ts`
- `src/features/tuner/components/*`
- `src/features/tuner/pages/TunerPage.tsx`

Coordinates the tuner state, install flow, and the single-screen UI.

## UX goals

This app was designed around a few specific product goals:

- one-screen experience
- fast reading on mobile
- minimal visual noise
- useful tuning feedback rather than overcomplicated DSP UI
- installable app feel

## Local development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment

This project is configured for Vercel.

Current deployment config:

- framework: `vite`
- build command: `npm run build`
- output directory: `dist`

## PWA notes

- The app includes a manifest and service worker
- Install behavior depends on browser support
- Android/Chromium can use the native install prompt when available
- iPhone uses a guided Add to Home Screen flow

## Microphone notes

- Best results require HTTPS in production
- Microphone behavior can vary across browsers and devices
- Pitch detection is intentionally lightweight and practical rather than algorithmically heavy

## Suggested repository description

If you want a short GitHub repository subtitle, I recommend:

`Mobile-first guitar tuner PWA built with React, TypeScript, Vite, and the Web Audio API.`

## Author

Gabriel Ricarte

Public portfolio project focused on frontend engineering and app-building skills.
