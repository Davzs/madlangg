import { create } from 'zustand';

interface HydrationStore {
  isHydrated: boolean;
  setHydrated: () => void;
}

export const useHydration = create<HydrationStore>((set) => ({
  isHydrated: false,
  setHydrated: () => set({ isHydrated: true }),
}));
