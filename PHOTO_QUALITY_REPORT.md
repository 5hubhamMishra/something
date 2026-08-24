# Photo Quality Report

Every file in `public/images/` inspected directly (actual pixel dimensions and file size, not estimated). 25 files, all valid JPEG/RGB, all in use — 24 referenced from `src/data/site.config.json`, 1 (`portrait-casual.jpg`) hardcoded in `ChapterFamilyTree.tsx` as the father's portrait.

## Needs a better original

**gujari.jpg** — 195 × 616 px
- Used as a family-tree portrait (`ChapterFamilyTree.tsx`, rendered at up to 112px).
- Why it may look soft: 195px is a narrow source; fine at the current small card size, but would look pixelated if ever displayed larger.
- Recommended minimum replacement: ~500px on the short edge if a higher-resolution original becomes available.

## Borderline (fine at current usage, not ideal if enlarged)

715 × 536 px: `garden.jpg`, `home-porch.jpg`, `undp-work.jpg`, `portrait-casual.jpg`. All render correctly at their current card/thumbnail sizes; would look soft as a full-bleed hero.

## Heaviest source file

**rituraj.jpg** — 3000 × 4000 px, 605 KB. Plenty of resolution; it's the one file worth a compressed variant if the site ever adds responsive sizing for WebGL textures, since it's currently loaded at full size on every device.

## WebGL texture variants

Added generated WebGL-only JPEG variants under `public/images/webgl/` for every file in `public/images/`:
- `*-sm.jpg`: max 900px on the long edge, used by phone/tablet-width WebGL photo planes.
- `*-lg.jpg`: max 1400px on the long edge, used by larger WebGL viewports.

The original config paths and DOM/lightbox images remain unchanged. Small originals are not upscaled; for example `gujari.jpg` remains 195 × 616 px in both variants, so the source-quality limitation is preserved rather than hidden.

## Everything else

The remaining 19 files (625×908 up to 1280×1280, 27 KB–207 KB) are all sharp, correctly proportioned JPEGs with no stretching, incorrect cropping, or corruption found.
