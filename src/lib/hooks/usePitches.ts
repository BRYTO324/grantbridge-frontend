import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/live-api';
import type { PitchCard } from '../store';

export function usePitches() {
  return useQuery({
    queryKey: ['pitches'],
    queryFn: () => api.getPitches(),
  });
}

export function usePitch(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['pitch', id],
    queryFn: () => api.getPitchById(id),
    enabled: !!id,
    initialData: () =>
      queryClient.getQueryData<PitchCard[]>(['pitches'])?.find((pitch) => pitch.id === id),
  });
}

export function useUserPitches(userId: string) {
  return useQuery({
    queryKey: ['userPitches', userId],
    queryFn: () => api.getUserPitches(userId),
    enabled: !!userId,
  });
}

export function useCreatePitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pitch: Partial<PitchCard>) => api.createPitch(pitch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      queryClient.invalidateQueries({ queryKey: ['userPitches'] });
    },
  });
}

export function useUpdatePitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<PitchCard> }) =>
      api.updatePitch(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      queryClient.invalidateQueries({ queryKey: ['pitch', data.id] });
      queryClient.invalidateQueries({ queryKey: ['userPitches'] });
    },
  });
}

export function useDeletePitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deletePitch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      queryClient.invalidateQueries({ queryKey: ['userPitches'] });
    },
  });
}

export function useLikePitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pitchId: string) => api.likePitch(pitchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
    },
  });
}

export function useBookmarkPitch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pitchId: string) => api.bookmarkPitch(pitchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
    },
  });
}
