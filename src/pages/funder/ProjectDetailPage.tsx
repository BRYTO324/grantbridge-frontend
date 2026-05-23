/**
 * ProjectDetailPage — fully real, Paystack-integrated.
 * All data from backend. Payment via Paystack hosted page.
 */
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Heart, Share2, Bookmark, BadgeCheck, MapPin, Calendar,
  Eye, Users, ChevronLeft, ChevronRight, DollarSign, Target, Clock,
  Globe, Building2, Briefcase, CheckCircle2, Copy, X,
  ShieldCheck, CreditCard, Sparkles, Lock, ExternalLink,
  Loader2, AlertCircle,
} from "lucide-react";
import { usePitch } from "../../lib/hooks/usePitches";
import { useLikePitch, useBookmarkPitch } from "../../lib/hooks/usePitches";
import { useInitializePayment } from "../../lib/hooks/usePayments";
import { useAppStore } from "../../lib/store";
import { formatNaira } from "../../lib/format";
import Button from "../../components/ui/Button";

const stageLabels: Record<string, string> = {
  idea: "Idea Stage", mvp: "MVP Stage", growth: "Growth Stage", scale: "Scale Stage",
};
const stageColors: Record<string, string> = {
  idea: "bg-blue-100 text-blue-700 border-blue-200",
  mvp: "bg-amber-100 text-amber-700 border-amber-200",
  growth: "bg-brand-100 text-brand-700 border-brand-200",
  scale: "bg-purple-100 text-purple-700 border-purple-200",
};

type FundStep = "closed" | "amount" | "redirecting";

const PLATFORM_FEE_RATE = 0.015;

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppStore();
  const { data: pitch, isLoading } = usePitch(id || "");
  const likePitch = useLikePitch();
  const bookmarkPitch = useBookmarkPitch();
  const initPayment = useInitializePayment();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fundStep, setFundStep] = useState<FundStep>("closed");
  const [paymentError, setPaymentError] = useState("");

  // Sync like/bookmark state from pitch data
  useEffect(() => {
    if (pitch) {
      setIsLiked(pitch.likedByMe ?? false);
      setIsSaved(pitch.bookmarkedByMe ?? false);
    }
  }, [pitch]);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  const handleLike = () => {
    if (!pitch) return;
    setIsLiked((v) => !v);
    likePitch.mutate(pitch.id);
  };

  const handleBookmark = () => {
    if (!pitch) return;
    setIsSaved((v) => !v);
    bookmarkPitch.mutate(pitch.id);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Real Paystack payment — initialize and redirect
  const handlePayWithPaystack = () => {
    if (!pitch || !user) return;
    setPaymentError("");
    const amount = pitch.amountNeeded;
    initPayment.mutate(
      { pitchId: pitch.id, amount: Number(amount) },
      {
        onSuccess: (data) => {
          // Redirect to Paystack hosted payment page
          window.location.href = data.authorizationUrl;
        },
        onError: (err) => {
          setPaymentError(err.message || "Payment initialization failed. Please try again.");
          setFundStep("amount");
        },
      },
    );
    setFundStep("redirecting");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700 font-[Outfit]">Project not found</p>
          <button onClick={() => navigate(-1)} className="mt-3 text-sm text-brand-600 hover:underline cursor-pointer">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const isFunded = pitch.fundingStatus === "funded";
  const isOpen = pitch.fundingStatus === "open";
  const fee = Number(pitch.amountNeeded) * PLATFORM_FEE_RATE;
  const total = Number(pitch.amountNeeded) + fee;

  // Build media items from real pitch data
  const mediaItems = pitch.media && pitch.media.length > 0
    ? pitch.media.map((url: string, i: number) => ({
        type: url.includes(".mp4") || url.includes(".webm") ? "video" as const : "image" as const,
        src: url,
        label: i === 0 ? "Main" : `Media ${i + 1}`,
      }))
    : pitch.imageUrl
    ? [{ type: "image" as const, src: pitch.imageUrl, label: "Project Image" }]
    : [{ type: "image" as const, src: `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.title)}&size=800&background=10b981&color=fff`, label: "Project" }];

  const avatarSrc = pitch.entrepreneurAvatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.entrepreneurName || "E")}&background=10b981&color=fff&size=128`;


  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8">
        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 mb-5 cursor-pointer transition-colors">
          <ArrowLeft size={16} /> Back to Discover
        </motion.button>

        {/* CAROUSEL + SIDEBAR */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">
          {/* Carousel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }} className="lg:col-span-3">
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video group">
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                  {mediaItems[currentSlide].type === "video" ? (
                    <video src={mediaItems[currentSlide].src} className="w-full h-full object-cover" controls />
                  ) : (
                    <img src={mediaItems[currentSlide].src} alt={mediaItems[currentSlide].label}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.title)}&size=800&background=10b981&color=fff`; }} />
                  )}
                </motion.div>
              </AnimatePresence>
              {mediaItems.length > 1 && (
                <>
                  <button onClick={() => setCurrentSlide((p) => (p - 1 + mediaItems.length) % mediaItems.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <ChevronLeft size={18} className="text-slate-700" />
                  </button>
                  <button onClick={() => setCurrentSlide((p) => (p + 1) % mediaItems.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <ChevronRight size={18} className="text-slate-700" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {mediaItems.map((_, i) => (
                      <button key={i} onClick={() => setCurrentSlide(i)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${i === currentSlide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                    ))}
                  </div>
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                    {currentSlide + 1} / {mediaItems.length}
                  </div>
                </>
              )}
            </div>
            {mediaItems.length > 1 && (
              <div className="flex gap-2 mt-3">
                {mediaItems.map((item, i) => (
                  <button key={i} onClick={() => setCurrentSlide(i)}
                    className={`relative flex-1 aspect-video rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === currentSlide ? "border-brand-500 ring-1 ring-brand-200" : "border-transparent opacity-60 hover:opacity-90"}`}>
                    <img src={item.src} alt={item.label} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.title)}&size=200&background=10b981&color=fff`; }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Funding Sidebar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }} className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 sticky top-20">
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-2xl font-bold text-slate-900 font-[Outfit]">
                    {formatNaira(pitch.amountNeeded)}
                  </p>
                  <p className="text-[12px] text-slate-400">Funding Required</p>
                </div>
                {isFunded ? (
                  <div className="bg-brand-50 rounded-xl p-4 border border-brand-100">
                    <p className="text-[11px] text-brand-600 font-medium mb-1">✓ Fully Funded</p>
                    {pitch.fundedBy && (
                      <>
                        <p className="text-[13px] font-semibold text-brand-700">{pitch.fundedBy.funderName}</p>
                        <p className="text-[11px] text-brand-500">{pitch.fundedBy.funderCompany}</p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                    <p className="text-[13px] font-semibold text-emerald-700">✓ Open for Funding</p>
                    <p className="text-[11px] text-emerald-600">Seeking exact amount</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: "Views", value: pitch.views.toLocaleString(), icon: Eye },
                  { label: "Offers", value: (pitch.offers?.length || 0).toString(), icon: Target },
                  { label: "Likes", value: pitch.likes.toString(), icon: Users },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-slate-50 rounded-xl py-3 px-2">
                    <s.icon size={15} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-[14px] font-bold text-slate-800 font-[Outfit]">{s.value}</p>
                    <p className="text-[10px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 mb-5">
                <Button variant="primary" size="lg" fullWidth icon={<DollarSign size={17} />}
                  onClick={() => setFundStep("amount")} disabled={isFunded || !isOpen}>
                  {isFunded ? "Already Funded" : isOpen ? "Fund This Project" : "Not Available"}
                </Button>
                <Button variant="outline" size="md" fullWidth icon={<Share2 size={16} />}
                  onClick={() => setShowShareModal(true)}>
                  Share Project
                </Button>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button onClick={handleLike}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${isLiked ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                  <Heart size={14} fill={isLiked ? "currentColor" : "none"} /> {isLiked ? "Liked" : "Like"}
                </button>
                <button onClick={handleBookmark}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${isSaved ? "bg-amber-50 text-amber-600" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
                  <Bookmark size={14} fill={isSaved ? "currentColor" : "none"} /> {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>


        {/* PROJECT DETAILS */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Title & About */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {pitch.verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-100">
                    <BadgeCheck size={12} /> Verified
                  </span>
                )}
                <span className="px-2.5 py-1 text-[11px] font-semibold bg-brand-50 text-brand-600 rounded-full">{pitch.category}</span>
                <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                  <MapPin size={10} /> {pitch.location}
                </span>
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${stageColors[pitch.stage]}`}>
                  {stageLabels[pitch.stage]}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-[Outfit] tracking-tight mb-2">{pitch.title}</h1>
              <div className="flex items-center gap-4 text-[12px] text-slate-400 mb-5">
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {new Date(pitch.createdAt).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1"><Eye size={12} /> {pitch.views.toLocaleString()} views</span>
                <span className="flex items-center gap-1"><Heart size={12} /> {pitch.likes} likes</span>
              </div>
              {pitch.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {pitch.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1 text-[11px] font-medium bg-slate-50 text-slate-600 rounded-lg border border-slate-100">{tag}</span>
                  ))}
                </div>
              )}
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-3">About This Project</h2>
              <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-line">{pitch.description}</div>
            </motion.div>

            {/* Funding Offers */}
            {pitch.offers && pitch.offers.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={18} className="text-brand-500" />
                  <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit]">
                    Funding Offers ({pitch.offers.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {pitch.offers.map((offer) => (
                    <div key={offer.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                      offer.status === "accepted" ? "bg-emerald-50 border-emerald-100" :
                      offer.status === "rejected" ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100"
                    }`}>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800">{offer.funderName}</p>
                        <p className="text-[11px] text-slate-500">{offer.funderCompany}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-slate-900">{formatNaira(offer.amount)}</p>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          offer.status === "accepted" ? "bg-emerald-100 text-emerald-700" :
                          offer.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>{offer.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Entrepreneur */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-4">About the Entrepreneur</h2>
              <div className="flex items-center gap-3 mb-4">
                <img src={avatarSrc} alt={pitch.entrepreneurName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-100"
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(pitch.entrepreneurName || "E")}&background=10b981&color=fff&size=128`; }} />
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14px] font-semibold text-slate-800">{pitch.entrepreneurName}</p>
                    {pitch.verified && <BadgeCheck size={14} className="text-brand-500" />}
                  </div>
                  <p className="text-[12px] text-slate-500">{pitch.companyName}</p>
                  {pitch.location && (
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {pitch.location}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2.5 mb-4">
                {[
                  { icon: Building2, label: "Company", value: pitch.companyName },
                  { icon: Briefcase, label: "Industry", value: pitch.category },
                  { icon: Globe, label: "Stage", value: stageLabels[pitch.stage] },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 text-[12px] text-slate-400">
                      <item.icon size={13} /> {item.label}
                    </div>
                    <span className="text-[12px] font-medium text-slate-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Verification */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-4">Verification & Trust</h2>
              <div className="space-y-3">
                {[
                  { label: "Project Submitted", desc: "Submitted by entrepreneur", done: true },
                  { label: "Identity Verified", desc: "Entrepreneur KYC status", done: pitch.verified },
                  { label: "Admin Reviewed", desc: "Reviewed by GrantBridge team", done: pitch.verificationStatus === "approved" },
                  { label: "Open for Funding", desc: "Accepting funding offers", done: isOpen || isFunded },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    {item.done
                      ? <CheckCircle2 size={16} className="text-brand-500 mt-0.5 shrink-0" />
                      : <Clock size={16} className="text-slate-300 mt-0.5 shrink-0" />}
                    <div>
                      <p className={`text-[12px] font-medium ${item.done ? "text-slate-700" : "text-slate-400"}`}>{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-2">Discover More Projects</h2>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-4">Browse other verified projects in the marketplace.</p>
              <Link to="/dashboard/funder/discover"
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-600 hover:text-brand-700">
                Explore marketplace <ExternalLink size={13} />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>


      {/* PAYMENT MODAL */}
      <AnimatePresence>
        {fundStep !== "closed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget && fundStep !== "redirecting") setFundStep("closed"); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

              {/* Amount Step */}
              {fundStep === "amount" && (
                <div className="p-7">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-[Outfit]">Fund This Project</h3>
                      <p className="text-sm text-slate-500 mt-0.5">Secure payment via Paystack</p>
                    </div>
                    <button onClick={() => setFundStep("closed")} className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
                      <X size={18} className="text-slate-500" />
                    </button>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 mb-5">
                    <p className="text-xs text-slate-500 mb-1">Project</p>
                    <p className="text-sm font-semibold text-slate-800 mb-4">{pitch.title}</p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Funding Amount</span>
                        <span className="font-semibold text-slate-900">{formatNaira(pitch.amountNeeded)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Platform Fee (1.5%)</span>
                        <span className="font-semibold text-slate-900">{formatNaira(fee)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2.5 flex justify-between text-sm">
                        <span className="font-semibold text-slate-700">Total</span>
                        <span className="font-bold text-slate-900 text-base">{formatNaira(total)}</span>
                      </div>
                    </div>
                  </div>

                  {paymentError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{paymentError}</p>
                    </div>
                  )}

                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-3 mb-5 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-brand-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-brand-700">
                      You'll be redirected to Paystack's secure payment page. Your card details are never stored on GrantBridge.
                    </p>
                  </div>

                  <button onClick={handlePayWithPaystack}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-semibold text-sm transition-colors cursor-pointer">
                    <CreditCard size={18} />
                    Pay {formatNaira(total)} with Paystack
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
                    <Lock size={11} /> Secured by Paystack
                  </p>
                </div>
              )}

              {/* Redirecting Step */}
              {fundStep === "redirecting" && (
                <div className="p-10 text-center">
                  <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Loader2 size={36} className="text-brand-500 animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-[Outfit] mb-2">Redirecting to Paystack</h3>
                  <p className="text-sm text-slate-500">Please wait while we prepare your secure payment page...</p>
                  <div className="flex items-center justify-center gap-1.5 mt-4">
                    <Sparkles size={14} className="text-brand-500" />
                    <span className="text-xs text-brand-600 font-medium">Secured by Paystack</span>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHARE MODAL */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowShareModal(false); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-slate-900 font-[Outfit]">Share Project</h3>
                <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer">
                  <X size={18} className="text-slate-500" />
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-3 mb-4">
                <p className="flex-1 text-xs text-slate-600 truncate">{window.location.href}</p>
                <button onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 text-white rounded-lg text-xs font-medium hover:bg-brand-600 transition-colors cursor-pointer shrink-0">
                  <Copy size={12} /> {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-slate-400 text-center">Share this project with potential funders</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
