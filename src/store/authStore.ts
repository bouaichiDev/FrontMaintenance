import { create } from 'zustand';
import { UserProfileDto } from '../types';

interface AuthState {
  token: string | null;
  user: UserProfileDto | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserProfileDto) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserProfileDto>) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage
  const savedToken = localStorage.getItem('token');
  const savedUserJson = localStorage.getItem('user');
  let savedUser: UserProfileDto | null = null;
  
  if (savedUserJson) {
    try {
      savedUser = JSON.parse(savedUserJson);
    } catch {
      localStorage.removeItem('user');
    }
  }

  return {
    token: savedToken,
    user: savedUser,
    isAuthenticated: !!savedToken && !!savedUser,
    setAuth: (token, user) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      set({ token, user, isAuthenticated: true });
    },
    clearAuth: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ token: null, user: null, isAuthenticated: false });
    },
    updateUser: (userData) => set((state) => {
      if (!state.user) return {};
      const updatedUser = { ...state.user, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    })
  };
});
