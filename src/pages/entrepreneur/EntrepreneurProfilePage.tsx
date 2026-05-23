/**
 * EntrepreneurProfilePage — fully backend-driven.
 * All data comes from the Zustand store (which is synced from /auth/me/ on layout mount).
 * Save calls PATCH /auth/me/ and immediately syncs the response back to the store.
 * ID upload calls POST /verification/submit/ with real FormData.
 */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  User as UserIcon, MapPin, Mail, Phone, Edit2, Camera, ShieldCheck,
  Globe, Briefcase, Save, X, Building, Upload, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useUpdateProfile } from "../../lib/hooks/useAuth";
import { api } from "../../lib/api/live-api";
import { fetchApi } from "../../lib/api/api-client";

export default function EntrepreneurProfilePage() {
  const { user } = useAppStore();
  const updateProfile = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form state — always re-initialized from the store when user changes
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    company: "",
    location: "",
    website: "",
    bio: "",
  });

  // Keep form in sync with store (handles post-save updates)
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

  // Avatar
  const avatarSrc =
    user?.avatarUrl ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=10b981&color=fff&size=128`;

  // ID verification state
  const [idFrontFile, setIdFrontFile] = useState<File | null>(null);
  const [idBackFile, setIdBackFile] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [idBackPreview, setIdBackPreview] = useState<string | null>(null);
  const [idType, setIdType] = useState("national_id");
  const [idNumber, setIdNumber] = useState("");
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    updateProfile.mutate(fd, {
      onSuccess: () => {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      },
    });
  };

  const handleSave = () => {
    setSaveError("");

    // Clean website — strip if it's not a valid URL
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

  const handleIdFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "front" | "back",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === "front") {
        setIdFrontFile(file);
        setIdFrontPreview(reader.result as string);
      } else {
        setIdBackFile(file);
        setIdBackPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitVerification = async () => {
    if (!idFrontFile) {
      setVerificationError("Please upload the front of your ID card.");
      return;
    }
    if (!idNumber.trim()) {
      setVerificationError("Please enter your ID number.");
      return;
    }
    setIsSubmittingVerification(true);
    setVerificationError("");
    try {
      const fd = new FormData();
      fd.append("id_type", idType);
      fd.append("id_number", idNumber);
      fd.append("id_front", idFrontFile);
      if (idBackFile) fd.append("id_back", idBackFile);
      await api.submitVerification(fd);

      // Re-fetch user from backend to get updated verificationStatus
      const freshUser = await fetchApi<ReturnType<typeof useAppStore.getState>["user"]>("/auth/me/");
      if (freshUser) useAppStore.getState().updateUser(freshUser);
      setVerificationSuccess(true);
      setIdFrontFile(null);
      setIdBackFile(null);
      setIdFrontPreview(null);
      setIdBackPreview(null);
      setIdNumber("");
    } catch (err) {
      setVerificationError(
        err instanceof Error ? err.message : "Submission failed. Please try again."
      );
    } finally {
      setIsSubmittingVerification(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">
              My Profile
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your entrepreneur profile and project portfolio
            </p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors cursor-pointer"
            >
              <Edit2 size={16} />
              <span className="text-sm font-medium">Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setIsEditing(false); setSaveError(""); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                <X size={16} />
                <span className="text-sm font-medium">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors cursor-pointer disabled:opacity-60"
              >
                <Save size={16} />
                <span className="text-sm font-medium">
                  {updateProfile.isPending ? "Saving..." : "Save Changes"}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Success banner */}
        {saveSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">Profile saved successfully!</p>
          </motion.div>
        )}
        {saveError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {saveError}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-32 bg-linear-to-r from-brand-500 via-purple-500 to-pink-500 relative" />
              <div className="px-6 pb-6">
                <div className="relative -mt-16 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100">
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
                        <Building size={12} /> {formData.company}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full ${
                      user?.verificationStatus === "verified"
                        ? "bg-emerald-50 text-emerald-700"
                        : user?.verificationStatus === "submitted"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      <ShieldCheck size={10} />
                      {user?.verificationStatus === "verified" ? "Verified Entrepreneur"
                        : user?.verificationStatus === "submitted" ? "Verification Pending"
                        : "Unverified"}
                    </span>
                  </div>

                  {formData.bio && (
                    <p className="text-sm text-slate-600 leading-relaxed">{formData.bio}</p>
                  )}

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    {formData.location && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail size={13} className="text-slate-400" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Phone size={13} className="text-slate-400" />
                        <span>{formData.phone}</span>
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-800 font-[Outfit]">Personal Information</h3>
                <UserIcon size={18} className="text-slate-400" />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { label: "Full Name", key: "fullName", type: "text", placeholder: "Your full name" },
                  { label: "Email Address", key: "email", type: "email", disabled: true, value: user?.email },
                  { label: "Phone Number", key: "phone", type: "tel", placeholder: "+234 801 234 5678" },
                  { label: "Company/Startup", key: "company", type: "text", placeholder: "Your company name" },
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
                      placeholder="Lagos, Nigeria"
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
                      placeholder="Tell funders about yourself and your mission..."
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

            {/* Identity Verification */}
            <div id="verification-section" className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-semibold text-slate-800 font-[Outfit]">Identity Verification</h3>
                <ShieldCheck size={18} className={user?.verificationStatus === "verified" ? "text-emerald-500" : "text-slate-400"} />
              </div>

              {user?.verificationStatus === "verified" ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-600 mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Account Verified</p>
                    <p className="text-xs text-emerald-600 mt-1">Your identity has been successfully verified by our team.</p>
                  </div>
                </div>
              ) : user?.verificationStatus === "submitted" ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                  <Clock className="text-amber-600 mt-0.5 shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Verification Under Review</p>
                    <p className="text-xs text-amber-600 mt-1">Your documents are being reviewed. This usually takes 24–48 hours.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {verificationSuccess && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                      <CheckCircle2 className="text-emerald-600 mt-0.5" size={18} />
                      <p className="text-sm text-emerald-700 font-medium">Documents submitted! We'll review them within 24–48 hours.</p>
                    </div>
                  )}

                  <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
                    <p className="text-sm text-brand-800">
                      Upload a valid government-issued ID to verify your account and increase your chances of getting funded.
                    </p>
                  </div>

                  {/* ID Type */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">ID Type</label>
                    <select value={idType} onChange={(e) => setIdType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
                      <option value="national_id">National ID Card (NIN)</option>
                      <option value="passport">International Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="voters_card">Voter's Card</option>
                    </select>
                  </div>

                  {/* ID Number */}
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">ID Number</label>
                    <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="Enter your ID number"
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>

                  {/* File uploads */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    {/* Front */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">
                        Front of ID Card <span className="text-red-500">*</span>
                      </label>
                      <div className="relative aspect-[1.6/1] rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50 transition-colors overflow-hidden group">
                        {idFrontPreview ? (
                          <>
                            <img src={idFrontPreview} alt="ID Front" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => { setIdFrontFile(null); setIdFrontPreview(null); }}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                                <X size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-brand-600">
                            <Upload size={24} className="mb-2" />
                            <span className="text-xs font-medium">Upload Front</span>
                            <span className="text-[10px] text-slate-400 mt-1">JPG, PNG · Max 5MB</span>
                            <input type="file" accept="image/*,.pdf" className="hidden"
                              onChange={(e) => handleIdFile(e, "front")} />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Back */}
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">
                        Back of ID Card <span className="text-slate-400">(optional)</span>
                      </label>
                      <div className="relative aspect-[1.6/1] rounded-xl border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50 transition-colors overflow-hidden group">
                        {idBackPreview ? (
                          <>
                            <img src={idBackPreview} alt="ID Back" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => { setIdBackFile(null); setIdBackPreview(null); }}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                                <X size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-brand-600">
                            <Upload size={24} className="mb-2" />
                            <span className="text-xs font-medium">Upload Back</span>
                            <span className="text-[10px] text-slate-400 mt-1">JPG, PNG · Max 5MB</span>
                            <input type="file" accept="image/*,.pdf" className="hidden"
                              onChange={(e) => handleIdFile(e, "back")} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {verificationError && (
                    <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
                      <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-600">{verificationError}</p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={handleSubmitVerification}
                      disabled={isSubmittingVerification || !idFrontFile}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingVerification ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          Submit for Verification
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Professional Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-800 font-[Outfit]">Professional Details</h3>
                <Briefcase size={18} className="text-slate-400" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900 font-[Outfit]">
                    {user?.verificationStatus === "verified" ? "✓" : "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Verified</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900 font-[Outfit]">
                    {user?.profileCompleted ? "✓" : "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Profile Complete</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-slate-900 font-[Outfit] capitalize">
                    {user?.role || "—"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Role</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
