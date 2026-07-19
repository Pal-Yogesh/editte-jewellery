"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  pendingEmail: string | null; // email awaiting OTP verification
  otpPurpose: "verify" | "reset" | null;
  setUser: (user: AuthUser | null) => void;
  setPendingEmail: (email: string | null, purpose: "verify" | "reset" | null) => void;
  clearPending: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      pendingEmail: null,
      otpPurpose: null,
      setUser: (user) => set({ user }),
      setPendingEmail: (email, purpose) =>
        set({ pendingEmail: email, otpPurpose: purpose }),
      clearPending: () => set({ pendingEmail: null, otpPurpose: null }),
      logout: () => set({ user: null, pendingEmail: null, otpPurpose: null }),
    }),
    {
      name: "editte-auth",
      partialize: (s) => ({ user: s.user }),
    }
  )
);
