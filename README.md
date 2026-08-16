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

## 4. Set up the login

The whole site sits behind a single username/password gate (`src/proxy.ts`) — there's only ever one account. Forgotten passwords are reset with a one-time code emailed to you (via [Resend](https://resend.com), a native Vercel Marketplace integration) rather than stored anywhere recoverable.

**Nothing here is ever committed.** `.env.local` is gitignored; only `.env.example` (empty key names, no values) is tracked. The password itself is never stored in an env var — only its salted hash, kept in Redis so it can actually change at runtime without a redeploy.

1. **Install Resend and Upstash for Redis from the Vercel dashboard** (Project → Integrations → Browse Marketplace), making sure you're in the correct team scope and connect each one to this project. The `vercel integration add` CLI path *can* work too, but in practice the terms-acceptance handoff is flaky — the dashboard is more reliable.

2. **Get the actual key/credential values** — Vercel provisions both as write-only "Sensitive" variables, so `vercel env pull` can't retrieve them (a pull will show `[SENSITIVE]` instead of the real value). Get the real values from each provider's own dashboard instead:
   - Resend: `resend.com/api-keys` → Create API Key → copy it immediately, it's shown once.
   - Redis: Vercel Project → Storage tab → click the database → copy `KV_REST_API_URL` and `KV_REST_API_TOKEN` from there.

3. **Fill in `.env.local`** (see `.env.example` for the full list): `SITE_USERNAME`, `SESSION_SECRET` (one was already generated for you), `OWNER_EMAIL`, `RESEND_API_KEY`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`.

4. **Push the non-auto-provisioned ones to Vercel too** (`SITE_USERNAME`, `SESSION_SECRET`, `OWNER_EMAIL`, `RESEND_API_KEY` if the dashboard install didn't already set it):
   ```bash
   vercel env add SITE_USERNAME production,preview,development --value "..." --no-sensitive
   ```
   (repeat per variable — split `production,preview` from `development` with `--no-sensitive` if you want it marked Sensitive, since Development doesn't support that type).

5. **Set the initial password** (bypasses the OTP flow, since there's nothing to reset yet):
   ```bash
   node scripts/set-password.mjs "your new password"
   ```
   Run this again any time you want to change the password directly. It writes straight to Redis using the `KV_REST_API_URL` / `KV_REST_API_TOKEN` in `.env.local` — make sure those are the *production* database's credentials if you want it to take effect on the live site.

Once that's done, visiting the site prompts for the username/password, and "Forgot password?" on `/login` emails a 6-digit code good for 10 minutes.

## 5. Architecture, in brief

- **One persistent `<Canvas>`** (`src/components/canvas/Experience3D.tsx`) renders the entire journey as a single 3D "corridor" along the Z axis — each chapter's content lives in its own world-space slot (`src/lib/chapters.ts`), and the camera flies through them as you scroll.
- **`ScrollControls`** (from `@react-three/drei`) drives both the 3D camera and the HTML text overlays from one synchronized scroll value — no separate scroll library needed.
- **`src/lib/store.ts`** (zustand) is the bridge between the WebGL world and the DOM UI (chapter nav, audio toggle, secret memories, family-star selection).
- **Chapters** live in `src/components/chapters/` — each exports a `*Scene` (3D) and `*Dom` (HTML) component pair.
- Reduced-motion and mobile are detected in `src/hooks/useMediaFlags.ts` and used to scale back particle counts and disable post-processing bloom.

## 6. Deploy

This is a standard Next.js app — deploy it to Vercel:

```bash
npm i -g vercel   # if you don't have it
vercel            # preview deployment
vercel --prod     # production deployment
```

or connect the repository at [vercel.com/new](https://vercel.com/new) for automatic deployments on every push.

## 7. Performance notes

- No external assets are required for the site to look intentional — every visual has a placeholder fallback.
- Particle counts, DPR, and post-processing automatically scale down on mobile and when `prefers-reduced-motion` is set.
- Photos are only fetched/decoded when an `image` path is actually provided in the config.
