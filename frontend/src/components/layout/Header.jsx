import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, ChevronDown, Menu, LogOut, Settings, User } from "lucide-react";
import { useUiStore } from "../../store/useUiStore";
import { useAuthStore } from "../../store/useAuthStore";
import { useAppStore } from "../../store/useAppStore";
import { ROLE_LABEL } from "../navigation/navConfig";

export default function Header() {
  const { toggleMobileNav } = useUiStore();
  const { user, logout } = useAuthStore();
  const notifications = useAppStore((s) => s.notifications);
  const unread = notifications.filter((n) => !n.read).length;
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-black/[0.06]">
      <div className="flex items-center gap-4 px-4 lg:px-8 py-3">
        <button onClick={toggleMobileNav} className="lg:hidden text-ink-900">
          <Menu size={22} />
        </button>

        <div className="hidden md:flex items-center gap-2 bg-white border border-black/[0.08] rounded-lg px-3 py-2 w-72 shadow-card">
          <Search size={16} className="text-ink-900/40" />
          <input
            placeholder="Search classes, teachers, rooms..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-ink-900/40"
          />
        </div>

        <div className="hidden md:block text-sm text-ink-900/50 truncate">
          {user?.school?.name || "School"}, {user?.school?.campus || ""}
        </div>

        <div className="flex-1" />

        <button
          onClick={() => navigate(`/${user?.role}/notifications`)}
          className="relative text-ink-900/70 hover:text-ink-900 focus-ring rounded-full p-1.5"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-clash-red text-white text-[10px] flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 focus-ring rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-semibold">
              {user?.initials}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="text-sm font-medium text-ink-900">{user?.name}</div>
              <div className="text-xs text-mint bg-forest/5 inline-block px-1.5 rounded text-forest">
                {ROLE_LABEL[user?.role]}
              </div>
            </div>
            <ChevronDown size={16} className="text-ink-900/40" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-pop border border-black/[0.06] py-1.5 z-20">
                <button
                  onClick={() => { setMenuOpen(false); navigate(`/${user?.role}/settings`); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-ink-900/80 hover:bg-cream-dark"
                >
                  <Settings size={15} /> Settings
                </button>
                <button
                  onClick={() => { setMenuOpen(false); navigate(`/${user?.role}/profile`); }}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-ink-900/80 hover:bg-cream-dark"
                >
                  <User size={15} /> Profile
                </button>
                <div className="h-px bg-black/[0.06] my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-sm text-clash-red hover:bg-red-50"
                >
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
