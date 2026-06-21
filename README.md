# The World We Live In

Android-first (iOS later) mobile game — a low-poly / voxel-style planetary civilization
survival simulator. Crash-land, survive, recruit NPC survivors, grow a settlement, and
advance a civilization whose social systems emerge over time. Offline-first, with
friend-based multiplayer planned and Google AdMob monetization built in.

**Status:** all 16 build phases complete (see [ROADMAP.md](ROADMAP.md)). Playable web prototype
(`npm run dev`); Android packaging is documented and configured (see [ANDROID.md](ANDROID.md)).

## Stack
TypeScript (strict) · React 18 · Three.js (react-three-fiber) · Zustand · Vite ·
Vitest/ESLint/Prettier · Capacitor (Android first) · AdMob via `@capacitor-community/admob`.
A pure, deterministic **simulation core** (`src/sim`) is isolated from UI, rendering, and
platform code.

## Commands
```bash
npm install      # install dependencies
npm run dev      # run the web build with HMR
npm run build    # type-check (tsc) + production build
npm run test     # run sim-core unit tests (Vitest)
npm run lint     # ESLint
npm run format   # Prettier
```

Android build/release (Capacitor): see [ANDROID.md](ANDROID.md). Quick path on a machine with
JDK 17 + Android Studio: `npm run build && npx cap add android && npx cap open android`.

## Project docs (read these first)
- [PROJECT_STATE.md](PROJECT_STATE.md) — live status; start here.
- [ROADMAP.md](ROADMAP.md) — phased build plan.
- [ARCHITECTURE.md](ARCHITECTURE.md) — layers, data flow, conventions.
- [TECH_DECISIONS.md](TECH_DECISIONS.md) — decisions + rationale + risks.
- [CHECKPOINTS.md](CHECKPOINTS.md) — checkpoint history.
- [ANDROID.md](ANDROID.md) — Android build, AdMob wiring, signing, Play listing.
- [RESUME_PROMPT.md](RESUME_PROMPT.md) — paste into a fresh session to continue.
