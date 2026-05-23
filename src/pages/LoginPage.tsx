import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuth } from "../lib/hooks/useAuth";
import type { UserRole } from "../lib/store";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggingIn, loginError } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("entrepreneur");

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setForm({ email: "", password: "" });
    setErrors({});
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleLogin = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    login(
      { email: form.email, password: form.password, role: selectedRole },
      {
        onSuccess: () => {
          navigate("/dashboard");
        },
        onError: (error) => {
          setErrors({ email: error.message });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-100 lg:flex">
      {/* LEFT PANEL (Desktop only) - FIXED */}
      <div className="hidden lg:flex lg:w-1/3 lg:fixed lg:inset-y-0 lg:left-0 bg-linear-to-br from-brand-500 via-emerald-600 to-teal-700 overflow-hidden">
        {/* Background pattern */}
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

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          {/* Logo */}
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

          {/* Welcome text */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white font-[Outfit] leading-tight mb-4">
              Welcome Back
            </h2>
            <p className="text-lg text-brand-100 leading-relaxed">
              Connect, fund, and grow with Africa's leading startup ecosystem.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Always visible) - SCROLLABLE */}
      <div className="flex-1 lg:ml-[33.333333%] min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 lg:py-16 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 sm:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-linear-to-br from-brand-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl font-[Outfit]">
                  G
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 font-[Outfit]">
                Welcome Back
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                Welcome back! Please enter your details
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
                label="Email address"
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
                placeholder="Enter your password"
                icon={<Lock size={18} />}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                error={errors.password}
              />

              <div className="flex justify-end">
                <Link
                  to={`/forgot-password/${selectedRole}`}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">
                  {loginError.message}
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleLogin}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Logging in..." : "Log in"}
              </Button>
            </div>

            {/* Sign up link */}
            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to={`/signup/${selectedRole}`}
                className="text-brand-600 font-semibold hover:text-brand-700"
              >
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
