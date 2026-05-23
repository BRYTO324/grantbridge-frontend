import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertCircle, CheckCircle2, ClipboardList, LineChart, Send, Target,
} from "lucide-react";
import Button from "../../components/ui/Button";
import { useUserPitches } from "../../lib/hooks/usePitches";
import { useSubmitWeeklyProgress } from "../../lib/hooks/useProgressUpdates";
import { useGetWeeklyProgress } from "../../lib/hooks/useProgressUpdates";
import { useAppStore } from "../../lib/store";

const defaultForm = {
  pitchId: "",
  weekEnding: new Date().toISOString().slice(0, 10),
  summary: "",
  wins: "",
  blockers: "",
  nextSteps: "",
  metricName: "Revenue",
  metricValue: "",
  fundingSpent: "",
};

export default function WeeklyProgressPage() {
  const { user } = useAppStore();
  const { data: pitches = [] } = useUserPitches(user?.id || "");
  const submitProgress = useSubmitWeeklyProgress();
  const { data: progressData } = useGetWeeklyProgress();
  const recentUpdates = (progressData as { results?: { pitchId: string; weekEnding: string; summary: string }[] })?.results
    ?? (Array.isArray(progressData) ? progressData : []);
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedPitch = useMemo(
    () => pitches.find((pitch) => pitch.id === form.pitchId),
    [pitches, form.pitchId],
  );

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setSubmitted(false);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.pitchId)
      nextErrors.pitchId = "Select the project this update belongs to";
    if (!form.weekEnding) nextErrors.weekEnding = "Choose the week ending date";
    if (!form.summary.trim()) nextErrors.summary = "Add a weekly summary";
    if (!form.wins.trim())
      nextErrors.wins = "Add at least one win or milestone";
    if (!form.nextSteps.trim())
      nextErrors.nextSteps = "Add next week priorities";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    submitProgress.mutate(
      {
        pitchId: form.pitchId,
        weekEnding: form.weekEnding,
        summary: form.summary,
        wins: form.wins,
        blockers: form.blockers,
        nextSteps: form.nextSteps,
        metrics: {
          [form.metricName || "Metric"]: form.metricValue,
          fundingSpent: form.fundingSpent,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setForm((prev) => ({ ...defaultForm, pitchId: prev.pitchId }));
        },
        onError: (error) =>
          setErrors({
            submit:
              error instanceof Error
                ? error.message
                : "Unable to submit progress update",
          }),
      },
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <main className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit]">
                  Submit Weekly Progress
                </h1>
                <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                  Keep funders and your team aligned with traction, spend,
                  blockers, and next steps.
                </p>
              </div>
              <Link to="/dashboard/entrepreneur/projects">
                <Button variant="outline" size="sm">
                  View Projects
                </Button>
              </Link>
            </div>
          </div>

          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3"
            >
              <CheckCircle2 size={20} className="text-emerald-600 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Progress update submitted
                </p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  Your weekly report has been saved and can be shared with
                  funders.
                </p>
              </div>
            </motion.div>
          )}

          <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-7 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Project
                </label>
                <select
                  value={form.pitchId}
                  onChange={(e) => updateField("pitchId", e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${errors.pitchId ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                >
                  <option value="">Select a project</option>
                  {pitches.map((pitch) => (
                    <option key={pitch.id} value={pitch.id}>
                      {pitch.title.split("—")[0].trim()}
                    </option>
                  ))}
                </select>
                {errors.pitchId && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.pitchId}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Week ending
                </label>
                <input
                  type="date"
                  value={form.weekEnding}
                  onChange={(e) => updateField("weekEnding", e.target.value)}
                  className={`w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${errors.weekEnding ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                />
                {errors.weekEnding && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.weekEnding}
                  </p>
                )}
              </div>
            </div>

            <TextArea
              label="Executive summary"
              value={form.summary}
              onChange={(value) => updateField("summary", value)}
              error={errors.summary}
              placeholder="What changed this week? Include traction, product progress, customer conversations, and funder-relevant context."
              rows={5}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <TextArea
                label="Wins / milestones"
                value={form.wins}
                onChange={(value) => updateField("wins", value)}
                error={errors.wins}
                placeholder="List shipped features, partnerships, sales, grants, hires..."
              />
              <TextArea
                label="Blockers / risks"
                value={form.blockers}
                onChange={(value) => updateField("blockers", value)}
                placeholder="What is slowing you down? What support do you need?"
              />
            </div>

            <TextArea
              label="Next week priorities"
              value={form.nextSteps}
              onChange={(value) => updateField("nextSteps", value)}
              error={errors.nextSteps}
              placeholder="What are the top 3 priorities for next week?"
              rows={4}
            />

            <div className="grid md:grid-cols-3 gap-4">
              <Field
                label="Metric name"
                value={form.metricName}
                onChange={(value) => updateField("metricName", value)}
                placeholder="Revenue, users, pilots"
              />
              <Field
                label="Metric value"
                value={form.metricValue}
                onChange={(value) => updateField("metricValue", value)}
                placeholder="₦500k, 120 users"
              />
              <Field
                label="Funding spent this week"
                value={form.fundingSpent}
                onChange={(value) => updateField("fundingSpent", value)}
                placeholder="₦250,000"
              />
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle size={16} /> {errors.submit}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmit}
                disabled={submitProgress.isPending}
                icon={<Send size={17} />}
              >
                {submitProgress.isPending
                  ? "Submitting..."
                  : "Submit Weekly Update"}
              </Button>
            </div>
          </div>
        </main>

        <aside className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 font-[Outfit] mb-4">
              Report preview
            </h2>
            <div className="rounded-2xl bg-linear-to-br from-slate-900 to-slate-700 p-5 text-white mb-4">
              <p className="text-xs text-white/60">
                {form.weekEnding || "Week ending"}
              </p>
              <h3 className="font-bold mt-1">
                {selectedPitch?.title?.split("—")[0].trim() ||
                  "Select a project"}
              </h3>
              <p className="text-sm text-white/70 mt-3 line-clamp-4">
                {form.summary ||
                  "Your executive summary will appear here as you type."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <PreviewStat
                icon={LineChart}
                label={form.metricName || "Metric"}
                value={form.metricValue || "—"}
              />
              <PreviewStat
                icon={Target}
                label="Spend"
                value={form.fundingSpent || "—"}
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-800">
                Recent updates
              </h3>
              {recentUpdates.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No updates submitted yet.</p>
              ) : (
                recentUpdates.slice(0, 3).map((update, idx) => {
                  const pitch = pitches.find((p) => p.id === update.pitchId);
                  return (
                    <div key={idx} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-slate-100">
                        <ClipboardList size={15} className="text-brand-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {pitch?.title?.split("—")[0].trim() || "Project Update"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Week ending {update.weekEnding} · {update.summary?.slice(0, 40)}{update.summary?.length > 40 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
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

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}

function PreviewStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof LineChart;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <Icon size={16} className="text-brand-600 mb-2" />
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
  );
}
