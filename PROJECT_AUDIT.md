# Project Audit — The Universe of Dad

Phase 1 audit, produced before any redesign work. Scope: architecture, UX, visual design, performance, images, and responsive behavior. Findings are graded by priority (P1 = fix before anything else, P2 = fix during the relevant phase, P3 = optional polish).

Baseline verified before this audit: `npm run build` succeeds cleanly (Next.js 16.3.0 / Turbopack, TypeScript passes, all 7 routes generate), `npm run lint` passes with zero warnings. Branch `upgrade/cinematic-birthday-v2` created as the working checkpoint; a timestamped copy of `site.config.json` is in `_backups/`.

---

## 1. Architecture

**Overall assessment: sound, and should be preserved as-is.** The single-`<Canvas>` + `ScrollControls` + world-Z chapter layout is a good fit for this experience and doesn't need to be rearchitected.

- `Experience3D.tsx` is the only place that reads `useIsMobile()` / `useReducedMotion()`. Those flags scale the top-level `CorridorDust` particle count and gate the post-processing `Bloom` pass — but they are **not passed down to individual chapters**. See Performance §4 below; this is the single biggest architectural gap found.
- `chapters.ts`'s camera-keyframe system (`getCameraPose`) is well-documented in its own comments, including a real incident ("the family tree overlaps the family chapter") and the exact reasoning for the fix (a full `STEP` gap instead of a half-step). This kind of institutional knowledge is valuable — preserve these comments, don't clean them away as "explaining what the code does."
- `store.ts` (Zustand) is a clean, minimal bridge — 13 fields, no bloat. No changes needed.
- Auth stack (`proxy.ts`, `session.ts`, `password.ts`, `redis.ts`, `credentials-store.ts`, `email.ts`) is already doing the right things: HMAC-signed sessions, scrypt hashing, timing-safe comparisons, Redis-backed OTP with TTL, per-IP rate limiting on all three auth routes. **No security changes are needed** — see Security section.

## 2. UX

**P1 — Opening intro has no skip, and it's long.** `OpeningOverlay.tsx`'s GSAP timeline runs sequentially through glow → line 1 → line 2 → name/tagline → camera push. Summing the actual tween durations and offsets in the timeline gives **~12.6s** from pressing "Enter" to `introComplete`, plus a further 1.2s fade-out — **~13.8s** before the visitor can scroll or interact at all. There is no skip button, and `hasEntered`/`introComplete` are pure in-memory Zustand state (unlike `discovered` secrets, which persist to `localStorage`) — so **every page refresh forces the full ~14s intro again**, including for a family member re-opening the link a second time. The master brief for this project explicitly calls out "do not make entry animation too long" and "entry should be fast" — this is the clearest violation of that in the current build.
- Recommended fix direction: keep the intro (it's well-crafted), but add a tap/click-to-skip affordance after ~2s, and persist `introComplete` for the session (or a short TTL) so reloads don't replay it.

**P1 — Chapter navigation is desktop-only.** `ChapterNav.tsx` is `hidden md:flex` — below the `md` breakpoint (768px) there is **no chapter navigation at all**. This is a direct, unaddressed gap against the brief's "Mobile Chapter Navigation" requirement (compact indicator / drawer / progress counter). Phones are the primary device for a birthday link shared with family, so this is high priority.

**P2 — Memories chapter photos have no enlarge/lightbox.** `FloatingPhoto.tsx` (used by `ChapterMemories`) renders each photo as a WebGL mesh with no `onClick`/`onPointerDown` handler — there is no way to view a memory photo larger than its floating-frame size, on any device. The DOM overlay for this chapter (`MemoriesDom`) shows only text cards (title/date/description), not the images themselves, so a screen-reader user or anyone relying on the DOM layer never sees the photos at all. This is a real accessibility gap, not just a nice-to-have (brief section 27: "important personal content rendered visually in WebGL must have a meaningful DOM equivalent").

**Good, already meets the bar:**
- Login page (`src/app/login/page.tsx`): proper `autoComplete` attributes, numeric `inputMode`/`pattern` for the OTP field, `minLength={8}` on the new password, distinct loading/error/notice states, and login/forgot/reset all share the cinematic void/gold styling rather than looking like a bolted-on admin panel. Only gap: no password-visibility toggle.
- Finale (`ChapterFinale.tsx`): already does most of what the brief asks for — particles collapse toward a central glowing core as scroll progress approaches 1, the closing lines scale up in size/weight toward the final line, and it ends on a fixed calm state (pulsing dot + "The Universe of {name}"), not an infinite scroll into blank space.
- Family-member portrait loading (`ConstellationGraph.tsx`) already has a `PortraitErrorBoundary` so a missing/broken image file degrades to an initial-letter placeholder instead of crashing the whole constellation.

## 3. Visual Design

- The void/charcoal/graphite/midnight + warm-white/gold/bronze/silver palette (`globals.css`) is consistent and matches the "premium cinematic" brief — not neon, not glassmorphism-heavy, no clipart. Keep it as the single source of design tokens.
- `backdrop-blur-sm` appears on **card/panel backgrounds only** (login card, secret-memory modal, a few chapter text cards) — never on an actual photograph. This already respects the brief's "never blur the main photo" rule; no violations found.
- Typography: `Playfair Display` (display/serif) + `Manrope` (body) via `next/font/google`, consistent everywhere checked.
- 14 `hover:` usages exist across 9 files (login, nav, audio player, opening overlay, secret layer, sign-out, two chapters, word reveal). None were confirmed to gate *essential* content behind hover-only — most are visual-feedback affordances (underline/glow on a button that's already tappable) — but this list should be walked file-by-file during Phase 7 (accessibility pass) to confirm every one has a working touch equivalent.

## 4. Performance

**P1 — Per-chapter particle counts ignore mobile/reduced-motion.** Confirmed via direct inspection: eight chapters instantiate their own `<ParticleField count={...} />` (or `<Sparkles>`) independently of the `isMobile`/`reducedMotion` flags computed in `Experience3D.tsx`:

| Chapter | Particle count |
|---|---|
| Man | 500 |
| Memories | 350 |
| Family | 300 |
| Journey | 300 |
| Future | 300 |
| Legacy | 250 |
| Lessons | 250 |
| Fun Side (Sparkles) | 120 |

Only the corridor-wide `CorridorDust` (500 → 200) and the global `Bloom` post-process are currently mobile-aware. Every chapter-level particle field above renders its full desktop count on every device, all the time — this is the concrete mechanism behind sections 19/20/46 of the brief ("adaptive quality," "mobile heat/battery"). Straightforward fix: thread `isMobile`/`reducedMotion` down (context, or a small prop) and halve/zero these counts the same way `CorridorDust` already does.

- `useTexture` (drei) loads the **same source file, at full resolution, on every device** — there is no responsive/adaptive image strategy for WebGL textures (unlike DOM `<Image>`, which at least exists once, in `ChapterFamilyTree.tsx`, with `quality={90}` and `sizes="320px"`). A phone on a cellular connection loads the same 3000×4000 / 619KB `rituraj.jpg` as a 1440p desktop. See Images section for the exact file sizes.
- Texture quality itself is handled well: `FloatingPhoto.tsx` and `ConstellationGraph.tsx` both explicitly set `texture.anisotropy = gl.capabilities.getMaxAnisotropy()` — with a code comment noting this specifically fixes photos looking blurry at oblique viewing angles. `StarNode`'s hover/select pulse is deliberately excluded from idle-state scaling with a comment explaining that continuous rescaling would resample (blur) the photo texture every frame. This is exactly the kind of correct, considered handling the brief asks for — nothing to change here.
- No explicit texture disposal on unmount was found; drei's `useTexture` cache mitigates this somewhat, but it's worth profiling GPU memory during Phase 6 rather than assuming it's fine.

## 5. Images

Full inventory: 25 files in `public/images/` (currently wired into the site), 42 raw exports in `/family` (WhatsApp originals — a staging area, not directly referenced by the app). All are JPEG.

**24 of the 25 files in `public/images/` are referenced from `site.config.json`.** One is not currently referenced: `portrait-casual.jpg`. Per the brief's explicit rule ("before deleting something, prove it's unused... may be intentionally staged for future use"), **this has not been deleted** — flagging it here for a human decision only.

**Resolution concerns (real numbers, not estimates):**

| File | Dimensions | Notes |
|---|---|---|
| `gujari.jpg` | 195 × 616 | Extremely narrow source (195px wide). Will look soft/pixelated at any display width beyond a small thumbnail. Needs a higher-resolution original if one exists. |
| `garden.jpg`, `home-porch.jpg`, `undp-work.jpg`, `portrait-casual.jpg` | 715 × 536 | Usable for cards/thumbnails; will look soft if used as a large hero or full-bleed background. |
| `rituraj.jpg` | 3000 × 4000 (619KB) | Plenty of resolution, but this is the single heaviest file in the set and is loaded at full size regardless of device — see Performance §4. |

No stretching, incorrect aspect-ratio forcing, or corrupted files were found in this pass. All images opened cleanly and reported a sane `RGB` JPEG mode.

## 6. Responsive Behavior

- `Experience3D.tsx`'s `dpr` prop is the only place resolution scales for mobile (`[1, 1.5]` vs `[1, 2]`) — confirmed correct.
- `ChapterNav` is the only component that changes structure at a breakpoint (`hidden md:flex`) — every other chapter's DOM content was only spot-checked (`ChapterMemories.tsx`, `ChapterFinale.tsx`, `ChapterFamilyTree.tsx` partially) rather than exhaustively read chapter-by-chapter. A full per-chapter responsive pass (matching the brief's viewport list: 360×800 through 1920×1080) should happen during Phase 3/5, not assumed complete from this audit alone.
- No raw `100vh` usage was found in actual CSS/className strings (the one match was inside a `chapters.ts` code comment, not a style) — so the `100dvh`/`100svh` concern from the brief is currently moot, but worth keeping in mind if new full-screen sections are added.

## Prioritized Recommendations

1. **P1 — Mobile chapter navigation.** Currently zero navigation UI below `md`. Add a compact indicator/drawer per the brief's own suggestion (chapter counter, tap-to-reveal drawer).
2. **P1 — Thread `isMobile`/`reducedMotion` into every chapter's `ParticleField`/`Sparkles` call.** Eight chapters currently ignore device capability entirely.
3. **P1 — Make the opening intro skippable, and stop replaying it on every reload.** ~14s forced, non-skippable, non-persisted.
4. **P2 — Add a lightbox/enlarge interaction for `FloatingPhoto`** (Memories chapter), with a real DOM-visible fallback for accessibility/reduced-motion/WebGL-failure paths.
5. **P2 — Add a low-effort adaptive-resolution strategy for WebGL photo textures** (at minimum, confirm whether the app already has responsive source variants to reference, or whether `next/image`-style resizing needs to be introduced for texture sources).
6. **P3 — Resolve or replace `gujari.jpg`** (195×616) if a better original exists; otherwise keep its usage confined to small display sizes.
7. **P3 — Decide on `portrait-casual.jpg`** (currently unreferenced) — keep staged, wire it into the config, or intentionally remove it. Human call, not an automatic deletion.
8. **P3 — Full chapter-by-chapter responsive audit** across the 10 viewport sizes listed in the brief, during Phase 3/5 rather than as part of this initial pass.

## What this audit did not cover

To keep this a first-pass audit rather than a full read-through, the following were sampled rather than exhaustively reviewed: `ChapterBeginning`, `ChapterJourney`, `ChapterMan`, `ChapterYears`, `AudioPlayer`, `Reveal`, `WordReveal`, `SecretLayer` (beyond the two grep patterns already reported), `SignOutButton`, `introTween.ts`. None of these were flagged by any of the pattern searches run (raw `<img>` tags, `filter: blur`, `100vh`, missing `next/image`), but they have not been read end-to-end. Recommend a normal read-through of each as its chapter comes up in Phase 5 (Chapter Polish).
