import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { User, LogOut, Bell, Settings, LayoutDashboard, LineChart, Briefcase, Eye, Search, Menu, X } from "lucide-react";
import { cn } from "../../utils/cn";
import { SearchableDropdown } from "../ui/SearchableDropdown";
import { useAuthStore } from "../../store/authStore";

const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/trade", label: "Trading", icon: LineChart },
    { to: "/portfolio", label: "Portfolio", icon: Briefcase },
    { to: "/watchlist", label: "Watchlist", icon: Eye },
];

export const Navbar = ({ className }: { className?: string }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Close dropdowns on outside click */
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) setIsProfileOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setIsNotificationsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-300",
            scrolled ? "glass shadow-lg shadow-slate-200/30" : "bg-white/80 backdrop-blur-md border-b border-slate-200/60",
            className
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                        <img src="/logo.png" alt="ShareSathi" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-bold tracking-tight text-slate-900 hidden sm:inline">
                            Share<span className="text-mero-teal">Sathi</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-1 mx-6">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-mero-teal/10 text-mero-teal"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        {/* Search (Desktop) */}
                        <div className="hidden md:block relative z-50">
                            {isSearchOpen ? (
                                <div className="w-64 animate-fade-in">
                                    <div className="text-black">
                                        <SearchableDropdown
                                            value=""
                                            onChange={(symbol) => {
                                                if (symbol) { navigate(`/trade`, { state: { symbol } }); setIsSearchOpen(false); }
                                            }}
                                            placeholder="Search stocks..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    <Search className="w-4 h-4" />
                                    <span className="text-slate-400">Search…</span>
                                    <kbd className="hidden lg:inline text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono">⌘K</kbd>
                                </button>
                            )}
                        </div>

                        {/* Notifications */}
                        <div ref={notifRef} className="relative z-[100]">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                            </button>

                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scale-in origin-top-right z-[100]">
                                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                                        <p className="text-sm font-bold text-slate-900">Notifications</p>
                                        <button className="text-xs text-mero-teal hover:underline font-medium">Mark all read</button>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-mero-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Bell className="w-4 h-4 text-mero-teal" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-800">Welcome!</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">Your ShareSathi dashboard is ready.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                                                    <LineChart className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-emerald-700">Market Update</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">NEPSE closed with positive sentiment today.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile */}
                        <div ref={profileRef} className="relative z-[100]">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mero-teal to-mero-darkTeal flex items-center justify-center text-white text-xs font-bold">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                                </div>
                                <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                                    {user?.name || 'Account'}
                                </span>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scale-in origin-top-right z-[100]">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-mero-teal/5 to-transparent">
                                        <p className="text-sm font-bold text-slate-900">{user?.name || "My Account"}</p>
                                        {user?.email && <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>}
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setIsProfileOpen(false); navigate("/profile"); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            Settings
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMobileOpen && (
                    <div className="md:hidden pb-4 border-t border-slate-100 animate-slide-down">
                        <div className="pt-3 space-y-1">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={({ isActive }) => cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive ? "bg-mero-teal/10 text-mero-teal" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>
                        <div className="mt-3 px-3 text-black">
                            <SearchableDropdown
                                value=""
                                onChange={(symbol) => {
                                    if (symbol) { navigate(`/trade`, { state: { symbol } }); setIsMobileOpen(false); }
                                }}
                                placeholder="Search stocks..."
                            />
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Navbar;
