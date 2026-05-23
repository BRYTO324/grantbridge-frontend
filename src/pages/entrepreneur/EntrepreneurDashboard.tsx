import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plus, TrendingUp, MoreVertical, Search,
  Calendar, CheckCircle2, AlertCircle, X,
} from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useUserPitches } from "../../lib/hooks/usePitches";
import { formatNaira } from "../../lib/format";
import Button from "../../components/ui/Button";
import NotificationBell from "../../components/shared/NotificationBell";

export default function EntrepreneurDashboard() {
  const { user, updateUser } = useAppStore();
  const { data: pitches = [], isLoading } = useUserPitches(user?.id || "");
  const [showProfilePrompt, setShowProfilePrompt] = useState(
    !user?.profileCompleted,
  );

  const myPitches = pitches.slice(0, 5);
  const totalViews = myPitches.reduce((s, p) => s + p.views, 0);
  const fundedCount = myPitches.filter(
    (p) => p.fundingStatus === "funded",
  ).length;
  const totalFundingReceived = myPitches
    .filter((p) => p.fundedBy)
    .reduce((sum, p) => sum + (p.fundedBy?.fundedAmount || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500">
              Welcome back, {user?.fullName || "Entrepreneur"} 👋
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-64 pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <NotificationBell />
          </div>
        </div>

        {/* Verify Account Prompt */}
        {showProfilePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-linear-to-r from-brand-500 to-purple-600 rounded-2xl p-5 mb-8 flex items-start gap-4"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shrink-0">
              <AlertCircle size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white font-[Outfit] mb-1">
                Verify Your Account
              </h3>
              <p className="text-sm text-brand-100 mb-3">
                Verify your identity by uploading a valid ID (National ID,
                Driver's License, or Voter's Card) to increase your chances of
                getting funded.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="welcome"
                  onClick={() => {
                    updateUser({ profileCompleted: true });
                    setShowProfilePrompt(false);
                  }}
                  className="px-5 py-2.5 bg-white hover:bg-brand-50 text-brand-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Verify Account
                </Link>
                <button
                  onClick={() => {
                    updateUser({ profileCompleted: true });
                    setShowProfilePrompt(false);
                  }}
                  className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
              {myPitches.length}
            </h3>
            <p className="text-sm text-slate-500">Total Projects</p>
          </motion.div>

          {/* Under Review */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
              {myPitches.filter((p) => p.fundingStatus === "in_review").length}
            </h3>
            <p className="text-sm text-slate-500">Under Review</p>
          </motion.div>

          {/* Total Funding */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
              {formatNaira(totalFundingReceived)}
            </h3>
            <p className="text-sm text-slate-500">Total Funding Received</p>
          </motion.div>

          {/* Total Views */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
              {totalViews.toLocaleString()}
            </h3>
            <p className="text-sm text-slate-500">Total Views</p>
          </motion.div>

          {/* Funded Projects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-slate-200"
          >
            <h3 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
              {fundedCount}
            </h3>
            <p className="text-sm text-slate-500">Funded Projects</p>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Projects List - Takes 2 columns */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 font-[Outfit]">
                    Recent Projects
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {myPitches.length} active projects
                  </p>
                </div>
                <Link to="/dashboard/entrepreneur/projects">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {myPitches.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="text-slate-400" size={24} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-700 mb-2">
                      No projects yet
                    </h3>
                    <p className="text-sm text-slate-500 mb-4">
                      Create your first project to get started
                    </p>
                    <Link to="/dashboard/entrepreneur/projects">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<Plus size={16} />}
                      >
                        Create Project
                      </Button>
                    </Link>
                  </div>
                ) : (
                  myPitches.map((pitch, index) => {
                    const statusConfig = {
                      open: {
                        label: "Open",
                        color: "bg-emerald-50 text-emerald-700",
                        dot: "bg-emerald-500",
                      },
                      funded: {
                        label: "Funded",
                        color: "bg-blue-50 text-blue-700",
                        dot: "bg-blue-500",
                      },
                      in_review: {
                        label: "In Review",
                        color: "bg-amber-50 text-amber-700",
                        dot: "bg-amber-500",
                      },
                      closed: {
                        label: "Closed",
                        color: "bg-slate-100 text-slate-600",
                        dot: "bg-slate-400",
                      },
                    };
                    const status =
                      pitch.verificationStatus === "pending" ||
                      pitch.verificationStatus === "rejected"
                        ? {
                            label:
                              pitch.verificationStatus === "pending"
                                ? "Admin Review"
                                : "Rejected",
                            color:
                              pitch.verificationStatus === "pending"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700",
                            dot:
                              pitch.verificationStatus === "pending"
                                ? "bg-amber-500"
                                : "bg-red-500",
                          }
                        : statusConfig[pitch.fundingStatus];

                    return (
                      <div
                        key={pitch.id}
                        className="p-6 hover:bg-slate-50 transition-colors group cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-linear-to-br from-brand-400 to-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-lg">
                              {index + 1}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div className="flex-1">
                                <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                                  {pitch.title.split("—")[0].trim()}
                                </h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                  {pitch.category} • {pitch.location}
                                </p>
                              </div>
                              <button className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
                                <MoreVertical
                                  size={18}
                                  className="text-slate-400"
                                />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center gap-4">
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Amount Needed
                                  </p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {formatNaira(pitch.amountNeeded)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">
                                    Views
                                  </p>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {pitch.views}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full ${status.color}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${status.dot}`}
                                ></span>
                                {status.label}
                              </span>
                            </div>

                            {pitch.fundedBy && (
                              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                                <CheckCircle2 size={14} />
                                <span>
                                  Funded by {pitch.fundedBy.funderName}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-2xl border border-slate-200 p-6"
            >
              <h3 className="text-base font-semibold text-slate-900 font-[Outfit] mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/dashboard/entrepreneur/projects/new">
                  <button className="w-full flex items-center gap-3 p-3 bg-brand-50 hover:bg-brand-100 rounded-xl transition-colors group">
                    <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center">
                      <Plus className="text-white" size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900">
                        New Project
                      </p>
                      <p className="text-xs text-slate-500">
                        Create a new pitch
                      </p>
                    </div>
                  </button>
                </Link>

                <Link to="/dashboard/entrepreneur/progress">
                  <button className="w-full flex items-center gap-3 p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors group">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Calendar className="text-white" size={20} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-slate-900">
                        Weekly Update
                      </p>
                      <p className="text-xs text-slate-500">
                        Submit progress report
                      </p>
                    </div>
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
