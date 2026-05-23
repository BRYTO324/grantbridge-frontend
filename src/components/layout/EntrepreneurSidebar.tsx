import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, X, MapPin } from "lucide-react";
import { useAppStore } from "../../lib/store";

interface EntrepreneurSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard/entrepreneur", exact: true },
  { label: "My Projects", path: "/dashboard/entrepreneur/projects" },
  { label: "Submit Project", path: "/dashboard/entrepreneur/projects/new" },
  { label: "Weekly Updates", path: "/dashboard/entrepreneur/progress" },
  { label: "Impact", path: "/dashboard/entrepreneur/impact" },
];

const accountItems = [
  { label: "Profile", path: "/dashboard/entrepreneur/profile" },
  { label: "Settings", path: "/dashboard/entrepreneur/settings" },
];

export default function EntrepreneurSidebar({ isOpen, onClose }: EntrepreneurSidebarProps) {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Always use live data from store — never hardcoded fallbacks
  const avatarSrc =
    user?.avatarUrl ||
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "U")}&background=10b981&color=fff&size=96`;

  const displayName = user?.fullName || "Entrepreneur";
  const displayCompany = user?.company || "";
  const displayLocation = user?.location || "";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-67.5 bg-white border-r border-slate-100 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-17 border-b border-slate-100 shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25">
            <span className="text-white font-bold text-lg font-[Outfit]">G</span>
          </div>
          <span className="text-base font-bold text-slate-800 font-[Outfit] tracking-tight">
            GrantBridge
          </span>
        </Link>
        <button
          className="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* User Profile Card — live data from store */}
      <Link
        to="/dashboard/entrepreneur/profile"
        onClick={onClose}
        className="px-4 py-5 border-b border-slate-100 shrink-0 hover:bg-slate-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=10b981&color=fff&size=96`;
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
            {displayCompany && (
              <p className="text-xs text-slate-500 truncate">{displayCompany}</p>
            )}
            {displayLocation && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin size={10} /> {displayLocation}
              </p>
            )}
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-1 pb-2 text-xs font-bold text-slate-400 uppercase tracking-[0.08em]">
          Menu
        </p>
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <span className="flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}

        <p className="px-3 pt-5 pb-2 text-xs font-bold text-slate-400 uppercase tracking-[0.08em]">
          Account
        </p>
        {accountItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <span className="flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-3 border-t border-slate-100 shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
