import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";
import { NAV_BY_ROLE, ROLE_LABEL } from "../navigation/navConfig";
import { useUiStore } from "../../store/useUiStore";
import { useAuthStore } from "../../store/useAuthStore";

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobileNavOpen, closeMobileNav } = useUiStore();
  const { user } = useAuthStore();
  const items = NAV_BY_ROLE[user?.role] || [];

  return (
    <>
      {/* mobile overlay */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeMobileNav}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen z-50 lg:z-0 bg-forest-dark text-cream/90 flex flex-col
          transition-all duration-200 ease-out
          ${sidebarCollapsed ? "lg:w-[76px]" : "lg:w-[248px]"}
          ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
          w-[248px]`}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className={`overflow-hidden ${sidebarCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"} transition-all`}>
            <div className="font-serif text-lg leading-none whitespace-nowrap">
              Table <span className="text-mint">Table</span>
            </div>
            <div className="text-[10px] uppercase tracking-wide text-cream/40 mt-1 whitespace-nowrap">
              {user?.school?.name || "School"}
            </div>
          </div>
          <button onClick={closeMobileNav} className="lg:hidden text-cream/60 hover:text-cream">
            <X size={20} />
          </button>
        </div>

        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 text-xs text-mint">
            <span className="w-1.5 h-1.5 rounded-full bg-mint inline-block" />
            {!sidebarCollapsed && <span className="whitespace-nowrap">{ROLE_LABEL[user?.role]}</span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeMobileNav}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group relative
                ${isActive ? "bg-forest-light/90 text-white" : "text-cream/65 hover:bg-white/5 hover:text-cream"}`
              }
              title={sidebarCollapsed ? label : undefined}
            >
              <Icon size={17} className="shrink-0" />
              <span className={`whitespace-nowrap transition-all ${sidebarCollapsed ? "lg:hidden" : ""}`}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          onClick={toggleSidebar}
          className="hidden lg:flex items-center gap-2 mx-3 mb-4 mt-2 px-3 py-2 rounded-lg text-cream/50 hover:text-cream hover:bg-white/5 text-xs"
        >
          {sidebarCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
          {!sidebarCollapsed && <span>Collapse</span>}
        </button>
      </aside>
    </>
  );
}
