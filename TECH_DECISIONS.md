# TECH_DECISIONS.md — The World We Live In

Append-only log of significant technical decisions, with rationale and known risks.

---

## TD-001 — Engine/stack: TypeScript + React + Three.js, packaged with Capacitor
**Decision (2026-06-18):** Build the game as a TypeScript web app — React 18 for UI,
Three.js (via react-three-fiber) for 3D — and package to Android with Capacitor.
**Why:** User directive to use Node.js + React ("worked well on a past project"); Node 20
already installed; one language across client/sim/server; Capacitor is the lowest-friction
path from a React web app to a Play Store APK and supports an AdMob plugin.
**Superseded:** original suggestion of Godot 4.x/GDScript (rejected per user).
**Risks:** WebView 3D performance on low-end Android (see TD-006); larger bundle than native.

## TD-002 — Pure, deterministic simulation core (`src/sim`)
**Decision:** All game logic lives in framework-free TypeScript, deterministic from a seed,
mutated only via ordered *intents*.
**Why:** Unit-testable in Node without a browser; reusable as a future authoritative
multiplayer server; clean save snapshots; prevents UI/render concerns from leaking into rules.
**Risks:** Discipline required to keep React/DOM out of the core; enforced by folder lint rules
and code review.

## TD-003 — Zustand as the sim↔UI state bridge
**Decision:** A Zustand store holds the latest serializable snapshot; React subscribes,
the sim writes.
**Why:** Tiny, no boilerplate, selector-based subscriptions avoid re-rendering the whole UI at
sim tick rate. Plays well with a high-frequency loop.
**Alternatives considered:** Redux (too much boilerplate), React context (re-render storms).

## TD-004 — Monetization: Google AdMob via `@capacitor-community/admob`, behind `AdService`
**Decision:** Implement an `AdService` interface (banner / interstitial / rewarded). Real impl
uses the Capacitor AdMob community plugin; `MockAdService` is used on web/dev. Gameplay never
calls the SDK directly.
**Why:** AdMob is the standard Play Store monetization path; rewarded ads suit games and are
opt-in/policy-friendly. The abstraction lets us build and test the entire reward flow offline
and swap providers later.
**Policy guardrails:** rewarded = opt-in only; interstitials only at natural breaks with
frequency caps; no ads mid-action; banners confined to menus. Test ad unit IDs in dev; real IDs
and consent (UMP/GDPR) wired in Phase 16.
**Risks:** Play family/ads policy compliance; must add a privacy policy + data-safety form for
release; consent management required in some regions.

## TD-005 — Tooling: Vite + Vitest + ESLint + Prettier + strict TS
**Decision:** Vite for dev/build, Vitest for unit tests, ESLint + Prettier for quality,
`strict` TypeScript.
**Why:** Fast HMR, first-class TS, Vitest shares Vite config and runs the pure sim core quickly.
**Quality bar:** `npm run build` (tsc), `npm run test`, `npm run lint` after every phase.

## TD-006 — 3D rendering risk acknowledged; renderer kept swappable
**Decision:** Use react-three-fiber but keep the renderer behind a thin boundary that only
reads sim snapshots, so we can degrade to 2D/2.5D (e.g. PixiJS) if WebView perf on mid/low-end
Android proves inadequate.
**Why:** "Low-poly/voxel + planet/orbit zoom" implies 3D, but mobile WebView GPU budgets are
tight. De-risk by not coupling game logic to the renderer.
**Re-evaluate at:** Phase 3 (planet prototype) and Phase 15 (perf pass).

## TD-007 — Offline-first; multiplayer is interfaces-only until later
**Decision:** The game is fully playable offline. Multiplayer (friend-based, not MMO) is
designed as Node.js server + client interfaces in Phase 14 but not implemented now.
**Why:** User requirement; reduces scope risk; deterministic core makes later netcode feasible
(command/snapshot model).

## Environment facts (2026-06-18)
- Node v20.11.1, npm 10.2.4, git 2.43.0 — present.
- Godot, Java/JDK — **not** installed. JDK 17 needed only for Phase 16 Android build.
- Workspace `The World We Live In/` started empty.
