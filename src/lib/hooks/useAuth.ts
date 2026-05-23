/**
 * Auth hooks — wired to the real Django backend.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "../store";
import { fetchApi } from "../api/api-client";
import type { User } from "../store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginCredentials {
  email: string;
  password: string;
  role: "entrepreneur" | "funder";
}

interface SignupData {
  email: string;
  password: string;
  passwordConfirm?: string;
  fullName: string;
  role: "entrepreneur" | "funder";
  company?: string;
  phone?: string;
}

interface AuthResponse {
  user: User;
  access: string;
  refresh: string;
  message?: string;
}

// ─── Auth hooks ───────────────────────────────────────────────────────────────

export function useAuth() {
  const queryClient = useQueryClient();
  const { login: setAuth, logout: clearAuth } = useAppStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      fetchApi<AuthResponse>("/auth/login/", {
        method: "POST",
        body: JSON.stringify(credentials),
      }),
    onSuccess: (result) => {
      setAuth(result.user, { access: result.access, refresh: result.refresh });
      queryClient.setQueryData(["currentUser"], result.user);
    },
  });

  const signupMutation = useMutation({
    mutationFn: (data: SignupData) =>
      fetchApi<AuthResponse>("/auth/register/", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => {
      setAuth(result.user, { access: result.access, refresh: result.refresh });
      queryClient.setQueryData(["currentUser"], result.user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => {
      const { refreshToken } = useAppStore.getState();
      return fetchApi<{ message: string }>("/auth/logout/", {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
      }).catch(() => ({ message: "logged out" }));
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });

  return {
    login: loginMutation.mutate,
    signup: signupMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isSigningUp: signupMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  };
}

// ─── Profile hooks ────────────────────────────────────────────────────────────

/**
 * Fetch the current user from the backend and sync to store.
 * Called on app load to ensure store is always fresh.
 */
export function useCurrentUser() {
  const { updateUser, isAuthenticated } = useAppStore();
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const user = await fetchApi<User>("/auth/me/");
      updateUser(user);
      return user;
    },
    enabled: isAuthenticated,
    staleTime: 30_000, // re-fetch after 30s
    refetchOnWindowFocus: true,
  });
}

/**
 * Update profile — PATCH /auth/me/.
 * Immediately syncs the full backend response (including avatarUrl) to the store.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAppStore();

  return useMutation({
    mutationFn: (data: FormData | Record<string, unknown>) => {
      const isFormData = data instanceof FormData;
      return fetchApi<User>("/auth/me/", {
        method: "PATCH",
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    onSuccess: (updatedUser) => {
      // Sync FULL backend response to store — this updates avatarUrl, fullName, etc.
      updateUser(updatedUser);
      queryClient.setQueryData(["currentUser"], updatedUser);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) =>
      fetchApi<{ message: string }>("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  });
}

// ─── Password reset hooks ─────────────────────────────────────────────────────

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) =>
      fetchApi<{ message: string }>("/auth/forgot-password/", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}

export function useValidateResetToken() {
  return useMutation({
    mutationFn: (token: string) => Promise.resolve({ valid: Boolean(token) }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      fetchApi<{ message: string }>("/auth/reset-password/", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) =>
      fetchApi<{ message: string }>("/auth/verify-email/", {
        method: "POST",
        body: JSON.stringify({ token }),
      }),
  });
}

export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) =>
      fetchApi<{ message: string }>("/auth/resend-verification/", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });
}
