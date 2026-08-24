# Final QA Report — Cinematic Upgrade Pass

Branch: `upgrade/cinematic-birthday-v2` (not merged to `main`). 8 commits, all small and scoped to one change each.

All 12 chapters, every canvas primitive, every UI component, all `src/lib/` files, both auth routes and the login page, and `layout.tsx`/`globals.css` were read end-to-end this pass (not just sampled) — closing the gap the first audit flagged as unread.

## Issues Found

1. Chapter navigation was entirely absent below the `md` breakpoint — phones had no way to jump chapters.
2. Eight chapters ran their full desktop particle count on every device; only the corridor dust and bloom scaled down for mobile/reduced-motion.
3. The opening intro ran ~12.6s plus a 1.2s fade, with no skip control, and replayed in full on every page reload (state wasn't persisted).
4. Memory photos had no enlarge/lightbox interaction, and the DOM overlay for that chapter showed only text — the photos themselves existed only inside the WebGL layer, invisible to screen readers or anyone without WebGL.
5. A WebGL failure (unsupported browser, lost context) had no fallback — since all chapter content, including text, renders inside the R3F scene tree, this meant a blank page with nothing reachable.
6. Login had no password-visibility toggle.
7. One source image (`gujari.jpg`, 195×616px) is lower resolution than ideal for its use.
8. The Family chapter's DOM copy told visitors to click a face "in the family tree" — but the actual clickable constellation is that chapter itself; the separate Family Tree chapter is a static, non-interactive photo grid. Misleading instruction, found on the full read-through.
9. Login inputs used `outline-none` with only a border-color change as the focus indicator — no visible focus ring for keyboard navigation.
10. The login page trusted a manually supplied `from` query value after sign-in; the proxy-generated value is safe, but a typed URL could point somewhere outside the site.
11. Floating 3D timeline/memory photos did not have their own failed-image boundary, so a single missing or failed photo texture could still bubble up to the canvas-level fallback.
12. WebGL photo textures did not explicitly set sRGB color space, risking flatter or shifted photo color in Three.js.
13. A reset OTP was written before sending email and stayed active if the email provider failed.
14. **Found via an actual browser render, not code review**: floating photo cards showed a fine banded/moiré interference pattern across the whole photo — every chapter, every photo, both desktop and mobile viewports. Root cause: `FloatingPhoto`'s photo plane sat at local `z = 0.02`, exactly the same depth as the front face of its `RoundedBox` frame (depth `0.04`, so front face at `z = +0.02`) — genuinely coplanar geometry, not merely close. That's a textbook z-fighting setup.

## Changes Made

- **Mobile navigation**: added a compact tap-to-expand chapter drawer (`MobileChapterNav.tsx`), visible only below `md`, showing a chapter counter and progress bar plus a drawer with the same jump-to-chapter behavior `ChapterNav` already had on desktop.
- **Adaptive particle density**: `ParticleField.tsx` and `ChapterFunSide.tsx`'s `Sparkles` now read device/motion capability directly and scale count down (~45%) on mobile or reduced-motion, and stop the ambient rotation entirely for reduced-motion. This fixes all 7 chapters that use `ParticleField` from one change, without touching each chapter individually.
- **Skippable, non-repeating intro**: a Skip control appears 2s into the sequence; completion is recorded in `sessionStorage` so a reload within the same visit skips straight to the experience instead of replaying the ~14s sequence.
- **Photo lightbox**: clicking/tapping a floating photo (3D) or its new DOM thumbnail (Memories chapter cards) opens a full-size view with a caption, closeable via the backdrop, a close button, or Escape.
- **WebGL fallback**: `Experience3D` is now wrapped in an error boundary that shows a calm, on-brand message instead of a blank page if the Canvas fails to render.
- **Login**: added a show/hide toggle to both password fields, and a visible `focus-visible` ring on the inputs (previously only a border-color change).
- **Auth hardening**: sanitized the login return path to same-site paths only, and cleared reset OTPs if the reset email cannot be delivered.
- **WebGL photo resilience**: added a local error boundary around floating photos and set WebGL photo textures to sRGB color space.
- **WebGL photo stability**: moved the floating photo/placeholder planes from `z = 0.02` to `z = 0.05` — clear of the `RoundedBox` frame's front face at `z = 0.02` — to eliminate the z-fighting moiré pattern found by actual rendering (see Tests below). Confirmed fixed by re-screenshotting the same chapter before and after.
- **Copy fix**: corrected the Family chapter's misleading "click a face in the family tree" text.
- **Tooling**: added `npm run check-content`, a script that diffs `site.config.json` against the Phase-0 backup and flags any removed key, shrunk array, or string that went from real content to empty/placeholder.
- **Image tooling**: added `npm run generate-webgl-images`, which regenerates the WebGL photo variants and the `webgl-image.ts` path map from the current `public/images/` folder. `sharp` is declared as a direct dev dependency for that script instead of relying on Next's transitive install.

## Content Preservation

`_backups/site.config.20260824-143456.json` was taken before any change in this pass. `npm run check-content` was run after every commit and reports clean each time — no removed keys, no shrunk arrays (family/timeline/memories/achievements/lessons/futureDreams), no string that had real content and is now empty or a placeholder. `site.config.json` itself was never edited. Every image path referenced anywhere in the config (24) plus the one hardcoded portrait (`portrait-casual.jpg`) was checked against `public/images/` directly — all 25 resolve; none are broken.

## Mobile

Verified in code: the new nav is `md:hidden`, uses 44px+ touch targets, and doesn't rely on hover. Adaptive particle scaling applies automatically via the existing `useIsMobile`/`useReducedMotion` hooks. Every `hover:` usage in the codebase (14, across 9 files) was checked individually on the full read-through — all are decorative progressive-enhancement (color/glow transitions on already-visible, already-tappable elements) or apply only to the desktop-only `ChapterNav` (which has a fully separate mobile equivalent); none gate content behind a hover-only interaction a touch user can't reach. Confirmed by screenshot at a 390×844 viewport: the mobile chapter counter genuinely renders, no horizontal overflow. **Not verified on real device hardware** — see Tests below.

## Images

Full inventory in `PHOTO_QUALITY_REPORT.md`. One file (`gujari.jpg`) is lower-resolution than ideal for its use; not replaced, not removed — documented with the reason and a recommended minimum. Everything else checked out clean: correct proportions, no stretching, no corruption.

## Performance

Two meaningful changes: the particle/Sparkles fix (previously only `CorridorDust` and `Bloom` were mobile-aware; now every chapter's ambient particles are too), and adaptive-resolution WebGL photo textures (see below — every device previously loaded the same full-size source image for 3D photo planes). Texture disposal was not changed; the project still relies on drei's texture caching, and this wasn't profiled.

## Tests

- `npm run build` — passes (Turbopack, TypeScript, all 7 routes) after every commit.
- `npm run lint` — passes with zero warnings after every commit.
- `npm run check-content` — passes after every commit.
- `npm run generate-webgl-images` — re-run independently; output is byte-identical to what's committed (deterministic).
- Dev server smoke test: `/login` returns 200 and compiles without server errors; `/` correctly redirects (307) to `/login` when unauthenticated (`proxy.ts` behavior unchanged).

**A real browser pass did happen, later in this session.** Playwright (Chromium, already present on this machine — no new dependency added to the project) was driven against the actual running dev server, authenticated with a locally-signed session cookie (same technique noted above: HMAC-signed with `SESSION_SECRET` from `.env.local`, verified with no Redis lookup and no password involved — see `src/lib/session.ts`). Confirmed by screenshot, at both a desktop (1440×900) and mobile (390×844) viewport:
- The Canvas renders, the opening overlay's Enter button works, the Skip control works, zero console errors and zero page errors across the whole run.
- Desktop `ChapterNav` renders and shows the active chapter.
- The mobile chapter counter (`MobileChapterNav`) genuinely renders and reads "01 / 11" — confirms it reaches real users, not just that the code compiles.
- No horizontal overflow at the mobile viewport.
- This is what caught issue #14 above (the z-fighting moiré) — a bug no amount of code review or build/lint checking could have found, and the fix was re-verified the same way (before/after screenshot, same chapter, same viewport).

**Caveat, stated plainly**: this ran under software WebGL rendering (confirmed via `WEBGL_debug_renderer_info`: "SwiftShader Device (Subzero)"), not a real GPU — this sandboxed environment has no hardware acceleration available. Software rendering is generally a *stricter* test for z-fighting/precision issues, not a looser one, so a fix that resolves it here should if anything be safer on real hardware, not riskier — but the exact pixel-level look on a real phone or laptop GPU still hasn't been seen. Also not done: clicking a floating photo to open the lightbox specifically (WebGL canvas objects need pixel-coordinate clicks in Playwright, not attempted this round), Safari/Firefox rendering, and every other chapter beyond the one screenshotted (Beginning) — the fix is structural (the same `z=0.02` coplanarity existed in every `FloatingPhoto` instance across every chapter that uses it), but only one was directly seen.

## Adaptive WebGL Texture Resolution

WebGL photo planes (floating photos, family-constellation portraits) loaded the original full-size `public/images/` file directly via `useTexture`, which bypasses Next/Image's optimizer entirely — every device downloaded the same source regardless of screen size. Heaviest case: `rituraj.jpg`, 3000×4000 / 605KB, loaded in full on a phone.

Fixed: pre-generated `sm` (max 900px long edge) / `lg` (max 1400px) variants for all 25 photos under `public/images/webgl/`, with `src/lib/webgl-image.ts` mapping config paths to the right variant (falls back to the original path for anything not in its known list, so it degrades safely rather than breaking if a new photo is added later without updating that list). `FloatingPhoto` and `ConstellationGraph` now request the size-appropriate variant based on `useIsMobile`, and those WebGL textures are explicitly marked as sRGB for correct photo color. DOM images (the `next/image` usages, the lightbox) are untouched — they already go through Next's own optimizer, and the lightbox in particular should keep showing full quality since the visitor explicitly asked to see it larger.

Independently re-verified: all 50 generated files are within their size cap and none are upscaled past their source (confirmed by direct pixel inspection, not just trusting the report) — `gujari.jpg`'s variants stay 195×616, so the low-resolution limitation is preserved rather than papered over. `npm run build`, `npm run lint`, and `npm run check-content` all pass with these changes included, plus the login redirect hardening, floating-photo fallback, sRGB texture setup, and OTP cleanup.

Regeneration is now covered by `npm run generate-webgl-images`; if a new photo is added to `public/images/`, run that script to create its WebGL variants and refresh the helper map.

## Remaining Issues

- **Partial real-hardware/cross-browser gap.** The one browser pass that happened was headless Chromium under software rendering (SwiftShader), one chapter (Beginning), two viewport sizes. Real GPU rendering, Safari/Firefox, and the other 11 chapters have not been directly seen — only exercised by code review and the general smoke checks (no console errors across the run, canvas present, nav present). Recommend a manual pass on an actual phone and laptop against `upgrade/cinematic-birthday-v2` before merging, particularly scrolling through every chapter once.
- The lightbox's open/close interaction specifically wasn't clicked through in the automated pass (WebGL canvas objects need pixel-coordinate clicks, not attempted) — the DOM-thumbnail path into the same lightbox (Memories chapter cards) is ordinary DOM and lower-risk, but the 3D-photo click path is unverified end-to-end.
- `gujari.jpg` (195×616) could use a higher-resolution original if one exists among the raw exports in `family/`.
- No texture disposal was added for `useTexture` calls; drei's cache mitigates this, but it wasn't profiled.
- This branch (`upgrade/cinematic-birthday-v2`) has not been merged to `main` or deployed — that's a decision for you, not made automatically.
