import { NavLink } from "react-router-dom";
import { LayoutDashboard, TrendingUp, Briefcase, LineChart, Settings } from "lucide-react";
import { cn } from "../../utils/cn";

export const Sidebar = ({ className }: { className?: string }) => {
    const links = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Market Live", href: "/trade", icon: TrendingUp },
        { name: "Portfolio", href: "/portfolio", icon: Briefcase },
        { name: "Analytics", href: "/stock/NABIL", icon: LineChart }, // Sample route
    ];

    return (
        <aside className={cn("flex flex-col", className)}>
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    ShareSathi
                </h1>
                <p className="text-xs text-slate-400 mt-1">AI Stock Analytics</p>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.name}
                        to={link.href}
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
                                isActive
                                    ? "bg-blue-600/10 text-blue-400"
                                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                            )
                        }
                    >
                        <link.icon className="w-5 h-5" />
                        {link.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 mt-auto border-t border-slate-700">
                <button className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors text-sm font-medium">
                    <Settings className="w-5 h-5" />
                    Settings
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
