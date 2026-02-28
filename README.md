# Tuner

Mobile-first guitar tuner built with React, TypeScript, and Vite.

I made this project public to showcase my frontend engineering skills and my ability to design and build a real app experience end to end: audio capture, pitch detection, PWA behavior, mobile UI, install flow, and product-focused iteration.

## Overview

This app is a single-screen guitar tuner focused on practical use on mobile devices. It runs fully client-side in the browser, uses the microphone through the Web Audio API, and helps tune a standard 6-string guitar in real time.

Main goals for this project:

- Build a functional tuner MVP without a backend
- Create a mobile-first interface that feels like an installable app
- Keep the architecture clean and modular
- Improve real-world behavior through iterative tuning of capture, smoothing, retention, and UI feedback

## Features

- Real-time pitch detection using microphone input
- Standard tuning support: `E2 A2 D3 G3 B3 E4`
- Auto string detection
- Manual string targeting
- Frequency, note, cents offset, and tuning gauge
- Capture profiles for different microphone conditions
- i18n support: Portuguese, English, Spanish
- Install flow for PWA
- Fully client-side, no backend

## Tech Stack

- React
- TypeScript
- Vite
- Web Audio API
- PWA manifest + service worker

## Architecture

The project is organized by responsibility to keep audio, pitch logic, music domain rules, storage, and UI separated.

### Core areas

- `src/lib/audio`
  Handles microphone session setup, fallback constraints, frame preparation, and capture profiles
- `src/lib/pitch`
  Contains the autocorrelation-based pitch detection logic
- `src/lib/music`
  Converts frequency into note, cents, and nearest guitar string
- `src/lib/storage`
  Persists user preferences and PWA install dismissal state
- `src/features/tuner/hooks`
  Coordinates tuner state and UI-facing behavior
- `src/features/tuner/components`
  Focused UI components for the tuner screen

## Why this project matters

This is not just a static UI exercise.

I used it to demonstrate:

- Product thinking for mobile UX
- Frontend architecture decisions in a real interactive app
- Browser audio API integration
- State orchestration for real-time feedback
- PWA install flow design for Android and iPhone
- Iterative tuning of heuristics based on actual usage

## Running locally

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

## Deployment

The project is configured for Vercel with:

- `framework: vite`
- `buildCommand: npm run build`
- `outputDirectory: dist`

## Notes

- Best results come from HTTPS and explicit microphone permission
- PWA install behavior depends on browser support
- Pitch detection is based on a lightweight autocorrelation approach, tuned for practical real-world use rather than DSP complexity

## Author

Gabriel Ricarte

This repository is public as part of my portfolio and to highlight my frontend and app-building skills.
