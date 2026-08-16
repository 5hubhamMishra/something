export interface ChapterDef {
  id: string;
  navLabel: string;
  title: string;
  /** page units within the ScrollControls timeline */
  start: number;
  end: number;
  /** world-space Z where this chapter's 3D content lives */
  worldZ: number;
  camera: {
    position: [number, number, number];
    target: [number, number, number];
    fov?: number;
  };
}

// Every chapter's (end - start) sets its DOM section's minHeight, in "pages"
// of 100vh — but drei's <Scroll html> moves that DOM using `pages` (this
// constant) and each keyframe's page number, NOT the section's actual
// rendered height. If real content needs more vertical space than its
// budget, the section grows past its slot (minHeight is a floor, not a
// cap) and the NEXT chapter's camera/nav state arrives before that extra
// height has actually scrolled by — so the next chapter's heading, and
// worse, its 3D content if it doesn't have its own opaque backdrop, is
// visible on screen at the same time as the previous chapter's tail.
// That's what "the family tree overlaps the family chapter" actually was.
//
// These start/end values are set from real measurements (Chromium,
// 1280x720, via getBoundingClientRect on every chapter <section>), not
// estimates, with a ~8% buffer per chapter so ordinary content edits don't
// immediately reopen the gap. If you edit a chapter's copy substantially,
// re-measure with scratchpad's measure.js pattern and re-tune here.
export const TOTAL_PAGES = 27.1;
const STEP = 16;

const z = (i: number) => -i * STEP;

export const CHAPTERS: ChapterDef[] = [
  {
    id: 'beginning',
    navLabel: 'THE BEGINNING',
    title: 'Before We Knew Him As Dad',
    start: 0,
    end: 1.2,
    worldZ: z(0),
    camera: { position: [0, 0.3, z(0) + 6], target: [0, 0, z(0)], fov: 45 },
  },
  {
    id: 'journey',
    navLabel: 'THE JOURNEY',
    title: 'The Journey',
    start: 1.2,
    end: 4.3,
    worldZ: z(1),
    camera: { position: [0.4, 1.1, z(1) + 6], target: [0, 0.4, z(1) - 6], fov: 50 },
  },
  {
    id: 'man',
    navLabel: 'THE MAN',
    title: 'The Man',
    start: 4.3,
    end: 5.4,
    worldZ: z(2),
    camera: { position: [0, 0, z(2) + 5.5], target: [0, 0, z(2)], fov: 42 },
  },
  {
    id: 'family',
    navLabel: 'THE FAMILY',
    title: 'The Family',
    start: 5.4,
    end: 6.6,
    worldZ: z(3),
    camera: { position: [0, 0.4, z(3) + 7], target: [0, 0, z(3)], fov: 48 },
  },
  {
    id: 'family-tree',
    navLabel: 'THE FAMILY TREE',
    title: 'The Family Tree',
    start: 6.6,
    end: 8.8,
    // A full STEP from both neighbors (not a half-step) — squeezing this chapter
    // halfway between 'family' and 'memories' put their FloatingPhotos within
    // easy fog/FOV range of this chapter's camera, so their photos visibly
    // bled through behind the tree. Every other chapter keeps a full STEP gap;
    // this one needs it even more since its DOM content is a dense photo grid,
    // not sparse prose, so bleed-through reads as broken rather than ambient.
    worldZ: z(4),
    camera: { position: [0, 0, z(4) + 6], target: [0, 0, z(4)], fov: 46 },
  },
  {
    id: 'memories',
    navLabel: 'THE MEMORIES',
    title: 'The Memory Archive',
    start: 8.8,
    end: 10.1,
    worldZ: z(5),
    camera: { position: [0, 0, z(5) + 6.5], target: [0, 0, z(5) - 3], fov: 46 },
  },
  {
    id: 'funside',
    navLabel: 'THE SIDE WE KNOW',
    title: 'The Side Of Dad We Know',
    start: 10.1,
    end: 11.1,
    worldZ: z(6),
    camera: { position: [0, 0.2, z(6) + 5.5], target: [0, 0, z(6)], fov: 44 },
  },
  {
    id: 'lessons',
    navLabel: 'THE LESSONS',
    title: 'The Lessons',
    start: 11.1,
    end: 12.4,
    worldZ: z(7),
    camera: { position: [0, 0, z(7) + 6], target: [0, 0, z(7) - 3], fov: 44 },
  },
  {
    id: 'years',
    navLabel: 'THE YEARS',
    title: 'The Years',
    start: 12.4,
    end: 14.0,
    worldZ: z(8),
    camera: { position: [0, 0.2, z(8) + 5], target: [0, 0, z(8)], fov: 40 },
  },
  {
    id: 'legacy',
    navLabel: 'THE LEGACY',
    title: 'His Legacy',
    start: 14.0,
    end: 16.0,
    worldZ: z(9),
    camera: { position: [0, 1, z(9) + 8], target: [0, 1.5, z(9)], fov: 50 },
  },
  {
    id: 'future',
    navLabel: 'THE FUTURE',
    title: 'The Future',
    start: 16.0,
    end: 17.1,
    worldZ: z(10),
    camera: { position: [0, 0, z(10) + 6], target: [0, 0, z(10) - 2], fov: 46 },
  },
  {
    id: 'finale',
    navLabel: 'THE BIRTHDAY',
    title: 'Happy Birthday, Dad',
    start: 17.1,
    // FinaleDom stacks 9 full-viewport reveal blocks (name + body lines +
    // closing lines + final mark). drei's <Scroll html> positions DOM content
    // from `pages`, not actual rendered height, so the page budget here must
    // cover all 9 screens or the tail (the birthday message itself) becomes
    // permanently unreachable no matter how far the user scrolls.
    end: 27.1,
    worldZ: z(11),
    camera: { position: [0, 0, z(11) + 4], target: [0, 0, z(11)], fov: 38 },
  },
];

export const NAV_CHAPTERS = CHAPTERS.filter((c) => c.id !== 'finale');

export function chapterProgress(id: string, offset: number): number {
  const c = CHAPTERS.find((ch) => ch.id === id);
  if (!c) return 0;
  const startFrac = c.start / TOTAL_PAGES;
  const endFrac = c.end / TOTAL_PAGES;
  if (offset <= startFrac) return 0;
  if (offset >= endFrac) return 1;
  return (offset - startFrac) / (endFrac - startFrac);
}

export function activeChapterId(offset: number): string {
  const page = offset * TOTAL_PAGES;
  for (const c of CHAPTERS) {
    if (page >= c.start && page < c.end) return c.id;
  }
  return offset <= 0 ? CHAPTERS[0].id : CHAPTERS[CHAPTERS.length - 1].id;
}

export function chapterById(id: string): ChapterDef {
  return CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0];
}

interface CameraKeyframe {
  page: number;
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

// DOM chapter text is left-aligned (see ChapterBeginning.tsx's pattern), so the camera
// look-target is nudged left of the 3D content's true center — this pushes floating
// photos/constellations/etc. into the right two-thirds of the frame, keeping the left
// column legible instead of text and geometry overlapping. The finale's text is centered,
// so it's excluded.
const READING_BIAS_X = -1.5;

function biasedTarget(c: ChapterDef): [number, number, number] {
  const bias = c.id === 'finale' ? 0 : READING_BIAS_X;
  return [c.camera.target[0] + bias, c.camera.target[1], c.camera.target[2]];
}

const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  ...CHAPTERS.map((c) => ({
    page: c.start,
    position: c.camera.position,
    target: biasedTarget(c),
    fov: c.camera.fov ?? 45,
  })),
  {
    page: CHAPTERS[CHAPTERS.length - 1].end,
    position: CHAPTERS[CHAPTERS.length - 1].camera.position,
    target: biasedTarget(CHAPTERS[CHAPTERS.length - 1]),
    fov: CHAPTERS[CHAPTERS.length - 1].camera.fov ?? 45,
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

export function getCameraPose(offset: number) {
  const page = offset * TOTAL_PAGES;
  let lo = CAMERA_KEYFRAMES[0];
  let hi = CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];

  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    if (page >= CAMERA_KEYFRAMES[i].page && page <= CAMERA_KEYFRAMES[i + 1].page) {
      lo = CAMERA_KEYFRAMES[i];
      hi = CAMERA_KEYFRAMES[i + 1];
      break;
    }
  }

  const span = hi.page - lo.page || 1;
  const t = smooth(Math.min(1, Math.max(0, (page - lo.page) / span)));

  return {
    position: [
      lerp(lo.position[0], hi.position[0], t),
      lerp(lo.position[1], hi.position[1], t),
      lerp(lo.position[2], hi.position[2], t),
    ] as [number, number, number],
    target: [
      lerp(lo.target[0], hi.target[0], t),
      lerp(lo.target[1], hi.target[1], t),
      lerp(lo.target[2], hi.target[2], t),
    ] as [number, number, number],
    fov: lerp(lo.fov, hi.fov, t),
  };
}
