# The Universe of Dad

A cinematic, immersive 3D birthday experience — an interactive digital monument built with Next.js, React Three Fiber, and GSAP. The entire site is a single scroll-driven journey through eleven chapters, ending in a personal birthday message.

Nothing personal is hardcoded into the components. Every name, photo, story, quote, and date lives in one file — `src/data/site.config.json` — so the experience can be fully personalized without touching any component code.

## 1. Personalize it — `src/data/site.config.json`

Open this file and replace every `[PLACEHOLDER]` with the real details:

| Section | What it drives |
|---|---|
| `father` | Name, birth date/place, profession, tagline, personality traits + the story behind each, favorite quotes |
| `timeline` | Chapter 2 — The Journey (year/title/description/photo per milestone) |
| `family` | Chapter 4 — The Family constellation (name, relation, message, and x/y/z position of their star) |
| `memories` | Chapter 5 — The Memory Archive (floating photographs) |
| `achievements` | Chapter 8 — The Years |
| `lessons` | Chapter 7 — The Lessons (word, his quote, the story behind it) |
| `futureDreams` | Chapter 10 — The Future (places/goals still ahead) |
| `hiddenMemories` | Secret, hidden content discoverable per chapter (set `chapter` to the chapter id it should appear in) |
| `funSide` | Chapter 6 — Dad jokes, habits, favorites, and the "Dad Console" |
| `audio` | Paths to ambient music beds and voice recordings (leave blank to disable) |
| `finalMessage` | The closing birthday letter |

Every field has a TypeScript type in `src/lib/types.ts` if you want to see the exact shape.

## 2. Add your assets

Drop files into these folders (paths in the JSON config should point here, e.g. `/images/dad-1978.jpg`):

```
public/
  images/    → photographs (referenced by "image" fields)
  videos/    → video clips (referenced by "video" fields)
  audio/     → ambient music beds + voice recordings
  textures/  → optional custom WebGL textures
  models/    → optional custom .glb/.gltf 3D models
  fonts/     → optional custom font files
```

Photos and memories work fine with **no image provided** — an elegant placeholder frame is shown instead, so you can personalize incrementally. Recommended photo size: ~1200px on the long edge, compressed (WebP/JPEG) to keep load times fast.

## 3. Run it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 4. Architecture, in brief

- **One persistent `<Canvas>`** (`src/components/canvas/Experience3D.tsx`) renders the entire journey as a single 3D "corridor" along the Z axis — each chapter's content lives in its own world-space slot (`src/lib/chapters.ts`), and the camera flies through them as you scroll.
- **`ScrollControls`** (from `@react-three/drei`) drives both the 3D camera and the HTML text overlays from one synchronized scroll value — no separate scroll library needed.
- **`src/lib/store.ts`** (zustand) is the bridge between the WebGL world and the DOM UI (chapter nav, audio toggle, secret memories, family-star selection).
- **Chapters** live in `src/components/chapters/` — each exports a `*Scene` (3D) and `*Dom` (HTML) component pair.
- Reduced-motion and mobile are detected in `src/hooks/useMediaFlags.ts` and used to scale back particle counts and disable post-processing bloom.

## 5. Deploy

This is a standard Next.js app — deploy it to Vercel:

```bash
npm i -g vercel   # if you don't have it
vercel            # preview deployment
vercel --prod     # production deployment
```

or connect the repository at [vercel.com/new](https://vercel.com/new) for automatic deployments on every push.

## 6. Performance notes

- No external assets are required for the site to look intentional — every visual has a placeholder fallback.
- Particle counts, DPR, and post-processing automatically scale down on mobile and when `prefers-reduced-motion` is set.
- Photos are only fetched/decoded when an `image` path is actually provided in the config.
