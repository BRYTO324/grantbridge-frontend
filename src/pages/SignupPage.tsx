import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, CheckCircle2, Clock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { useAuth } from "../lib/hooks/useAuth";
import type { UserRole } from "../lib/store";

type ModalType = "none" | "emailSent" | "emailVerified" | "linkExpired";

const emptySignupForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeTerms: false,
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup, isSigningUp, signupError } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<UserRole>("entrepreneur");
  const [modal, setModal] = useState<ModalType>("none");
  const [form, setForm] = useState(emptySignupForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setForm(emptySignupForm);
    setErrors({});
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      errs.password = "Choose a stronger password (must contain uppercase, lowercase, and a number)";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.agreeTerms) errs.agreeTerms = "You must agree to the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    signup(
      {
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        role: selectedRole,
      },
      {
        onSuccess: () => {
          setModal("emailSent");
        },
        onError: (error) => {
          setErrors({
            email:
              error instanceof Error
                ? error.message
                : "Unable to create account",
          });
        },
      },
    );
  };

  const handleEmailVerified = () => {
    setModal("emailVerified");
  };

  const handleContinueToDashboard = () => {
    navigate("/dashboard");
  };

  // const handleShowExpired = () => {
  //   setModal("linkExpired");
  // };

  const isEntrepreneur = selectedRole === "entrepreneur";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 lg:flex">
      {/* Left panel - FIXED */}
      <div className="hidden lg:flex lg:w-1/3 lg:fixed lg:inset-y-0 lg:left-0 bg-linear-to-br from-brand-500 via-emerald-600 to-teal-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center gap-12 p-12">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-12">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-[Outfit]">
                  G
                </span>
              </div>
              <span className="text-xl font-bold text-white font-[Outfit] tracking-tight">
                GrantBridge
              </span>
            </Link>

            <div className="mb-8">
              <h2 className="text-4xl font-bold text-white font-[Outfit] leading-tight mb-4">
                {isEntrepreneur
                  ? "Turn Your Vision Into Reality"
                  : "Discover the Next Big Opportunity"}
              </h2>
              <p className="text-lg text-brand-100 leading-relaxed">
                {isEntrepreneur
                  ? "Join thousands of entrepreneurs who have found funding for their innovative ideas on GrantBridge."
                  : "Access a curated pipeline of verified startups and innovative projects ready for investment."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - Form - SCROLLABLE */}
      <div className="flex-1 lg:ml-[33.333333%] min-h-screen flex items-start justify-center p-6 sm:p-12 py-12 lg:py-16 overflow-y-auto">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 sm:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-linear-to-br from-brand-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl font-[Outfit]">
                    G
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 font-[Outfit]">
                  Create your account
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  {isEntrepreneur
                    ? "Start pitching your ideas to the world"
                    : "Start discovering investment opportunities"}
                </p>
              </div>

              {/* Role Selection */}
              <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-6">
                <button
                  onClick={() => handleRoleChange("entrepreneur")}
                  className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all ${
                    selectedRole === "entrepreneur"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Entrepreneur
                </button>
                <button
                  onClick={() => handleRoleChange("funder")}
                  className={`flex-1 py-3 text-center text-sm font-semibold rounded-xl transition-all ${
                    selectedRole === "funder"
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Funder
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<User size={18} />}
                  value={form.fullName}
                  onChange={(e) => updateField("fullName", e.target.value)}
                  error={errors.fullName}
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail size={18} />}
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  icon={<Lock size={18} />}
                  value={form.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  error={errors.password}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter your password"
                  icon={<Lock size={18} />}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  error={errors.confirmPassword}
                />

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.agreeTerms}
                    onChange={(e) =>
                      updateField("agreeTerms", e.target.checked)
                    }
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                  />
                  <span className="text-xs text-slate-500">
                    I agree to the{" "}
                    <a href="#" className="text-brand-600 hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-brand-600 hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-red-500">{errors.agreeTerms}</p>
                )}

                {signupError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                    {signupError.message}
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={isSigningUp}
                >
                  {isSigningUp ? "Creating account..." : "Create Account"}
                </Button>
              </div>

              {/* Sign in link */}
              <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to={`/login/${selectedRole}`}
                  className="text-brand-600 font-semibold hover:text-brand-700"
                >
                  Log in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {/* Email Sent */}
      <Modal isOpen={modal === "emailSent"} onClose={() => setModal("none")}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Check Your Email
          </h3>
          <p className="text-sm text-slate-500 mb-2">
            We've sent a verification link to
          </p>
          <p className="text-sm font-semibold text-slate-700 mb-6">
            {form.email || "your@email.com"}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Click the link in the email to verify your account. The link expires
            in 24 hours.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleEmailVerified}
          >
            I've Verified My Email
          </Button>
          <button
            className="mt-4 text-sm text-brand-600 hover:underline cursor-pointer"
            onClick={() => {}}
          >
            Resend verification email
          </button>
        </div>
      </Modal>

      {/* Email Verified */}
      <Modal
        isOpen={modal === "emailVerified"}
        onClose={() => setModal("none")}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
            >
              <CheckCircle2 size={32} className="text-brand-600" />
            </motion.div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Email Verified!
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Your email has been successfully verified. You can now access your
            dashboard and verify your account.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinueToDashboard}
          >
            Continue to Dashboard
          </Button>
        </div>
      </Modal>

      {/* Link Expired */}
      <Modal isOpen={modal === "linkExpired"} onClose={() => setModal("none")}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Link Expired
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            The verification link has expired. Please request a new one to
            continue with your registration.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setModal("emailSent")}
          >
            Resend Verification Link
          </Button>
          <button
            className="mt-4 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
            onClick={() => setModal("none")}
          >
            Go back to signup
          </button>
        </div>
      </Modal>
    </div>
  );
}
