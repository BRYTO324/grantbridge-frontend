/**
 * PaymentCallbackPage
 * Paystack redirects here after the user pays on their hosted page.
 * URL: /dashboard/funder/payment/callback?reference=GB-XXXX
 *
 * This page:
 * 1. Reads the `reference` from the URL query string
 * 2. Calls POST /payments/verify/ to confirm with Paystack
 * 3. Shows success or failure and redirects to the project
 */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import { fetchApi } from "../../lib/api/api-client";
import { formatNaira } from "../../lib/format";

interface VerifyResponse {
  status: "success" | "failed";
  message: string;
  reference: string;
  amount: string;
  paidAt: string;
  transactionId?: string;
}

type PageState = "verifying" | "success" | "failed" | "no-reference";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  const [state, setState] = useState<PageState>(reference ? "verifying" : "no-reference");
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!reference) return;

    fetchApi<VerifyResponse>("/payments/verify/", {
      method: "POST",
      body: JSON.stringify({ reference }),
    })
      .then((data) => {
        setResult(data);
        setState(data.status === "success" ? "success" : "failed");
      })
      .catch((err) => {
        setError(err.message || "Verification failed.");
        setState("failed");
      });
  }, [reference]);

  // Auto-redirect to dashboard after success
  useEffect(() => {
    if (state === "success") {
      const timer = setTimeout(() => navigate("/dashboard/funder"), 5000);
      return () => clearTimeout(timer);
    }
  }, [state, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-xl border border-slate-100 p-10 max-w-md w-full text-center"
      >
        {/* Verifying */}
        {state === "verifying" && (
          <>
            <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={36} className="text-brand-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
              Verifying Payment
            </h2>
            <p className="text-sm text-slate-500">
              Please wait while we confirm your payment with Paystack...
            </p>
            <p className="text-xs text-slate-400 mt-3 font-mono">{reference}</p>
          </>
        )}

        {/* Success */}
        {state === "success" && result && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
              className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 size={40} className="text-emerald-500" />
            </motion.div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full mb-4">
              <span className="text-xs font-semibold text-emerald-700">Payment Confirmed</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-2">
              Payment Successful! 🎉
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Your funding has been confirmed. The entrepreneur will be notified.
            </p>

            <div className="bg-slate-50 rounded-2xl p-5 text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Amount Paid</span>
                <span className="font-semibold text-slate-900">
                  {formatNaira(parseFloat(result.amount))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Reference</span>
                <span className="font-mono text-xs text-slate-700">{result.reference}</span>
              </div>
              {result.transactionId && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="font-mono text-xs text-slate-700">{result.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date</span>
                <span className="text-slate-700">
                  {new Date(result.paidAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Redirecting to dashboard in 5 seconds...
            </p>
            <Link
              to="/dashboard/funder"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-sm transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {/* Failed */}
        {(state === "failed" || state === "no-reference") && (
          <>
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={40} className="text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
              {state === "no-reference" ? "Invalid Payment Link" : "Payment Failed"}
            </h2>
            <p className="text-sm text-slate-500 mb-2">
              {state === "no-reference"
                ? "No payment reference found. Please try again from the project page."
                : error || "Your payment could not be verified. Please contact support if you were charged."}
            </p>
            {reference && (
              <p className="text-xs text-slate-400 font-mono mb-6">{reference}</p>
            )}
            <Link
              to="/dashboard/funder/discover"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Discover
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
