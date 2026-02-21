import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { User, LogOut, Bell } from "lucide-react";
import { cn } from "../../utils/cn";
import { SearchableDropdown } from "../ui/SearchableDropdown";

export const Navbar = ({ className }: { className?: string }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        navigate("/login");
    };

    return (
        <header className={cn("flex flex-col w-full z-50 shadow-sm", className)}>
            {/* Top Orange Header Bar */}
            <div className="bg-mero-orange text-white text-xs py-2 px-4 lg:px-20 hidden md:flex justify-between items-center w-full">
                <div>
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4">
                    <a href="mailto:oshimpathan@gmail.com" className="flex items-center gap-1 hover:underline">✉ oshimpathan@gmail.com</a>
                    <span className="flex items-center gap-1">📞 (+977) 9800000000</span>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-[10px] tracking-wider transition-colors ml-2 rounded-sm shadow-sm cursor-pointer" onClick={() => alert("English Language Selected")}>ENGLISH</button>
                    <button className="bg-[#60bb46] hover:bg-[#4ea037] text-white px-3 py-1 flex items-center text-[10px] tracking-wider transition-colors rounded-sm shadow-sm cursor-pointer" onClick={() => alert("Opening Help Center...")}>HELP ▾</button>
                    <a href="#" className="hover:underline cursor-pointer">About Us</a>
                    <a href="#" className="hover:underline cursor-pointer">Contact Us</a>
                </div>
            </div>

            {/* Logo Area */}
            <div className="bg-white w-full py-4 px-4 lg:px-20 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <img src="/logo.png" alt="ShareSathi Logo" className="w-12 h-12 mr-3" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold tracking-tight text-slate-800 uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>SHARE SATHI</span>
                            <span className="text-xs text-slate-500 italic mt-[-2px]">For the Investor...</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation (Teal) */}
            <nav className="bg-mero-teal w-full text-white px-4 lg:px-20 flex flex-col md:flex-row justify-between items-center py-2 h-auto md:h-12 overflow-visible relative">
                <div className="flex items-center gap-6 text-sm font-medium w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide shrink-0">
                    <NavLink to="/dashboard" className={({ isActive }) => cn("hover:text-slate-200 transition-colors whitespace-nowrap", isActive ? "text-mero-orange font-bold border-b-2 border-mero-orange" : "")}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/trade" className={({ isActive }) => cn("hover:text-slate-200 transition-colors whitespace-nowrap", isActive ? "text-mero-orange font-bold border-b-2 border-mero-orange" : "")}>
                        Active Trading
                    </NavLink>
                    <NavLink to="/portfolio" className={({ isActive }) => cn("hover:text-slate-200 transition-colors whitespace-nowrap", isActive ? "text-mero-orange font-bold border-b-2 border-mero-orange" : "")}>
                        Portfolio
                    </NavLink>
                    <NavLink to="/watchlist" className={({ isActive }) => cn("hover:text-slate-200 transition-colors whitespace-nowrap", isActive ? "text-mero-orange font-bold border-b-2 border-mero-orange" : "")}>
                        Watchlist
                    </NavLink>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-2 md:mt-0 relative overflow-visible">
                    <div className="flex bg-white rounded overflow-visible w-full md:w-64 relative z-50">
                        <div className="flex-1 w-full text-black">
                            <SearchableDropdown
                                value=""
                                onChange={(symbol) => {
                                    if (symbol) navigate(`/trade`, { state: { symbol } });
                                }}
                                placeholder="Search symbol..."
                            />
                        </div>
                        <button className="bg-mero-orange text-white px-3 hover:bg-opacity-90 transition-colors border-l border-mero-orange/20 shrink-0 rounded-r">
                            🔍
                        </button>
                    </div>

                    {/* Notifications Dropdown */}
                    <div className="relative z-[100] ml-2">
                        <div
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="h-8 w-8 rounded-full bg-white text-mero-orange border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors relative"
                        >
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-white"></span>
                        </div>

                        {isNotificationsOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded shadow-xl overflow-hidden py-1 z-[100]">
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                    <p className="text-sm text-slate-800 font-bold">Notifications</p>
                                    <button className="text-xs text-blue-600 hover:underline">Mark all read</button>
                                </div>
                                <div className="px-4 py-3 text-sm text-slate-800 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <p className="font-bold">Welcome Oshim Pathan!</p>
                                    <p className="text-xs text-slate-500 mt-1">Your ShareSathi dashboard is ready.</p>
                                </div>
                                <div className="px-4 py-3 text-sm text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer">
                                    <p className="font-bold text-emerald-600">NICA Dividend Alert</p>
                                    <p className="text-xs text-slate-500 mt-1">NICA has announced a 10% dividend.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile Dropdown */}
                    <div className="relative z-[100]">
                        <div
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="h-8 w-8 rounded-full bg-white text-mero-teal border border-slate-200 flex items-center justify-center font-bold cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                            <User className="w-4 h-4" />
                        </div>

                        {isProfileOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded shadow-xl overflow-hidden py-1 z-[100]">
                                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                                    <p className="text-sm text-slate-800 font-bold">My Account</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
