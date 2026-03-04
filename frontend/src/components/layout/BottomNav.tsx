import { NavLink } from "react-router-dom";
import { LayoutDashboard, LineChart, Briefcase, Eye, GraduationCap } from "lucide-react";
import { cn } from "../../utils/cn";
import { useI18nStore } from "../../store/i18nStore";

type NavKey = "dashboard" | "trading" | "portfolio" | "watchlist" | "practice";

const items: { to: string; key: NavKey; icon: typeof LayoutDashboard }[] = [
  { to: "/dashboard", key: "dashboard", icon: LayoutDashboard },
  { to: "/trade", key: "trading", icon: LineChart },
  { to: "/portfolio", key: "portfolio", icon: Briefcase },
  { to: "/watchlist", key: "watchlist", icon: Eye },
  { to: "/practice", key: "practice", icon: GraduationCap },
];

export const BottomNav = () => {
  const t = useI18nStore((s) => s.t);

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-slate-200/60 dark:bg-slate-900/90 dark:border-slate-700/60 safe-area-bottom"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full text-[11px] font-medium transition-colors",
                isActive
                  ? "text-mero-teal"
                  : "text-slate-500 active:text-slate-700 dark:text-slate-400 dark:active:text-slate-200"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-5 h-5", isActive && "drop-shadow-sm")} />
                <span>{t.nav[item.key]}</span>
                {isActive && (
                  <span className="absolute top-0 inset-x-auto w-8 h-0.5 rounded-full bg-mero-teal" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
