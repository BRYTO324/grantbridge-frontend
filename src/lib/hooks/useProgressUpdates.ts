import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type WeeklyProgressPayload } from '../api/live-api';

export function useSubmitWeeklyProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WeeklyProgressPayload) => api.submitWeeklyProgress(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
      queryClient.invalidateQueries({ queryKey: ['pitch', variables.pitchId] });
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
    },
  });
}

export function useGetWeeklyProgress() {
  return useQuery({
    queryKey: ['weeklyProgress'],
    queryFn: () => api.getWeeklyProgress(),
  });
}
