import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Lock, Bell, Shield, Camera, Check, Save, Eye, EyeOff,
} from "lucide-react";
import { useAppStore } from "../../lib/store";
import { useUpdateProfile, useChangePassword } from "../../lib/hooks/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function EntrepreneurSettingsPage() {
  const { user } = useAppStore();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications" | "privacy">("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    company: user?.company || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    projectUpdates: true,
    fundingAlerts: true,
    weeklyDigest: false,
    marketingEmails: false,
    pushNotifications: true,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showProjects: false,
    allowMessages: true,
    showEmail: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const showSuccess = () => {
    setSaveSuccess(true);
    setSaveError("");
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    updateProfile.mutate(fd, {
      onSuccess: showSuccess,
      onError: (err) => setSaveError(err.message),
    });
  };

  const handleProfileSave = () => {
    setSaveError("");
    updateProfile.mutate(
      { fullName: formData.fullName, phone: formData.phone, company: formData.company },
      {
        onSuccess: showSuccess,
        onError: (err) => setSaveError(err.message),
      },
    );
  };

  const handlePasswordChange = () => {
    const errs: Record<string, string> = {};
    if (!passwordForm.currentPassword) errs.currentPassword = "Current password is required";
    if (!passwordForm.newPassword) errs.newPassword = "New password is required";
    else if (passwordForm.newPassword.length < 8) errs.newPassword = "Password must be at least 8 characters";
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    changePassword.mutate(
      { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword },
      {
        onSuccess: () => {
          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
          showSuccess();
        },
        onError: (err) => setSaveError(err.message),
      },
    );
  };

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "security" as const, label: "Security", icon: Lock },
    { id: "notifications" as const, label: "Notifications", icon: Bell },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
  ];

  const avatarSrc = user?.avatarUrl || user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=10b981&color=fff&size=128`;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account settings and preferences</p>
        </div>

        {saveSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <Check size={20} className="text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">Settings saved successfully!</p>
          </motion.div>
        )}

        {saveError && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {saveError}
          </motion.div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-2">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}>
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">

              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 font-[Outfit]">Profile Information</h2>

                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <img src={avatarSrc} alt="Profile"
                        className="w-24 h-24 rounded-2xl object-cover ring-4 ring-slate-100" />
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera size={24} className="text-white" />
                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800 mb-1">Profile Picture</p>
                      <p className="text-xs text-slate-500">Click the photo to upload. JPG or PNG, max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Full Name</label>
                      <Input type="text" value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Your full name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Email Address</label>
                      <Input type="email" value={user?.email || ""} disabled placeholder="you@example.com" />
                      <p className="text-xs text-slate-400 mt-1">Email cannot be changed here.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Phone Number</label>
                      <Input type="tel" value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+234 81 000-0000" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">Company / Startup</label>
                      <Input type="text" value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Your company name" />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={handleProfileSave}
                      disabled={updateProfile.isPending} icon={<Save size={16} />}>
                      {updateProfile.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 font-[Outfit]">Change Password</h2>
                  <div className="space-y-5">
                    {[
                      { key: "currentPassword", label: "Current Password", show: showCurrentPassword, toggle: () => setShowCurrentPassword(!showCurrentPassword) },
                      { key: "newPassword", label: "New Password", show: showNewPassword, toggle: () => setShowNewPassword(!showNewPassword) },
                      { key: "confirmPassword", label: "Confirm New Password", show: showConfirmPassword, toggle: () => setShowConfirmPassword(!showConfirmPassword) },
                    ].map(({ key, label, show, toggle }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium text-slate-600 mb-2">{label}</label>
                        <div className="relative">
                          <Input type={show ? "text" : "password"}
                            value={passwordForm[key as keyof typeof passwordForm]}
                            onChange={(e) => setPasswordForm({ ...passwordForm, [key]: e.target.value })}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            error={errors[key]} />
                          <button type="button" onClick={toggle}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={handlePasswordChange}
                      disabled={changePassword.isPending} icon={<Save size={16} />}>
                      {changePassword.isPending ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 font-[Outfit]">Notification Preferences</h2>
                  <div className="space-y-4">
                    {[
                      { key: "emailUpdates", label: "Email Updates", desc: "Receive important account updates via email" },
                      { key: "projectUpdates", label: "Project Updates", desc: "Get notified about your project activity" },
                      { key: "fundingAlerts", label: "Funding Alerts", desc: "Alerts when you receive funding offers" },
                      { key: "weeklyDigest", label: "Weekly Digest", desc: "Weekly summary of opportunities and tips" },
                      { key: "marketingEmails", label: "Marketing Emails", desc: "News, features, and promotional content" },
                      { key: "pushNotifications", label: "Push Notifications", desc: "Receive browser push notifications" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={showSuccess} icon={<Save size={16} />}>Save Preferences</Button>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-slate-800 font-[Outfit]">Privacy Settings</h2>
                  <div className="space-y-4">
                    {[
                      { key: "showProfile", label: "Public Profile", desc: "Allow others to see your profile" },
                      { key: "showProjects", label: "Show Projects", desc: "Display your projects publicly" },
                      { key: "allowMessages", label: "Allow Messages", desc: "Let funders send you messages" },
                      { key: "showEmail", label: "Show Email", desc: "Display email address on your profile" },
                    ].map((item) => (
                      <div key={item.key} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{item.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                          <input type="checkbox"
                            checked={privacy[item.key as keyof typeof privacy]}
                            onChange={(e) => setPrivacy({ ...privacy, [item.key]: e.target.checked })}
                            className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end pt-4">
                    <Button variant="primary" onClick={showSuccess} icon={<Save size={16} />}>Save Privacy Settings</Button>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <p className="text-sm font-medium text-red-600 mb-3">Danger Zone</p>
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <p className="text-sm text-slate-700 mb-3">Once you delete your account, there is no going back.</p>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-100">Delete Account</Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
