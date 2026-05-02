import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'LIGHT' | 'DARK';
  currency: string;
  settings?: {
    theme: 'LIGHT' | 'DARK';
    currency: string;
  };
  setUser: (user: User | null) => void;
  setTheme: (theme: 'LIGHT' | 'DARK') => void;
  setCurrency: (currency: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      theme: 'DARK',
      currency: 'USD',
      settings: {
        theme: 'DARK',
        currency: 'USD',
      },

      setUser: (user) => {
        const newTheme = user?.settings?.theme ?? get().theme;
        const newCurrency = user?.settings?.currency ?? get().currency;
        set({
          user,
          isAuthenticated: !!user,
          theme: newTheme,
          currency: newCurrency,
          settings: {
            theme: newTheme,
            currency: newCurrency,
          },
        });
        // Apply theme to DOM
        applyTheme(newTheme);
      },

      setTheme: (theme) => {
        set({ 
          theme,
          settings: {
            ...get().settings!,
            theme,
          },
        });
        applyTheme(theme);
      },

      setCurrency: (currency) => set({ 
        currency,
        settings: {
          ...get().settings!,
          currency,
        },
      }),

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        theme: state.theme,
        currency: state.currency,
        settings: state.settings,
      }),
    }
  )
);

function applyTheme(theme: 'LIGHT' | 'DARK') {
  if (theme === 'DARK') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

// Initialize theme on load
const storedTheme = useAuthStore.getState().theme;
applyTheme(storedTheme);
