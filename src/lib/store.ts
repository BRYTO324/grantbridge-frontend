import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "entrepreneur" | "funder";

export type VerificationStatus =
  | "pending"
  | "submitted"
  | "verified"
  | "rejected";

export type FundingStatus = "open" | "funded" | "in_review" | "closed";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  company?: string;
  phone?: string;
  avatar?: string;
  avatarUrl?: string;
  location?: string;
  website?: string;
  bio?: string;
  verificationStatus: VerificationStatus;
  profileCompleted?: boolean;
  emailVerified?: boolean;
  verificationDocuments?: {
    idType?: string;
    idNumber?: string;
    idFront?: string;
    idBack?: string;
    selfie?: string;
    submittedAt?: string;
  };
}

export interface FundingOffer {
  id: string;
  funderId: string;
  funderName: string;
  funderCompany: string;
  amount: number;
  message: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface PitchCard {
  id: string;
  title: string;
  description: string;
  category: string;
  amountNeeded: number;
  fundingStatus: FundingStatus;
  fundedBy?: {
    funderId: string;
    funderName: string;
    funderCompany: string;
    fundedAmount: number;
    fundedDate: string;
  };
  entrepreneurId: string;
  entrepreneurName: string;
  entrepreneurAvatar: string;
  companyName: string;
  location: string;
  createdAt: string;
  tags: string[];
  stage: "idea" | "mvp" | "growth" | "scale";
  likes: number;
  views: number;
  image: string;
  imageUrl?: string;
  media?: string[];
  verified: boolean;
  offers?: FundingOffer[];
  verificationStatus?: "pending" | "approved" | "rejected";
  likedByMe?: boolean;
  bookmarkedByMe?: boolean;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isFirstLogin: boolean;
  // JWT tokens — persisted so api-client.ts can read them
  accessToken: string | null;
  refreshToken: string | null;

  login: (user: User, tokens: { access: string; refresh: string }) => void;
  logout: () => void;
  completeOnboarding: () => void;
  updateUser: (updates: Partial<User>) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: { access: string; refresh: string }) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isFirstLogin: true,
      accessToken: null,
      refreshToken: null,

      login: (user, tokens) =>
        set({
          user: {
            ...user,
            verificationStatus: user.verificationStatus || "pending",
            profileCompleted: user.profileCompleted || false,
          },
          isAuthenticated: true,
          isFirstLogin: !user.profileCompleted,
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isFirstLogin: true,
          accessToken: null,
          refreshToken: null,
        }),

      completeOnboarding: () => set({ isFirstLogin: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Full replace — use this when syncing from /auth/me/ to avoid stale fields
      setUser: (user) =>
        set({ user }),

      setTokens: (tokens) =>
        set({ accessToken: tokens.access, refreshToken: tokens.refresh }),
    }),
    {
      name: "grantbridge-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isFirstLogin: state.isFirstLogin,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
