import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lightbulb,
  MapPin,
  Heart,
  Eye,
  Bookmark,
  BadgeCheck,
} from "lucide-react";
import type { PitchCard } from "../../lib/store";
import { formatNaira } from "../../lib/format";

const stageColors: Record<string, string> = {
  idea: "bg-blue-100 text-blue-700",
  mvp: "bg-amber-100 text-amber-700",
  growth: "bg-brand-100 text-brand-700",
  scale: "bg-purple-100 text-purple-700",
};

const fundingStatusConfig = {
  open: {
    label: "Open for Funding",
    color: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  funded: {
    label: "Fully Funded",
    color: "bg-brand-100 text-brand-700",
    dot: "bg-brand-500",
  },
  in_review: {
    label: "Under Review",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  closed: {
    label: "Closed",
    color: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
};

const gradients = [
  "from-brand-400 to-emerald-500",
  "from-blue-400 to-cyan-500",
  "from-purple-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-teal-400 to-cyan-500",
  "from-indigo-400 to-blue-500",
  "from-emerald-400 to-green-500",
];

interface PitchGridCardProps {
  pitch: PitchCard;
  index: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

export default function PitchGridCard({
  pitch,
  index,
  isLiked,
  isBookmarked,
  onLike,
  onBookmark,
}: PitchGridCardProps) {
  const statusConfig = fundingStatusConfig[pitch.fundingStatus];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <Link
        to={`/dashboard/funder/project/${pitch.id}`}
        className=" flex-1 flex flex-col"
      >
        <div
          className={`h-40 relative p-5 bg-cover bg-center ${!pitch.image && !pitch.media?.[0] ? `bg-linear-to-br ${gradients[index % gradients.length]}` : ""}`}
          style={
            pitch.image ||
            (pitch.media?.[0] && !pitch.media[0].startsWith("data:video"))
              ? { backgroundImage: `url(${pitch.image || pitch.media?.[0]})` }
              : undefined
          }
        >
          {/* Overlay for better text readability if image exists */}
          {(pitch.image || pitch.media?.[0]) && (
            <div className="absolute inset-0 bg-black/30" />
          )}

          {!pitch.image && !pitch.media?.[0] && (
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #fff 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            />
          )}

          <div className="relative flex items-start justify-between z-10">
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${stageColors[pitch.stage]} backdrop-blur-sm`}
            >
              {pitch.stage.toUpperCase()}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onBookmark();
                }}
                className={`p-1.5 rounded-lg backdrop-blur-sm transition-all cursor-pointer ${isBookmarked ? "bg-white text-amber-500" : "bg-white/20 text-white hover:bg-white/30"}`}
              >
                <Bookmark
                  size={14}
                  fill={isBookmarked ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {!pitch.image && !pitch.media?.[0] && (
            <div className="absolute bottom-4 left-5 z-10">
              <Lightbulb size={28} className="text-white/80" />
            </div>
          )}
        </div>

        <div className="p-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
              {pitch.category}
            </span>
            {pitch.verified && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-brand-600">
                <BadgeCheck size={12} className="text-brand-500" /> Verified
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-800 font-[Outfit] mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
            {pitch.title}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
            {pitch.description}
          </p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">
                  Funding Required
                </p>
                <p className="font-bold text-lg text-slate-800">
                  {formatNaira(pitch.amountNeeded)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                />
                {statusConfig.label}
              </span>
            </div>
            {pitch.fundedBy && (
              <div className="bg-brand-50 rounded-lg p-2.5 border border-brand-100">
                <p className="text-xs text-brand-600 font-medium mb-0.5">
                  ✓ Funded by
                </p>
                <p className="text-xs font-semibold text-brand-700">
                  {pitch.fundedBy.funderName}
                </p>
                <p className="text-xs text-brand-500">
                  {pitch.fundedBy.funderCompany}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={12} />
              <span>{pitch.location}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Eye size={13} /> {pitch.views}
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onLike();
                }}
                className={`flex items-center gap-1 text-xs transition-colors cursor-pointer ${isLiked ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
              >
                <Heart size={13} fill={isLiked ? "currentColor" : "none"} />{" "}
                {pitch.likes}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
