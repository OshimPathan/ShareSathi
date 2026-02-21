import { useState, useEffect, useRef } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { User, LogOut, Bell, Settings, LayoutDashboard, LineChart, Briefcase, Eye, Search, Menu, X, Sun, Moon, Monitor } from "lucide-react";
import { cn } from "../../utils/cn";
import { SearchableDropdown } from "../ui/SearchableDropdown";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";
import { useI18nStore, type Locale } from "../../store/i18nStore";

type NavKey = "dashboard" | "trading" | "portfolio" | "watchlist";
const navItems: { to: string; key: NavKey; icon: typeof LayoutDashboard }[] = [
    { to: "/dashboard", key: "dashboard", icon: LayoutDashboard },
    { to: "/trade", key: "trading", icon: LineChart },
    { to: "/portfolio", key: "portfolio", icon: Briefcase },
    { to: "/watchlist", key: "watchlist", icon: Eye },
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
    const { theme, setTheme } = useThemeStore();
    const { locale, setLocale } = useI18nStore();
    const t = useI18nStore((s) => s.t);

    const toggleLocale = () => setLocale(locale === "en" ? "ne" : "en" as Locale);

    const cycleTheme = () => {
        const order: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
        const next = order[(order.indexOf(theme) + 1) % order.length];
        setTheme(next);
    };

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

    /* ⌘K / Ctrl+K keyboard shortcut to toggle search */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <header className={cn(
            "sticky top-0 z-50 w-full transition-all duration-300",
            scrolled ? "glass shadow-lg shadow-slate-200/30 dark:shadow-slate-900/40" : "bg-white/80 backdrop-blur-md border-b border-slate-200/60 dark:bg-slate-900/80 dark:border-slate-700/60",
            className
        )}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                        <img src="/logo.png" alt="ShareSathi" className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                        <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white hidden sm:inline">
                            Share<span className="text-mero-teal">Sathi</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <nav className="hidden md:flex items-center gap-1 mx-6" aria-label="Main navigation">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-mero-teal/10 text-mero-teal"
                                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {t.nav[item.key]}
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
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                >
                                    <Search className="w-4 h-4" />
                                    <span className="text-slate-400">Search…</span>
                                    <kbd className="hidden lg:inline text-[10px] text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono dark:bg-slate-700 dark:border-slate-600">⌘K</kbd>
                                </button>
                            )}
                        </div>

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLocale}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 text-xs font-bold"
                            aria-label={`Language: ${locale === 'en' ? 'English' : 'नेपाली'}`}
                            title={`Switch to ${locale === 'en' ? 'नेपाली' : 'English'}`}
                        >
                            {locale === "en" ? "ने" : "EN"}
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={cycleTheme}
                            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                            aria-label={`Theme: ${theme}`}
                            title={`Theme: ${theme}`}
                        >
                            {theme === "dark" ? <Moon className="w-5 h-5" /> : theme === "light" ? <Sun className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                        </button>

                        {/* Notifications */}
                        <div ref={notifRef} className="relative z-[100]">
                            <button
                                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                                className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800"
                                aria-label="Notifications"
                                aria-expanded={isNotificationsOpen}
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                            </button>

                            {isNotificationsOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scale-in origin-top-right z-[100] dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/50">
                                    <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center dark:border-slate-700">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Notifications</p>
                                        <button className="text-xs text-mero-teal hover:underline font-medium">Mark all read</button>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        <div className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer dark:border-slate-700 dark:hover:bg-slate-700/50">
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-full bg-mero-teal/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Bell className="w-4 h-4 text-mero-teal" />
                                                </div>
                                                <div>
                                                     <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Welcome!</p>
                                                    <p className="text-xs text-slate-500 mt-0.5 dark:text-slate-400">Your ShareSathi dashboard is ready.</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer dark:hover:bg-slate-700/50">
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
                                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors dark:hover:bg-slate-800"
                                aria-label="Account menu"
                                aria-expanded={isProfileOpen}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-mero-teal to-mero-darkTeal flex items-center justify-center text-white text-xs font-bold">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                                </div>
                                <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[100px] truncate dark:text-slate-300">
                                    {user?.name || 'Account'}
                                </span>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden animate-scale-in origin-top-right z-[100] dark:bg-slate-800 dark:border-slate-700 dark:shadow-slate-900/50">
                                    <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-mero-teal/5 to-transparent dark:border-slate-700">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || "My Account"}</p>
                                        {user?.email && <p className="text-xs text-slate-500 truncate mt-0.5 dark:text-slate-400">{user.email}</p>}
                                    </div>
                                    <div className="py-1">
                                        <button
                                            onClick={() => { setIsProfileOpen(false); navigate("/profile"); }}
                                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors dark:text-slate-300 dark:hover:bg-slate-700"
                                        >
                                            <Settings className="w-4 h-4 text-slate-400" />
                                            {t.nav.settings}
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors dark:hover:bg-rose-500/10"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            {t.nav.logout}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors dark:text-slate-400 dark:hover:bg-slate-800"
                            aria-label="Toggle mobile menu"
                            aria-expanded={isMobileOpen}
                        >
                            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav */}
                {isMobileOpen && (
                    <div className="md:hidden pb-4 border-t border-slate-100 animate-slide-down dark:border-slate-700">
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
                                    {t.nav[item.key]}
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
