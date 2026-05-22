import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthState {
  // State
  accessToken: string | null;
  username: string | null;
  isAuthenticated: boolean;

  // Actions
  setAccessToken: (token: string) => void;
  setUsername: (username: string) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      accessToken: null,
      username: null,
      isAuthenticated: false,

      // Actions
      setAccessToken: (token: string) => {
        set({ accessToken: token, isAuthenticated: !!token });
      },

      setUsername: (username: string) => {
        set({ username });
      },

      setIsAuthenticated: (isAuth: boolean) => {
        set({ isAuthenticated: isAuth });
      },

      logout: () => {
        set({
          accessToken: null,
          username: null,
          isAuthenticated: false,
        });
      },

      reset: () => {
        set({
          accessToken: null,
          username: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
