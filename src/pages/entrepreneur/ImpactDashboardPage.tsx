/**
 * ImpactDashboardPage — real data from weekly progress updates and pitches.
 * Metrics are derived from actual submitted progress data.
 */
import { motion } from "framer-motion";
import { ArrowUpRight, TrendingUp, Users, Target, BarChart2 } from "lucide-react";
import { useGetWeeklyProgress } from "../../lib/hooks/useProgressUpdates";
import { useUserPitches } from "../../lib/hooks/usePitches";
import { useAppStore } from "../../lib/store";
import { formatNaira } from "../../lib/format";

export default function ImpactDashboardPage() {
  const { user } = useAppStore();
  const { data: pitches = [] } = useUserPitches(user?.id || "");
  const { data: progressRaw } = useGetWeeklyProgress();

  // Handle both paginated and array responses
  const updates = (progressRaw as { results?: { pitchId: string; weekEnding: string; summary: string; wins: string; metrics?: Record<string, string> }[] })?.results
    ?? (Array.isArray(progressRaw) ? progressRaw : []);

  const userPitchIds = new Set(pitches.map((p) => p.id));
  const myUpdates = updates.filter((u) => userPitchIds.has(u.pitchId));

  // Real stats derived from actual data
  const totalViews = pitches.reduce((s, p) => s + p.views, 0);
  const totalLikes = pitches.reduce((s, p) => s + p.likes, 0);
  const fundedProjects = pitches.filter((p) => p.fundingStatus === "funded").length;
  const totalFunding = pitches
    .filter((p) => p.fundedBy)
    .reduce((s, p) => s + Number(p.fundedBy?.fundedAmount || 0), 0);

  const metrics = [
    { label: "Total Project Views", value: totalViews.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Total Likes", value: totalLikes.toLocaleString(), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Projects Funded", value: fundedProjects.toString(), icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Funding Received", value: totalFunding > 0 ? formatNaira(totalFunding) : "₦0", icon: BarChart2, color: "text-brand-600", bg: "bg-brand-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">
          Impact Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Track the real-world impact of your projects.
        </p>
      </div>

      {/* Real metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, i) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl border border-slate-100 p-5">
            <div className={`w-10 h-10 ${metric.bg} rounded-xl flex items-center justify-center mb-3`}>
              <metric.icon size={18} className={metric.color} />
            </div>
            <p className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">{metric.value}</p>
            <p className="text-sm text-slate-500">{metric.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projects summary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 font-[Outfit] mb-6">Project Status Overview</h2>
          {pitches.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No projects submitted yet.</p>
          ) : (
            <div className="space-y-4">
              {pitches.map((pitch, i) => {
                const statusColor = pitch.fundingStatus === "funded" ? "bg-brand-500"
                  : pitch.fundingStatus === "open" ? "bg-emerald-500"
                  : pitch.fundingStatus === "in_review" ? "bg-amber-500"
                  : "bg-slate-300";
                const statusLabel = pitch.fundingStatus === "funded" ? "Funded"
                  : pitch.fundingStatus === "open" ? "Open"
                  : pitch.fundingStatus === "in_review" ? "In Review"
                  : "Closed";
                return (
                  <motion.div key={pitch.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700 truncate max-w-[60%]">
                        {pitch.title.split("—")[0].trim()}
                      </span>
                      <span className="text-slate-500 text-xs">{statusLabel} · {pitch.views} views</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }}
                        animate={{ width: pitch.fundingStatus === "funded" ? "100%" : pitch.fundingStatus === "open" ? "40%" : "20%" }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                        className={`h-full ${statusColor} rounded-full`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent milestones from real weekly updates */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 font-[Outfit]">Recent Milestones</h2>
            <ArrowUpRight size={20} className="text-slate-400" />
          </div>
          <div className="space-y-4">
            {myUpdates.length > 0 ? (
              myUpdates.slice(0, 5).map((update, i) => {
                const pitch = pitches.find((p) => p.id === update.pitchId);
                return (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-12 text-xs text-slate-400 font-medium pt-1 shrink-0">
                      {new Date(update.weekEnding).toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-2">{update.wins}</p>
                      <p className="text-xs text-slate-500 mt-1">{pitch?.title?.split("—")[0].trim() || "Project Update"}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-slate-400">No weekly updates submitted yet.</p>
                <p className="text-xs text-slate-400 mt-1">Submit your first weekly progress report to see milestones here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
