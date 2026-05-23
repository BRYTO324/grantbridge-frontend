/**
 * Payment hooks — Paystack integration.
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import { fetchApi } from "../api/api-client";

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
  status: "success" | "failed";
  message: string;
  reference: string;
  amount: string;
  paidAt: string;
  transactionId?: string;
}

export interface PaymentRecord {
  id: string;
  funderName: string;
  pitchTitle: string;
  amount: string;
  platformFee: string;
  paystackReference: string;
  status: "pending" | "success" | "failed";
  paidAt: string | null;
  createdAt: string;
}

/** Initialize a Paystack transaction — returns the authorization URL to redirect to. */
export function useInitializePayment() {
  return useMutation({
    mutationFn: (payload: InitializePaymentPayload) =>
      fetchApi<InitializePaymentResponse>("/payments/initialize/", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}

/** Verify a payment after the user returns from Paystack. */
export function useVerifyPayment() {
  return useMutation({
    mutationFn: (reference: string) =>
      fetchApi<VerifyPaymentResponse>("/payments/verify/", {
        method: "POST",
        body: JSON.stringify({ reference }),
      }),
  });
}

/** Get the current user's payment history. */
export function usePaymentHistory() {
  return useQuery({
    queryKey: ["paymentHistory"],
    queryFn: () =>
      fetchApi<{ count: number; results: PaymentRecord[] }>("/payments/history/"),
  });
}
