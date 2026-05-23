import type { FundingOffer, PitchCard } from '../store';
import { fetchApi } from './api-client';

export interface WeeklyProgressPayload {
  pitchId: string;
  weekEnding: string;
  summary: string;
  wins: string;
  blockers?: string;
  nextSteps: string;
  metrics?: Record<string, string>;
}

export interface PitchListResponse {
  count: number;
  page: number;
  pageSize: number;
  results: PitchCard[];
}

export interface InitializePaymentPayload {
  pitchId: string;
  offerId?: string | null;
  amount: number;
}

export interface InitializePaymentResponse {
  reference: string;
  authorizationUrl: string;
  accessCode: string;
  amount: string;
  platformFee: string;
  totalAmount: string;
  paystackPublicKey: string;
}

export interface VerifyPaymentResponse {
  status: 'success' | 'failed';
  message: string;
  reference: string;
  amount: string;
  paidAt: string;
  transactionId?: string;
}

export const api = {
  // ─── Pitches ──────────────────────────────────────────────────────────────

  getPitches: async (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetchApi<PitchListResponse>(`/pitches/${qs}`);
    // Return just the results array for backwards compatibility with existing hooks
    return res.results ?? (res as unknown as PitchCard[]);
  },

  getPitchById: async (id: string) =>
    fetchApi<PitchCard>(`/pitches/${encodeURIComponent(id)}/`),

  getUserPitches: async (userId: string) => {
    const res = await fetchApi<PitchListResponse>(
      `/pitches/?entrepreneurId=${encodeURIComponent(userId)}`
    );
    return res.results ?? (res as unknown as PitchCard[]);
  },

  createPitch: async (pitch: Partial<PitchCard>) =>
    fetchApi<PitchCard>('/pitches/', {
      method: 'POST',
      body: JSON.stringify(pitch),
    }),

  updatePitch: async (id: string, updates: Partial<PitchCard>) =>
    fetchApi<PitchCard>(`/pitches/${encodeURIComponent(id)}/`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deletePitch: async (id: string) =>
    fetchApi<{ success: boolean }>(`/pitches/${encodeURIComponent(id)}/`, {
      method: 'DELETE',
    }),

  likePitch: async (pitchId: string) =>
    fetchApi<PitchCard>(`/pitches/${encodeURIComponent(pitchId)}/like/`, {
      method: 'PATCH',
    }),

  bookmarkPitch: async (pitchId: string) =>
    fetchApi<PitchCard>(`/pitches/${encodeURIComponent(pitchId)}/bookmark/`, {
      method: 'PATCH',
    }),

  // ─── Offers ───────────────────────────────────────────────────────────────

  submitFundingOffer: async (
    pitchId: string,
    offer: Omit<FundingOffer, 'id' | 'createdAt'>,
  ) =>
    fetchApi<PitchCard>('/offers/', {
      method: 'POST',
      body: JSON.stringify({ pitchId, ...offer }),
    }),

  acceptFundingOffer: async (pitchId: string, offerId: string) =>
    fetchApi<PitchCard>(`/offers/${encodeURIComponent(offerId)}/`, {
      method: 'PUT',
      body: JSON.stringify({ pitchId, status: 'accepted' }),
    }),

  rejectFundingOffer: async (pitchId: string, offerId: string) =>
    fetchApi<PitchCard>(`/offers/${encodeURIComponent(offerId)}/`, {
      method: 'PUT',
      body: JSON.stringify({ pitchId, status: 'rejected' }),
    }),

  // ─── Progress ─────────────────────────────────────────────────────────────

  submitWeeklyProgress: async (payload: WeeklyProgressPayload) =>
    fetchApi('/progress/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getWeeklyProgress: async () => {
    const res = await fetchApi<{ count: number; results: WeeklyProgressPayload[] }>('/progress/');
    return res.results ?? (res as unknown as WeeklyProgressPayload[]);
  },

  // ─── Payments (Paystack) ──────────────────────────────────────────────────

  initializePayment: async (payload: InitializePaymentPayload) =>
    fetchApi<InitializePaymentResponse>('/payments/initialize/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyPayment: async (reference: string) =>
    fetchApi<VerifyPaymentResponse>('/payments/verify/', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    }),

  // ─── Verification ─────────────────────────────────────────────────────────

  submitVerification: async (formData: FormData) =>
    fetchApi<{ message: string; verificationStatus: string }>('/verification/submit/', {
      method: 'POST',
      body: formData,
    }),

  getVerificationStatus: async () =>
    fetchApi<{ verificationStatus: string; submittedAt: string | null }>('/verification/status/'),

  // ─── Media Upload ──────────────────────────────────────────────────────────

  uploadMedia: async (file: File): Promise<{ url: string; isVideo: boolean }> => {
    const fd = new FormData();
    fd.append('file', file);
    return fetchApi<{ url: string; isVideo: boolean }>('/pitches/upload-media/', {
      method: 'POST',
      body: fd,
    });
  },
};
