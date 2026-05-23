import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Lightbulb, Eye, Heart, MapPin,
  MoreHorizontal, LayoutGrid, List, Edit, Trash2, ExternalLink,
} from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useUserPitches, useDeletePitch } from "../../lib/hooks/usePitches";
import { formatNaira } from "../../lib/format";
import Button from "../../components/ui/Button";
import type { PitchCard } from "../../lib/store";

const statusColors: Record<string, { bg: string; text: string; dot: string }> =
  {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    "under review": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    draft: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    funded: { bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500" },
  };

const stageLabels: Record<string, string> = {
  idea: "Idea",
  mvp: "MVP",
  growth: "Growth",
  scale: "Scale",
};

const gradients = [
  "from-brand-400 to-emerald-500",
  "from-blue-400 to-cyan-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-teal-400 to-cyan-500",
];

export default function MyProjectsPage() {
  const { user } = useAppStore();
  const navigate = useNavigate();
  const { data: pitches = [], isLoading } = useUserPitches(user?.id || "");
  const deletePitch = useDeletePitch();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterStatus, setFilterStatus] = useState("All");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // No slice — show ALL user pitches
  const filtered = pitches.filter((p: PitchCard) => {
    const status = p.fundingStatus === "in_review" ? "under review" : p.fundingStatus === "open" ? "active" : p.fundingStatus;
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "All" || status === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  const handleDelete = (pitchId: string) => {
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    setDeletingId(pitchId);
    deletePitch.mutate(pitchId, {
      onSettled: () => setDeletingId(null),
    });
    setOpenMenu(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">
            My Projects
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {pitches.length} projects ·{" "}
            {pitches.filter((p: PitchCard) => p.fundingStatus === "open").length}{" "}
            active
          </p>
        </div>
        <Link to="/dashboard/entrepreneur/projects/new">
          <Button variant="primary" size="md" icon={<Plus size={16} />}>
            Create New Project
          </Button>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {["All", "Active", "Under Review", "Draft", "Funded"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === s
                    ? "bg-brand-500 text-white"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all"
              />
            </div>
            <div className="flex items-center gap-1 bg-slate-50 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "grid" ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === "list" ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <Lightbulb size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 font-[Outfit]">
            No projects found
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your filters or create a new project
          </p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          {viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((pitch: PitchCard, i: number) => {
                const status = pitch.fundingStatus === "in_review" ? "under review" : pitch.fundingStatus === "open" ? "active" : pitch.fundingStatus;
                const sc = statusColors[status] || statusColors["draft"];
                return (
                  <motion.div
                    key={pitch.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:shadow-slate-100/80 transition-all group cursor-pointer"
                  >
                    <div
                      className={`h-32 bg-linear-to-br ${gradients[i % gradients.length]} relative`}
                    >
                      <div className="absolute inset-0 bg-black/10" />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${sc.bg} ${sc.text} border border-white/20`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                          <Lightbulb size={20} className="text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-sm font-semibold text-slate-800 mb-1 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {pitch.title.split("—")[0].trim()}
                      </h3>
                      <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                        <MapPin size={11} /> {pitch.location} ·{" "}
                        {stageLabels[pitch.stage]}
                      </p>
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs text-slate-400">
                              Amount Needed
                            </p>
                            <p className="text-base font-bold text-slate-800">
                              {formatNaira(pitch.amountNeeded)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${sc.bg} ${sc.text}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                            />
                            {pitch.fundingStatus === "open"
                              ? "Open"
                              : pitch.fundingStatus === "funded"
                                ? "Funded"
                                : pitch.fundingStatus === "in_review"
                                  ? "In Review"
                                  : "Closed"}
                          </span>
                        </div>
                        {pitch.fundedBy ? (
                          <div className="bg-brand-50 rounded-lg p-2 border border-brand-100">
                            <p className="text-xs text-brand-600 font-medium">
                              ✓ Funded by {pitch.fundedBy.funderName}
                            </p>
                          </div>
                        ) : pitch.offers?.length ? (
                          <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                            <p className="text-xs text-amber-700 font-medium">
                              {pitch.offers.length} funding offer(s) pending
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {pitch.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart size={12} /> {pitch.likes}
                          </span>
                        </div>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenu(
                                openMenu === pitch.id ? null : pitch.id,
                              );
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <MoreHorizontal size={16} />
                          </button>
                          {openMenu === pitch.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10">
                              <button
                                onClick={() => { navigate(`/dashboard/entrepreneur/projects/edit/${pitch.id}`); setOpenMenu(null); }}
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                                <Edit size={13} /> Edit
                              </button>
                              <Link to={`/dashboard/funder/project/${pitch.id}`} target="_blank"
                                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                                <ExternalLink size={13} /> View Public
                              </Link>
                              <button
                                onClick={() => handleDelete(pitch.id)}
                                disabled={deletingId === pitch.id}
                                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer disabled:opacity-50">
                                <Trash2 size={13} /> {deletingId === pitch.id ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((pitch: PitchCard, i: number) => {
                const status = pitch.fundingStatus === "in_review" ? "under review" : pitch.fundingStatus === "open" ? "active" : pitch.fundingStatus;
                const sc = statusColors[status] || statusColors["draft"];
                return (
                  <motion.div
                    key={pitch.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md hover:shadow-slate-100/80 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-16 h-16 rounded-xl bg-linear-to-br ${gradients[i % gradients.length]} flex items-center justify-center shrink-0`}
                      >
                        <Lightbulb size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h3 className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                            {pitch.title.split("—")[0].trim()}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${sc.bg} ${sc.text} shrink-0`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                            />
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2">
                          {pitch.category} · {pitch.location} ·{" "}
                          {stageLabels[pitch.stage]}
                        </p>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-slate-400">
                              Amount Needed
                            </p>
                            <p className="text-sm font-bold text-slate-800">
                              {formatNaira(pitch.amountNeeded)}
                            </p>
                          </div>
                          <div className="flex-1">
                            {pitch.fundedBy ? (
                              <div className="bg-brand-50 rounded-lg p-2 border border-brand-100">
                                <p className="text-xs text-brand-600 font-medium">
                                  ✓ Funded by {pitch.fundedBy.funderName}
                                </p>
                              </div>
                            ) : pitch.offers?.length ? (
                              <div className="bg-amber-50 rounded-lg p-2 border border-amber-100">
                                <p className="text-xs text-amber-700 font-medium">
                                  {pitch.offers.length} offer(s) pending
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">
                                Seeking funding
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <Eye size={12} /> {pitch.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart size={12} /> {pitch.likes}
                            </span>
                          </div>
                          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
