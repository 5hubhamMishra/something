import { create } from 'zustand';

interface UniverseState {
  hasEntered: boolean;
  introComplete: boolean;
  scrollOffset: number;
  activeChapter: string;
  audioEnabled: boolean;
  discovered: Record<string, boolean>;
  activeSecret: string | null;
  selectedFamilyId: string | null;
  setSelectedFamily: (id: string | null) => void;
  scrollRequest: number | null;
  requestScrollTo: (page: number) => void;
  clearScrollRequest: () => void;
  enter: () => void;
  completeIntro: () => void;
  setScrollOffset: (v: number) => void;
  setActiveChapter: (id: string) => void;
  toggleAudio: () => void;
  discoverSecret: (id: string) => void;
  openSecret: (id: string | null) => void;
}

export const useUniverseStore = create<UniverseState>((set) => ({
  hasEntered: false,
  introComplete: false,
  scrollOffset: 0,
  activeChapter: 'beginning',
  audioEnabled: false,
  discovered: {},
  activeSecret: null,
  selectedFamilyId: null,
  setSelectedFamily: (id) => set({ selectedFamilyId: id }),
  scrollRequest: null,
  requestScrollTo: (page) => set({ scrollRequest: page }),
  clearScrollRequest: () => set({ scrollRequest: null }),
  enter: () => set({ hasEntered: true }),
  completeIntro: () => set({ introComplete: true }),
  setScrollOffset: (v) => set({ scrollOffset: v }),
  setActiveChapter: (id) => set({ activeChapter: id }),
  toggleAudio: () => set((s) => ({ audioEnabled: !s.audioEnabled })),
  discoverSecret: (id) =>
    set((s) => {
      const next = { ...s.discovered, [id]: true };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('universe-discovered', JSON.stringify(next));
        } catch {
          /* storage unavailable */
        }
      }
      return { discovered: next };
    }),
  openSecret: (id) => set({ activeSecret: id }),
}));

export function hydrateDiscovered() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('universe-discovered');
    if (raw) useUniverseStore.setState({ discovered: JSON.parse(raw) });
  } catch {
    /* ignore */
  }
}
