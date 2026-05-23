/**
 * FunderProfilePage — fully backend-driven.
 */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  User, Building2, MapPin, Mail, Phone, Edit2, Camera,
  ShieldCheck, Globe, Save, X, CheckCircle2, Target,
} from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useUpdateProfile } from "../../lib/hooks/useAuth";

export default function FunderProfilePage() {
  const { user } = useAppStore();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    company: "",
    location: "",
    website: "",
    bio: "",
  });

  // Keep form in sync with store
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        company: user.company || "",
        location: user.location || "",
        website: user.website || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const avatarSrc =
    user?.avatarUrl ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=10b981&color=fff&size=128`;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    updateProfile.mutate(fd);
  };

  const handleSave = () => {
    setSaveError("");

    // Clean website — auto-prefix https:// if missing
    let cleanWebsite = formData.website.trim();
    if (cleanWebsite && !cleanWebsite.startsWith("http://") && !cleanWebsite.startsWith("https://")) {
      cleanWebsite = `https://${cleanWebsite}`;
    }

    updateProfile.mutate(
      {
        fullName: formData.fullName,
        phone: formData.phone,
        company: formData.company,
        location: formData.location,
        website: cleanWebsite,
        bio: formData.bio,
        profileCompleted: true,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        },
        onError: (err) => setSaveError(err.message),
      },
    );
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">My Profile</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your funder profile and investment preferences</p>
        </div>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors cursor-pointer">
            <Edit2 size={16} />
            <span className="text-sm font-medium">Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => { setIsEditing(false); setSaveError(""); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer">
              <X size={16} />
              <span className="text-sm font-medium">Cancel</span>
            </button>
            <button onClick={handleSave} disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-60">
              <Save size={16} />
              <span className="text-sm font-medium">{updateProfile.isPending ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        )}
      </div>

      {saveSuccess && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 size={20} className="text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">Profile saved successfully!</p>
        </motion.div>
      )}
      {saveError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{saveError}</div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="h-32 bg-linear-to-r from-brand-500 via-emerald-500 to-teal-500 relative" />
            <div className="px-6 pb-6">
              <div className="relative -mt-16 mb-4">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=10b981&color=fff&size=128`;
                    }} />
                </div>
                <label className="absolute bottom-1 right-1 p-2 bg-brand-500 hover:bg-brand-600 rounded-lg shadow-lg transition-colors cursor-pointer">
                  <Camera size={14} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>

              <div className="space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-[Outfit]">{formData.fullName || user?.fullName}</h2>
                  {formData.company && (
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Building2 size={12} /> {formData.company}
                    </p>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                  user?.verificationStatus === "verified" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                }`}>
                  <ShieldCheck size={10} />
                  {user?.verificationStatus === "verified" ? "Verified Funder" : "Unverified"}
                </span>
                {formData.bio && <p className="text-sm text-slate-600 leading-relaxed">{formData.bio}</p>}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {formData.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <MapPin size={13} className="text-slate-400" /><span>{formData.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail size={13} className="text-slate-400" /><span className="truncate">{user?.email}</span>
                  </div>
                  {formData.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone size={13} className="text-slate-400" /><span>{formData.phone}</span>
                    </div>
                  )}
                  {formData.website && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Globe size={13} className="text-slate-400" />
                      <a href={formData.website} target="_blank" rel="noopener noreferrer"
                        className="text-brand-600 hover:underline truncate">
                        {formData.website.replace("https://", "").replace("http://", "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-6">

          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-slate-800 font-[Outfit]">Personal Information</h3>
              <User size={18} className="text-slate-400" />
            </div>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { label: "Full Name", key: "fullName", type: "text", placeholder: "Your full name" },
                { label: "Email Address", key: "email", type: "email", disabled: true, value: user?.email },
                { label: "Phone Number", key: "phone", type: "tel", placeholder: "+234 801 234 5678" },
                { label: "Company", key: "company", type: "text", placeholder: "Your company name" },
              ].map(({ label, key, type, placeholder, disabled, value }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-slate-600 mb-2">{label}</label>
                  {isEditing && !disabled ? (
                    <input type={type} value={formData[key as keyof typeof formData] ?? ""}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  ) : (
                    <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-800">
                      {(value ?? formData[key as keyof typeof formData]) || <span className="text-slate-400 italic">Not set</span>}
                    </p>
                  )}
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-2">Location</label>
                {isEditing ? (
                  <input type="text" value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                ) : (
                  <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-800">
                    {formData.location || <span className="text-slate-400 italic">Not set</span>}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-2">Website</label>
                {isEditing ? (
                  <input type="url" value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://yourcompany.com"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                ) : (
                  <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-800">
                    {formData.website || <span className="text-slate-400 italic">Not set</span>}
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-2">Bio</label>
                {isEditing ? (
                  <textarea value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell entrepreneurs about your investment focus..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none" />
                ) : (
                  <p className="px-4 py-2.5 bg-slate-50 rounded-xl text-sm text-slate-800 leading-relaxed">
                    {formData.bio || <span className="text-slate-400 italic">Not set</span>}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Investment Preferences */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800 font-[Outfit]">Account Status</h3>
              <Target size={18} className="text-slate-400" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Verification Status</p>
                <p className={`text-sm font-semibold capitalize ${
                  user?.verificationStatus === "verified" ? "text-emerald-600"
                  : user?.verificationStatus === "submitted" ? "text-amber-600"
                  : "text-slate-600"
                }`}>{user?.verificationStatus || "pending"}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Profile</p>
                <p className="text-sm font-semibold text-slate-800">
                  {user?.profileCompleted ? "Complete" : "Incomplete"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
