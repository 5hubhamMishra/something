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

## Changes Made

- **Mobile navigation**: added a compact tap-to-expand chapter drawer (`MobileChapterNav.tsx`), visible only below `md`, showing a chapter counter and progress bar plus a drawer with the same jump-to-chapter behavior `ChapterNav` already had on desktop.
- **Adaptive particle density**: `ParticleField.tsx` and `ChapterFunSide.tsx`'s `Sparkles` now read device/motion capability directly and scale count down (~45%) on mobile or reduced-motion, and stop the ambient rotation entirely for reduced-motion. This fixes all 7 chapters that use `ParticleField` from one change, without touching each chapter individually.
- **Skippable, non-repeating intro**: a Skip control appears 2s into the sequence; completion is recorded in `sessionStorage` so a reload within the same visit skips straight to the experience instead of replaying the ~14s sequence.
- **Photo lightbox**: clicking/tapping a floating photo (3D) or its new DOM thumbnail (Memories chapter cards) opens a full-size view with a caption, closeable via the backdrop, a close button, or Escape.
- **WebGL fallback**: `Experience3D` is now wrapped in an error boundary that shows a calm, on-brand message instead of a blank page if the Canvas fails to render.
- **Login**: added a show/hide toggle to both password fields, and a visible `focus-visible` ring on the inputs (previously only a border-color change).
- **Auth hardening**: sanitized the login return path to same-site paths only, and cleared reset OTPs if the reset email cannot be delivered.
- **WebGL photo resilience**: added a local error boundary around floating photos and set WebGL photo textures to sRGB color space.
- **Copy fix**: corrected the Family chapter's misleading "click a face in the family tree" text.
- **Tooling**: added `npm run check-content`, a script that diffs `site.config.json` against the Phase-0 backup and flags any removed key, shrunk array, or string that went from real content to empty/placeholder.
- **Image tooling**: added `npm run generate-webgl-images`, which regenerates the WebGL photo variants and the `webgl-image.ts` path map from the current `public/images/` folder. `sharp` is declared as a direct dev dependency for that script instead of relying on Next's transitive install.

## Content Preservation

`_backups/site.config.20260824-143456.json` was taken before any change in this pass. `npm run check-content` was run after every commit and reports clean each time — no removed keys, no shrunk arrays (family/timeline/memories/achievements/lessons/futureDreams), no string that had real content and is now empty or a placeholder. `site.config.json` itself was never edited. Every image path referenced anywhere in the config (24) plus the one hardcoded portrait (`portrait-casual.jpg`) was checked against `public/images/` directly — all 25 resolve; none are broken.

## Mobile

Verified in code: the new nav is `md:hidden`, uses 44px+ touch targets, and doesn't rely on hover. Adaptive particle scaling applies automatically via the existing `useIsMobile`/`useReducedMotion` hooks. Every `hover:` usage in the codebase (14, across 9 files) was checked individually on the full read-through — all are decorative progressive-enhancement (color/glow transitions on already-visible, already-tappable elements) or apply only to the desktop-only `ChapterNav` (which has a fully separate mobile equivalent); none gate content behind a hover-only interaction a touch user can't reach. **Not verified visually on a real device** — see Tests below.

## Images

Full inventory in `PHOTO_QUALITY_REPORT.md`. One file (`gujari.jpg`) is lower-resolution than ideal for its use; not replaced, not removed — documented with the reason and a recommended minimum. Everything else checked out clean: correct proportions, no stretching, no corruption.

## Performance

Two meaningful changes: the particle/Sparkles fix (previously only `CorridorDust` and `Bloom` were mobile-aware; now every chapter's ambient particles are too), and adaptive-resolution WebGL photo textures (see below — every device previously loaded the same full-size source image for 3D photo planes). Texture disposal was not changed; the project still relies on drei's texture caching, and this wasn't profiled.

## Tests

- `npm run build` — passes (Turbopack, TypeScript, all 7 routes) after every commit.
- `npm run lint` — passes with zero warnings after every commit.
- `npm run check-content` — passes after every commit.
- Dev server smoke test: `/login` returns 200 and compiles without server errors; `/` correctly redirects (307) to `/login` when unauthenticated (`proxy.ts` behavior unchanged).
- **Not tested**: the authenticated 3D experience in an actual browser. No browser-automation tooling was available in this session, and testing it would require either real site credentials (not available, and the production password was never touched or guessed) or a temporary password change — which was deliberately avoided since `.env.local` here holds production Redis credentials and changing the live password without being asked is exactly the kind of action this project's own rules say not to take. So: chapter navigation, the lightbox open/close, intro skip behavior, particle density on an actual phone, and cross-browser rendering are all **unverified in a live browser** — everything above was confirmed by build/lint/type-check and direct code review only.

## Adaptive WebGL Texture Resolution

WebGL photo planes (floating photos, family-constellation portraits) loaded the original full-size `public/images/` file directly via `useTexture`, which bypasses Next/Image's optimizer entirely — every device downloaded the same source regardless of screen size. Heaviest case: `rituraj.jpg`, 3000×4000 / 605KB, loaded in full on a phone.

Fixed: pre-generated `sm` (max 900px long edge) / `lg` (max 1400px) variants for all 25 photos under `public/images/webgl/`, with `src/lib/webgl-image.ts` mapping config paths to the right variant (falls back to the original path for anything not in its known list, so it degrades safely rather than breaking if a new photo is added later without updating that list). `FloatingPhoto` and `ConstellationGraph` now request the size-appropriate variant based on `useIsMobile`, and those WebGL textures are explicitly marked as sRGB for correct photo color. DOM images (the `next/image` usages, the lightbox) are untouched — they already go through Next's own optimizer, and the lightbox in particular should keep showing full quality since the visitor explicitly asked to see it larger.

Independently re-verified: all 50 generated files are within their size cap and none are upscaled past their source (confirmed by direct pixel inspection, not just trusting the report) — `gujari.jpg`'s variants stay 195×616, so the low-resolution limitation is preserved rather than papered over. `npm run build`, `npm run lint`, and `npm run check-content` all pass with these changes included, plus the login redirect hardening, floating-photo fallback, sRGB texture setup, and OTP cleanup.

Regeneration is now covered by `npm run generate-webgl-images`; if a new photo is added to `public/images/`, run that script to create its WebGL variants and refresh the helper map.

## Remaining Issues

- **Needs a real browser pass.** Chapter navigation, the lightbox, intro skip, and particle density were verified by code review and build/lint/type-check only — not by seeing them render. One route-level authenticated check was done safely (a locally-signed session cookie, using `SESSION_SECRET` already in `.env.local` — no Redis access, no password involved) confirming `/` returns 200 and the new WebGL image variants are served correctly, but no visual/screenshot verification happened, since no browser-automation tool was available in this session. Recommend a manual pass on a phone and a laptop against `upgrade/cinematic-birthday-v2` before merging.
- `gujari.jpg` (195×616) could use a higher-resolution original if one exists among the raw exports in `family/`.
- No texture disposal was added for `useTexture` calls; drei's cache mitigates this, but it wasn't profiled.
- This branch (`upgrade/cinematic-birthday-v2`) has not been merged to `main` or deployed — that's a decision for you, not made automatically.
