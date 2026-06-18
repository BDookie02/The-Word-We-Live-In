# RESUME_PROMPT.md — The World We Live In

> Paste the block below into a **fresh Claude Code session** (run from the project root,
> `C:\Users\jojos\Desktop\projects\The World We Live In`) to continue without losing direction.
> Keep this file updated at every SAVE AND REFRESH CHECKPOINT.

---

```
You are continuing development of "The World We Live In", an Android-first mobile game
(low-poly/voxel planetary civilization survival simulator) for the Google Play Store.

STACK (locked): TypeScript (strict) · React 18 · Three.js via react-three-fiber · Zustand ·
Vite · Vitest/ESLint/Prettier · Capacitor (Android first, iOS later) · Google AdMob via
@capacitor-community/admob behind an AdService abstraction. Offline-first. Friend-based
multiplayer is interfaces-only/deferred.

NON-NEGOTIABLE ARCHITECTURE:
- src/sim/ is a PURE deterministic TypeScript simulation core: no React, no DOM, no Three.js,
  no platform APIs. World changes only via ordered "intents". Same seed + same intents =>
  same world. It must keep running headless under Vitest.
- One-way data flow: Input -> Intent -> Sim mutates state -> snapshot -> Zustand store ->
  React UI + react-three-fiber render read it. UI/render NEVER mutate world state directly.
- Ads/saves/net/render are adapters behind interfaces; MockAdService is used on web/dev.
- Social/cultural/governance systems are fictional/emergent and data-driven. NEVER hard-code
  real-world religions or political parties.

BEFORE WRITING CODE:
1. Read PROJECT_STATE.md (live status, "Next exact task", what's stubbed/failed).
2. Read CHECKPOINTS.md (newest entry = where we stopped).
3. Read ROADMAP.md (phase order + statuses) and skim ARCHITECTURE.md + TECH_DECISIONS.md.
4. Run `npm install` if node_modules is missing, then `npm run build && npm run test && npm run lint`
   to confirm a green baseline before changing anything.

WORKING RULES (checkpoint protocol):
- Build in small, verifiable passes. After each phase, run build/test/lint and update
  PROJECT_STATE.md + CHECKPOINTS.md (what was built / files changed / works / stubbed / failed /
  next exact task / architecture assumptions).
- Before any long task that may exceed stable context, do a SAVE AND REFRESH CHECKPOINT:
  update PROJECT_STATE.md, CHECKPOINTS.md, and this RESUME_PROMPT.md, summarize status, and tell
  the user to start a fresh session from RESUME_PROMPT.md.
- If you notice drift, repeated errors, or loss of architectural clarity: stop, save state, refresh.
- Never label a stub as a finished system. Commit to git at checkpoints (branch off main; do not
  push unless a remote is configured — ask the user for GitHub access if needed).

CURRENT POSITION (update this each checkpoint):
- Last checkpoint: C1 — Phase 1 complete & verified (build/test/lint green; commit b5e4f0c).
- Next exact task: Phase 2 (mobile input, camera, portrait/landscape) — add react-three-fiber
  + drei, replace the placeholder SVG WorldView with a low-poly r3f scene + camera rig, and
  add a touch/gesture input layer (tap / drag-pan / pinch-zoom) that emits intents. Do NOT
  modify the sim core's public contract; UI/render only read snapshots and dispatch intents.

GIT REMOTE STATUS: origin configured + main pushed ->
https://github.com/BDookie02/The-Word-We-Live-In.git (Git Credential Manager handles auth).
Run `git push` after committing each checkpoint.
```

---

## Maintenance note
When you update this file, also bump "CURRENT POSITION" and the "Last checkpoint" line so a
fresh session lands exactly where work stopped.
