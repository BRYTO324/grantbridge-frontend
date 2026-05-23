import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, KeyRound, AlertCircle } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useRequestPasswordReset } from "../../lib/hooks/useAuth";
import type { UserRole } from "../../lib/store";

export default function ForgotPasswordPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const userRole: UserRole = role === "funder" ? "funder" : "entrepreneur";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const requestReset = useRequestPasswordReset();

  const handleSubmit = () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email");
      return;
    }

    requestReset.mutate(email, {
      onSuccess: (data) => {
        setResetToken(data.resetToken || "");
        setSent(true);
      },
      onError: (err) => {
        setError(
          err instanceof Error ? err.message : "Failed to send reset email",
        );
      },
    });
  };

  const handleContinueToReset = () => {
    // In a real app, the user would click the link in their email
    // For demo purposes, we'll navigate with the token in the URL
    navigate(`/reset-password/${role}?token=${resetToken}`);
  };

  if (sent) {
    return (
      <AuthLayout role={userRole} variant="reset">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-100"
          >
            <Mail size={36} className="text-brand-500" />
          </motion.div>

          <h1 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Check Your Email
          </h1>
          <p className="text-sm text-slate-500 mb-1">
            We've sent a password reset link to
          </p>
          <p className="text-sm font-semibold text-slate-800 mb-6 bg-slate-50 inline-block px-4 py-1.5 rounded-lg">
            {email}
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">
              Click the link in the email to reset your password. The link will
              expire in{" "}
              <span className="font-semibold text-slate-800">1 hour</span>.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-start gap-2">
              <AlertCircle
                size={16}
                className="text-amber-600 mt-0.5 shrink-0"
              />
              <p className="text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">Demo Mode:</span> In a real
                application, you would click the link in your email. For demo
                purposes, click the button below to continue.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinueToReset}
          >
            Continue to Reset Password
          </Button>

          <div className="mt-4">
            <button
              onClick={() => setSent(false)}
              className="text-sm font-medium text-brand-600 hover:text-brand-700 cursor-pointer"
            >
              Try a different email
            </button>
          </div>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <Link
              to={`/login/${role}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft size={14} /> Back to login
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout role={userRole} variant="reset">
      <div className="lg:hidden flex items-center gap-2.5 mb-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25">
            <span className="text-white font-bold text-lg font-[Outfit]">
              G
            </span>
          </div>
          <span className="text-xl font-bold text-slate-800 font-[Outfit] tracking-tight">
            GrantBridge
          </span>
        </Link>
      </div>

      <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center mb-5 border border-brand-100">
        <KeyRound size={18} className="text-brand-500" />
      </div>

      <h1 className="text-xl font-bold text-slate-900 font-[Outfit] mb-1">
        Forgot Password?
      </h1>
      <p className="text-sm text-slate-500 mb-6 leading-relaxed">
        No worries. Enter your email address and we'll send you a link to reset
        your password.
      </p>

      <div className="space-y-3.5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={<Mail size={17} />}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          error={error}
        />

        {requestReset.error && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>
              {requestReset.error instanceof Error
                ? requestReset.error.message
                : "An error occurred"}
            </span>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleSubmit}
          disabled={requestReset.isPending}
        >
          {requestReset.isPending ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center">
        <Link
          to={`/login/${role}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </AuthLayout>
  );
}
