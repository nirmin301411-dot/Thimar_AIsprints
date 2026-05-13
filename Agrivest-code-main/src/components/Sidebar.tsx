import { NavLink } from "react-router-dom";
import { LayoutDashboard, Sprout, PieChart, Brain, Bell, TrendingUp, LogOut, Sun, Moon, Globe } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLang } from "../context/LangContext";
import type { LangKey } from "../i18n";

const navItems: { section: LangKey; items: { to: string; icon: typeof LayoutDashboard; labelKey: LangKey }[] }[] = [
  { section: "nav.overview", items: [
    { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  ]},
  { section: "nav.invest", items: [
    { to: "/farms", icon: Sprout, labelKey: "nav.farms" },
    { to: "/portfolio", icon: PieChart, labelKey: "nav.portfolio" },
  ]},
  { section: "nav.intelligence", items: [
    { to: "/ai", icon: Brain, labelKey: "nav.ai" },
    { to: "/market", icon: TrendingUp, labelKey: "nav.market" },
  ]},
  { section: "nav.account", items: [
    { to: "/notifications", icon: Bell, labelKey: "nav.notifications" },
  ]},
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLang();

  return (
    <aside className="fixed left-0 top-0 w-[260px] h-screen bg-surface/80 backdrop-blur-xl border-r border-white/5 flex flex-col p-6 z-40 rtl:left-auto rtl:right-0 rtl:border-r-0 rtl:border-l rtl:border-white/5 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent-blue flex items-center justify-center text-background font-bold text-xl shadow-[0_0_15px_rgba(0,255,102,0.3)]">
          ث
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight text-textMain leading-none mb-1">Thimar</h1>
          <span className="text-[10px] text-textMuted uppercase tracking-widest font-semibold">Agri-Fintech</span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2 -mr-2 space-y-8">
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="text-[10px] uppercase tracking-widest text-textMuted font-bold mb-3 px-3">{t(section.section)}</div>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-primary/10 text-primary font-bold shadow-[inset_2px_0_0_0_rgba(0,255,102,1)]"
                        : "text-textSecondary hover:bg-white/5 hover:text-textMain"
                    }`
                  }
                >
                  <item.icon size={18} />
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: user info + controls */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-3">

        {/* Theme + Language toggles */}
        <div className="flex gap-2 px-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? t("settings.light_mode") : t("settings.dark_mode")}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-textSecondary bg-white/5 hover:bg-primary/10 hover:text-primary transition-all border border-white/5"
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            {theme === "dark" ? t("settings.light_mode") : t("settings.dark_mode")}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            title="Toggle language"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-textSecondary bg-white/5 hover:bg-primary/10 hover:text-primary transition-all border border-white/5"
          >
            <Globe size={14} />
            {t("settings.language")}
          </button>
        </div>

        {/* User info */}
        {user && (
          <div className="px-3 bg-surfaceHighlight/50 rounded-xl p-3 border border-white/5">
            <div className="text-sm font-bold text-textMain mb-1">{user.name}</div>
            <div className="text-xs text-textMuted capitalize">
              {user.role} <span className="text-white/20 px-1">•</span> {user.governorate || "—"}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger/80 hover:bg-danger/10 hover:text-danger transition-colors"
        >
          <LogOut size={18} />
          {t("nav.signout")}
        </button>
      </div>
    </aside>
  );
}
