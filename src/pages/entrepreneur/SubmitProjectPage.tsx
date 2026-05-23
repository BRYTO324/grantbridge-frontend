import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CheckCircle2, FileText, Send, Sparkles, Wallet, Upload, X, Loader2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { useCreatePitch } from "../../lib/hooks/usePitches";
import { useAppStore } from "../../lib/store";
import { api } from "../../lib/api/live-api";

const categories = [
  "AgriTech",
  "Clean Energy",
  "EdTech",
  "Fashion & Textile",
  "FinTech",
  "HealthTech",
  "Logistics",
  "Other",
];
const stages = [
  { value: "idea", label: "Idea" },
  { value: "mvp", label: "MVP" },
  { value: "growth", label: "Growth" },
  { value: "scale", label: "Scale" },
] as const;

const initialForm = {
  title: "",
  category: "FinTech",
  stage: "idea" as "idea" | "mvp" | "growth" | "scale",
  location: "",
  companyName: "",
  description: "",
  problem: "",
  solution: "",
  amountNeeded: "",
  useOfFunds: "",
  timeline: "",
  milestones: "",
  tags: "",
  // media stores uploaded URLs (not base64)
  media: [] as string[],
};

const steps = [
  { label: "Project details", icon: FileText },
  { label: "Funding details", icon: Wallet },
  { label: "Review & submit", icon: CheckCircle2 },
];

export default function SubmitProjectPage() {
  const navigate = useNavigate();
  const { user } = useAppStore();
  const createPitch = useCreatePitch();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingMedia, setUploadingMedia] = useState(false);
  // Preview URLs for display (object URLs for local files before upload)
  const [mediaPreviews, setMediaPreviews] = useState<{ url: string; isVideo: boolean }[]>([]);

  const tags = useMemo(
    () =>
      form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [form.tags],
  );

  const updateField = (field: keyof typeof form, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateCurrentStep = () => {
    const nextErrors: Record<string, string> = {};

    if (step === 0) {
      if (!form.title.trim()) nextErrors.title = "Project title is required";
      if (!form.companyName.trim())
        nextErrors.companyName = "Company name is required";
      if (!form.location.trim()) nextErrors.location = "Location is required";
      if (!form.description.trim())
        nextErrors.description = "Project description is required";
      if (!form.problem.trim())
        nextErrors.problem = "Problem statement is required";
      if (!form.solution.trim())
        nextErrors.solution = "Solution summary is required";
    }

    if (step === 1) {
      if (!form.amountNeeded || Number(form.amountNeeded) <= 0)
        nextErrors.amountNeeded = "Enter a valid amount needed";
      if (!form.useOfFunds.trim())
        nextErrors.useOfFunds = "Explain how the funds will be used";
      if (!form.timeline.trim())
        nextErrors.timeline = "Funding timeline is required";
      if (!form.milestones.trim())
        nextErrors.milestones = "Add at least one milestone";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const handleSubmit = () => {
    if (!validateCurrentStep()) return;

    createPitch.mutate(
      {
        title: form.title,
        category: form.category,
        stage: form.stage,
        location: form.location,
        companyName: form.companyName,
        description: `${form.description}\n\nProblem: ${form.problem}\n\nSolution: ${form.solution}\n\nUse of funds: ${form.useOfFunds}\n\nTimeline: ${form.timeline}\n\nMilestones: ${form.milestones}`,
        amountNeeded: Number(form.amountNeeded),
        tags,
        media: form.media,
        entrepreneurId: user?.id,
        entrepreneurName: user?.fullName,
        fundingStatus: "in_review",
        verificationStatus: "pending",
      },
      {
        onSuccess: () => navigate("/dashboard/entrepreneur/projects"),
        onError: (error) => {
          setErrors({
            submit:
              error instanceof Error
                ? error.message
                : "Unable to submit project",
          });
        },
      },
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="mb-6">
        <Link
          to="/dashboard/entrepreneur/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-brand-600 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to projects
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3">
              <Sparkles size={14} /> Entrepreneur pitch builder
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit]">
              Submit a Project
            </h1>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Create a clear funding-ready project profile in three continuous
              steps.
            </p>
          </div>
          <div className="text-sm text-slate-500 bg-white border border-slate-100 rounded-xl px-4 py-3">
            Step <span className="font-bold text-brand-600">{step + 1}</span> of{" "}
            {steps.length}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        <aside className="bg-white rounded-2xl border border-slate-100 p-4 h-fit sticky top-24">
          <div className="space-y-2">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const active = step === index;
              const done = step > index;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => index < step && setStep(index)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all ${active ? "bg-brand-50 text-brand-700" : done ? "text-emerald-700 hover:bg-emerald-50" : "text-slate-400"}`}
                >
                  <span
                    className={`w-9 h-9 rounded-lg flex items-center justify-center ${active ? "bg-brand-500 text-white" : done ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"}`}
                  >
                    {done ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-700 mb-1">
              Submission tip
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Be specific about traction, the exact funding amount, and
              measurable milestones funders can track.
            </p>
          </div>
        </aside>

        <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="h-2 bg-slate-100">
            <div
              className="h-full bg-brand-500 transition-all"
              style={{ width: `${((step + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="p-5 sm:p-8">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-[Outfit]">
                      1. Project details
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Tell funders what you are building and why it matters.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Project title"
                      placeholder="e.g. Solar Cold Rooms for Farmers"
                      value={form.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      error={errors.title}
                    />
                    <Input
                      label="Company / Startup"
                      placeholder="Your company name"
                      value={form.companyName}
                      onChange={(e) =>
                        updateField("companyName", e.target.value)
                      }
                      error={errors.companyName}
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Category
                      </label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          updateField("category", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      >
                        {categories.map((category) => (
                          <option key={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Stage
                      </label>
                      <select
                        value={form.stage}
                        onChange={(e) => updateField("stage", e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                      >
                        {stages.map((stageOption) => (
                          <option
                            key={stageOption.value}
                            value={stageOption.value}
                          >
                            {stageOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label="Location"
                      placeholder="Lagos, Nigeria"
                      value={form.location}
                      onChange={(e) => updateField("location", e.target.value)}
                      error={errors.location}
                    />
                    <Input
                      label="Tags"
                      placeholder="AI, Agriculture, Marketplace"
                      value={form.tags}
                      onChange={(e) => updateField("tags", e.target.value)}
                    />
                  </div>

                  <TextArea
                    label="Short project description"
                    placeholder="Summarize the product, customer, traction, and impact..."
                    value={form.description}
                    onChange={(value) => updateField("description", value)}
                    error={errors.description}
                  />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextArea
                      label="Problem"
                      placeholder="What urgent problem are you solving?"
                      value={form.problem}
                      onChange={(value) => updateField("problem", value)}
                      error={errors.problem}
                    />
                    <TextArea
                      label="Solution"
                      placeholder="How does your solution work?"
                      value={form.solution}
                      onChange={(value) => updateField("solution", value)}
                      error={errors.solution}
                    />
                  </div>

                  {/* Media Upload Section */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Media (Max 4 photos, 1 video)
                    </label>
                    <p className="text-xs text-slate-500 mb-3">
                      The first image will be used as the project thumbnail. Max 5MB per file.
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {mediaPreviews.map((item, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group">
                          {item.isVideo ? (
                            <video src={item.url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={item.url} alt={`Media ${idx + 1}`} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button"
                              onClick={() => {
                                const newPreviews = [...mediaPreviews];
                                newPreviews.splice(idx, 1);
                                setMediaPreviews(newPreviews);
                                const newMedia = [...form.media];
                                newMedia.splice(idx, 1);
                                updateField("media", newMedia);
                              }}
                              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                              <X size={14} />
                            </button>
                          </div>
                          {idx === 0 && !item.isVideo && (
                            <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-md">
                              Thumbnail
                            </div>
                          )}
                        </div>
                      ))}

                      {mediaPreviews.length < 5 && (
                        <label className={`aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 hover:bg-brand-50 transition-colors flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-brand-600 ${uploadingMedia ? "opacity-50 pointer-events-none" : ""}`}>
                          {uploadingMedia ? (
                            <Loader2 size={20} className="animate-spin mb-1" />
                          ) : (
                            <Upload size={20} className="mb-1" />
                          )}
                          <span className="text-[10px] font-medium text-center px-2">
                            {uploadingMedia ? "Uploading..." : "Upload"}
                          </span>
                          <input type="file" accept="image/*,video/*" className="hidden"
                            disabled={uploadingMedia}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const isVideo = file.type.startsWith("video/");
                              const currentVideos = mediaPreviews.filter(m => m.isVideo).length;
                              const currentPhotos = mediaPreviews.filter(m => !m.isVideo).length;

                              if (isVideo && currentVideos >= 1) { alert("You can only upload 1 video."); return; }
                              if (!isVideo && currentPhotos >= 4) { alert("You can only upload up to 4 photos."); return; }
                              if (file.size > 50 * 1024 * 1024) { alert("File size must be less than 50MB."); return; }

                              // Show local preview immediately
                              const previewUrl = URL.createObjectURL(file);
                              setMediaPreviews(prev => [...prev, { url: previewUrl, isVideo }]);
                              setUploadingMedia(true);

                              try {
                                const result = await api.uploadMedia(file);
                                // Replace preview URL with real server URL
                                setMediaPreviews(prev =>
                                  prev.map(p => p.url === previewUrl ? { url: result.url, isVideo: result.isVideo } : p)
                                );
                                updateField("media", [...form.media, result.url]);
                              } catch (err) {
                                // Remove failed preview
                                setMediaPreviews(prev => prev.filter(p => p.url !== previewUrl));
                                alert(err instanceof Error ? err.message : "Upload failed.");
                              } finally {
                                setUploadingMedia(false);
                                e.target.value = "";
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="funding"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-[Outfit]">
                      2. Funding details
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Define exactly how much you need and what it will
                      accomplish.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      label="Amount needed (NGN)"
                      type="number"
                      min="0"
                      placeholder="10000000"
                      value={form.amountNeeded}
                      onChange={(e) =>
                        updateField("amountNeeded", e.target.value)
                      }
                      error={errors.amountNeeded}
                    />
                    <Input
                      label="Funding timeline"
                      placeholder="e.g. 6 months runway"
                      value={form.timeline}
                      onChange={(e) => updateField("timeline", e.target.value)}
                      error={errors.timeline}
                    />
                  </div>
                  <TextArea
                    label="Use of funds"
                    placeholder="Break down hiring, product, operations, marketing, equipment..."
                    value={form.useOfFunds}
                    onChange={(value) => updateField("useOfFunds", value)}
                    error={errors.useOfFunds}
                    rows={5}
                  />
                  <TextArea
                    label="Milestones funders can track"
                    placeholder="Example: Month 1: buy equipment. Month 3: launch pilot. Month 6: reach 2,000 users."
                    value={form.milestones}
                    onChange={(value) => updateField("milestones", value)}
                    error={errors.milestones}
                    rows={5}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 font-[Outfit]">
                      3. Review & submit
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Confirm the details before publishing your project for
                      funder review.
                    </p>
                  </div>

                  {/* Pre-submission Summary Box */}
                  <div className="bg-brand-50 border border-brand-200 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-brand-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-600" />
                      Before you submit
                    </h3>
                    <ul className="text-sm text-brand-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                        <span>
                          Our admin team will review your project within 24-48
                          hours.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                        <span>
                          Ensure your funding amount and timeline are realistic
                          and clearly justified.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                        <span>
                          Once approved, your project will be visible to all
                          verified funders on the platform.
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5 shrink-0" />
                        <span>
                          You will receive an in-app notification and email
                          regarding the decision.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="bg-linear-to-br from-brand-500 to-emerald-600 p-6 text-white">
                      <p className="text-sm text-white/70">
                        {form.category} ·{" "}
                        {stages.find((s) => s.value === form.stage)?.label}
                      </p>
                      <h3 className="text-2xl font-bold font-[Outfit] mt-1">
                        {form.title || "Untitled project"}
                      </h3>
                      <p className="text-sm text-white/80 mt-2">
                        {form.companyName || "Company"} ·{" "}
                        {form.location || "Location"}
                      </p>
                    </div>
                    <div className="p-5 grid sm:grid-cols-3 gap-4 border-b border-slate-100">
                      <ReviewMetric
                        label="Amount needed"
                        value={`₦${Number(form.amountNeeded || 0).toLocaleString()}`}
                      />
                      <ReviewMetric
                        label="Timeline"
                        value={form.timeline || "Not set"}
                      />
                      <ReviewMetric
                        label="Tags"
                        value={tags.length ? tags.join(", ") : "None"}
                      />
                    </div>
                    <div className="p-5 space-y-4">
                      <ReviewBlock
                        title="Description"
                        value={form.description}
                      />
                      <ReviewBlock title="Problem" value={form.problem} />
                      <ReviewBlock title="Solution" value={form.solution} />
                      <ReviewBlock
                        title="Use of funds"
                        value={form.useOfFunds}
                      />
                      <ReviewBlock title="Milestones" value={form.milestones} />
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
                      {errors.submit}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-8 py-5 border-t border-slate-100 bg-slate-50/60">
            <Button
              variant="ghost"
              size="md"
              onClick={goBack}
              disabled={step === 0}
              icon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button variant="primary" size="md" onClick={goNext}>
                Continue
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={createPitch.isPending}
                icon={<Send size={16} />}
              >
                {createPitch.isPending ? "Submitting..." : "Submit Project"}
              </Button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${error ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
      />
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ReviewMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-semibold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function ReviewBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
        {title}
      </p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
        {value || "Not provided"}
      </p>
    </div>
  );
}
