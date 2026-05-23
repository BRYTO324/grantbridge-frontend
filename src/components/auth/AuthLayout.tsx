import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  role: "entrepreneur" | "funder";
  variant?: "signup" | "login" | "verify" | "success" | "error" | "reset";
}

const leftContent = {
  entrepreneur: {
    signup: {
      title: "Turn Your Vision\nInto Reality",
      subtitle:
        "Join thousands of entrepreneurs who have found funding for their innovative ideas on GrantBridge.",
    },
    login: {
      title: "Welcome Back,\nInnovator",
      subtitle:
        "Continue building your dream. Your pitches and connections are waiting.",
    },
    verify: {
      title: "Almost There!\nVerify Your Account",
      subtitle:
        "We need to confirm your identity to keep the platform safe for everyone.",
    },
    success: {
      title: "You're All Set!\nWelcome Aboard",
      subtitle:
        "Your account is ready. Start building your pitch and connect with funders today.",
    },
    error: {
      title: "Oops!\nSomething Went Wrong",
      subtitle: "Don't worry, we can fix this. Let's get you back on track.",
    },
    reset: {
      title: "Reset Your\nPassword",
      subtitle:
        "It happens to the best of us. Let's get you back into your account.",
    },
  },
  funder: {
    signup: {
      title: "Discover the Next\nBig Opportunity",
      subtitle:
        "Access a curated pipeline of verified startups and innovative projects ready for investment.",
    },
    login: {
      title: "Welcome Back,\nInvestor",
      subtitle:
        "New opportunities await. Check out the latest pitches from top entrepreneurs.",
    },
    verify: {
      title: "Verify Your\nInvestor Account",
      subtitle:
        "Verification ensures you access only legitimate, vetted projects.",
    },
    success: {
      title: "Welcome to\nGrantBridge!",
      subtitle:
        "Your investor account is ready. Start discovering high-potential projects.",
    },
    error: {
      title: "Oops!\nSomething Went Wrong",
      subtitle: "Don't worry, we can fix this. Let's get you back on track.",
    },
    reset: {
      title: "Reset Your\nPassword",
      subtitle:
        "It happens to the best of us. Let's get you back into your account.",
    },
  },
};

export default function AuthLayout({
  children,
  role,
  variant = "signup",
}: AuthLayoutProps) {
  const content = leftContent[role][variant];

  return (
    <div className="min-h-screen bg-white lg:flex">
      {/* Left Panel - FIXED */}
      <div className="hidden lg:flex lg:w-130 xl:w-130 lg:fixed lg:inset-y-0 lg:left-0 bg-linear-to-br from-brand-500 via-brand-600 to-emerald-700 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -left-16 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center gap-10 p-10 xl:p-12 w-full">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-12">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-[Outfit]">
                  G
                </span>
              </div>
              <span className="text-xl font-bold text-white font-[Outfit] tracking-tight">
                GrantBridge
              </span>
            </Link>

            <div className="mb-8">
              <h2 className="text-3xl xl:text-3xl font-bold text-white font-[Outfit] leading-tight whitespace-pre-line">
                {content.title}
              </h2>
              <p className="mt-4 text-sm text-brand-100/90 leading-relaxed max-w-sm">
                {content.subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - SCROLLABLE */}
      <div className="flex-1 lg:ml-130 xl:ml-130 min-h-screen flex items-center justify-center p-5 sm:p-8 lg:p-12 py-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-110"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
