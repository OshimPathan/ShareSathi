import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { SearchableDropdown } from "../ui/SearchableDropdown";

export const PublicNavbar = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = [
        { label: "⌂", to: "/" },
        { label: "Market", to: "/market" },
        { label: "News", to: "/news" },
        { label: "Announcements", to: "/announcements" },
        { label: "Reports", to: "/reports" },
        { label: "Portfolio", to: "/portfolio-info" },
        { label: "IPO", to: "/ipo" },
        { label: "Services", to: "/services" },
    ];

    return (
        <header className="flex flex-col w-full z-50">
            {/* Top Orange Header Bar */}
            <div className="bg-mero-orange text-white text-xs py-2 px-4 lg:px-20 hidden md:flex justify-between items-center w-full">
                <div>
                    <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-4">
                    <a href="mailto:oshimpathan@gmail.com" className="flex items-center gap-1 hover:underline">✉ oshimpathan@gmail.com</a>
                    <span className="flex items-center gap-1">📞 (+977) 9800000000</span>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-[10px] tracking-wider transition-colors ml-2 rounded-sm shadow-sm cursor-pointer">ENGLISH</button>
                    <button onClick={() => navigate('/login', { state: { register: true } })} className="bg-[#238b96] hover:bg-[#1c6f78] text-white px-3 py-1 text-[10px] tracking-wider transition-colors rounded-sm shadow-sm cursor-pointer">Create Free Account</button>
                    <button className="bg-[#60bb46] hover:bg-[#4ea037] text-white px-3 py-1 flex items-center text-[10px] tracking-wider transition-colors rounded-sm shadow-sm cursor-pointer">HELP ▾</button>
                    <NavLink to="/about" className="hover:underline cursor-pointer">About Us</NavLink>
                    <NavLink to="/contact" className="hover:underline cursor-pointer">Contact Us</NavLink>
                </div>
            </div>

            {/* Logo Area */}
            <div className="bg-white w-full py-4 px-4 lg:px-20 border-b border-slate-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="ShareSathi Logo" className="w-12 h-12 mr-3" />
                        <div className="flex flex-col">
                            <span className="text-3xl font-bold tracking-tight text-slate-800 uppercase" style={{ fontFamily: 'Arial, sans-serif' }}>SHARE SATHI</span>
                            <span className="text-xs text-slate-500 italic mt-[-2px]">For the Investor...</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="md:hidden">
                            <button onClick={() => navigate('/login', { state: { register: true } })} className="bg-mero-teal hover:bg-mero-darkTeal text-white px-3 py-2 text-xs font-bold rounded shadow-sm">
                                Sign Up
                            </button>
                        </div>
                        <button className="md:hidden text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Navigation (Teal) */}
            <nav className="bg-mero-teal w-full text-white px-4 lg:px-20 flex flex-col md:flex-row justify-between items-center py-2 shadow-sm sticky top-0 z-50 gap-3 md:gap-0">
                <div className="hidden md:flex items-center gap-6 text-sm font-medium w-auto overflow-x-auto pb-0 scrollbar-hide shrink-0">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `hover:text-slate-200 transition-colors whitespace-nowrap ${isActive && item.to !== "/" ? "text-mero-orange font-bold border-b-2 border-mero-orange" : ""}`
                            }
                            end={item.to === "/"}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <NavLink to="/dashboard" className="font-bold relative flex items-center whitespace-nowrap hover:text-slate-200 transition-colors">
                        Dashboard
                        <span className="absolute -top-3 -right-6 bg-mero-orange text-white text-[10px] px-1 rounded shadow-sm">New</span>
                    </NavLink>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end mt-0">
                    <div className="flex bg-white rounded overflow-visible w-full md:w-64 relative z-50">
                        <div className="flex-1 w-full text-black">
                            <SearchableDropdown
                                value=""
                                onChange={(symbol) => {
                                    if (symbol) navigate(`/market`, { state: { symbol } });
                                }}
                                placeholder="Search symbol..."
                            />
                        </div>
                        <button className="bg-mero-orange text-white px-3 hover:bg-opacity-90 transition-colors border-l border-mero-orange/20 shrink-0 rounded-r">
                            🔍
                        </button>
                    </div>
                    <button onClick={() => navigate('/login')} className="hidden md:flex items-center gap-1 font-medium hover:text-slate-200 transition-colors text-sm ml-2 whitespace-nowrap">
                        👤 Log In
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-mero-teal text-white px-4 py-4 space-y-3 border-t border-white/20">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className="block py-2 px-3 hover:bg-white/10 rounded transition-colors text-sm font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                    <NavLink
                        to="/dashboard"
                        className="block py-2 px-3 hover:bg-white/10 rounded transition-colors text-sm font-bold"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Dashboard ✨
                    </NavLink>
                    <div className="flex gap-2 pt-2 border-t border-white/20">
                        <button onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="flex-1 bg-white text-mero-teal font-bold py-2 rounded text-sm">
                            Log In
                        </button>
                        <button onClick={() => { navigate('/login', { state: { register: true } }); setMobileMenuOpen(false); }} className="flex-1 bg-mero-orange text-white font-bold py-2 rounded text-sm">
                            Sign Up
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default PublicNavbar;
