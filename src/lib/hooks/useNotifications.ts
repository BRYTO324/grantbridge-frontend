/**
 * Real notifications hook — fetches from /api/v1/notifications/
 * Polls every 30 seconds to pick up new notifications.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "../api/api-client";
import { useAppStore } from "../store";

export interface Notification {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  link: string;
  createdAt: string;
}

interface NotificationsResponse {
  count: number;
  unreadCount: number;
  results: Notification[];
}

export function useNotifications() {
  const { isAuthenticated } = useAppStore();

  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchApi<NotificationsResponse>("/notifications/"),
    enabled: isAuthenticated,
    refetchInterval: 30_000, // poll every 30 seconds
    staleTime: 10_000,
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchApi<{ message: string }>("/notifications/read-all/", {
        method: "POST",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkOneRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchApi<Notification>(`/notifications/${id}/read/`, {
        method: "PATCH",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
