import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';
export type OpenMode = 'studio' | 'browser';

const MAX_RECENT_APPS = 6;
export const GOOGLE_AI_KEY_STORAGE = 'arct.googleAiKey';

type StudioState = {
  theme: ThemeMode;
  openMode: OpenMode;
  recentSlugs: string[];
  googleAiKey: string;
  setTheme: (theme: ThemeMode) => void;
  setOpenMode: (openMode: OpenMode) => void;
  rememberApp: (slug: string) => void;
  clearRecent: () => void;
  setGoogleAiKey: (key: string) => void;
};

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      theme: 'light',
      openMode: 'studio',
      recentSlugs: [],
      googleAiKey: '',
      setTheme: (theme) => set({ theme }),
      setOpenMode: (openMode) => set({ openMode }),
      rememberApp: (slug) =>
        set((state) => ({
          recentSlugs: [
            slug,
            ...state.recentSlugs.filter((recent) => recent !== slug),
          ].slice(0, MAX_RECENT_APPS),
        })),
      clearRecent: () => set({ recentSlugs: [] }),
      setGoogleAiKey: (key) => {
        const value = key.trim();
        try {
          if (value) {
            localStorage.setItem(GOOGLE_AI_KEY_STORAGE, value);
          } else {
            localStorage.removeItem(GOOGLE_AI_KEY_STORAGE);
          }
        } catch (error) {
          console.warn('Could not store the Google AI key', error);
        }
        set({ googleAiKey: value });
      },
    }),
    { name: 'arct-studio' },
  ),
);
