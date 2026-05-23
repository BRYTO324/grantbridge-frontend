import { useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, RefreshCw } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/ui/Button";
import type { UserRole } from "../../lib/store";
import type { AuthFlowState } from "../../types/navigation";

export default function VerifyEmailPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as AuthFlowState | null) || {};
  const userRole: UserRole = role === "funder" ? "funder" : "entrepreneur";
  const email = state.email || "your@email.com";
  const [resent, setResent] = useState(false);

  const handleVerified = () => {
    navigate(`/verify-phone/${role}`, { state: { ...state } });
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <AuthLayout role={userRole} variant="verify">
      <div className="text-center">
        {/* Animated envelope */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 200,
            delay: 0.1,
          }}
          className="w-12 h-12 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-100"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mail size={18} className="text-brand-500" />
          </motion.div>
        </motion.div>

        <h1 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
          Check Your Email
        </h1>
        <p className="text-sm text-slate-500 mb-1">
          We've sent a verification link to
        </p>
        <p className="text-sm font-semibold text-slate-800 mb-6 bg-slate-50 inline-block px-4 py-1.5 rounded-lg">
          {email}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-slate-600 leading-relaxed">
            Click the verification link in the email to confirm your account.
            The link will expire in{" "}
            <span className="font-semibold text-slate-800">24 hours</span>.
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Can't find the email? Check your spam or junk folder.
          </p>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleVerified}>
          I've Verified My Email
        </Button>

        <div className="mt-4 flex items-center justify-center gap-1">
          <button
            onClick={handleResend}
            disabled={resent}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 disabled:text-slate-400 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={13} className={resent ? "animate-spin" : ""} />
            {resent ? "Email sent!" : "Resend verification email"}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Wrong email?{" "}
            <Link
              to={`/signup/${role}`}
              className="text-brand-600 font-medium hover:underline"
            >
              Go back to signup
            </Link>
          </p>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-4">
            <button
              onClick={() => navigate(`/link-expired/${role}`, { state })}
              className="text-xs text-slate-300 hover:text-slate-400 cursor-pointer"
            >
              Show link expired state
            </button>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
