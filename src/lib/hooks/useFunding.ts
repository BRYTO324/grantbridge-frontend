import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/live-api';
import type { FundingOffer } from '../store';

export function useSubmitFundingOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      pitchId, 
      offer 
    }: { 
      pitchId: string; 
      offer: Omit<FundingOffer, 'id' | 'createdAt'> 
    }) => api.submitFundingOffer(pitchId, offer),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pitch', variables.pitchId] });
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
    },
  });
}

export function useAcceptFundingOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pitchId, offerId }: { pitchId: string; offerId: string }) =>
      api.acceptFundingOffer(pitchId, offerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pitch', data.id] });
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
      queryClient.invalidateQueries({ queryKey: ['userPitches'] });
    },
  });
}

export function useRejectFundingOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pitchId, offerId }: { pitchId: string; offerId: string }) =>
      api.rejectFundingOffer(pitchId, offerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pitch', variables.pitchId] });
      queryClient.invalidateQueries({ queryKey: ['pitches'] });
    },
  });
}
