"use client";

import type { UserProfile } from "@aurora/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
  token?: string;
  user?: UserProfile;
  logout: () => void;
  setAuth: (token: string, user: UserProfile) => void;
  setUser: (user: UserProfile) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      logout: () => set({ token: undefined, user: undefined }),
      setAuth: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
    }),
    { name: "aurora-auth" },
  ),
);
