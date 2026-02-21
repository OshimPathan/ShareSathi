import { ChevronUp, Mail, MapPin, Github, Linkedin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="w-full font-sans">
            {/* Main Footer */}
            <div className="bg-slate-900 text-white pt-16 pb-10 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
                        {/* Brand Column */}
                        <div className="col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
                                <img src="/logo.png" alt="ShareSathi" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                                <span className="text-xl font-bold tracking-tight">Share<span className="text-mero-teal">Sathi</span></span>
                            </Link>
                            <p className="text-sm text-slate-400 leading-relaxed max-w-xs mb-5">
                                Nepal's free paper trading platform. Practice with real NEPSE data and virtual money.
                            </p>
                            <div className="space-y-2 text-sm text-slate-400">
                                <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500" /> Kathmandu, Nepal</div>
                                <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" /> oshimpathan@gmail.com</div>
                            </div>
                            <div className="flex gap-2 mt-5">
                                <a href="https://github.com/OshimPathan" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-mero-teal text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300">
                                    <Github className="w-4 h-4" />
                                </a>
                                <a href="https://linkedin.com/in/oshimpathan" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-mero-teal text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300">
                                    <Linkedin className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Platform */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Platform</h4>
                            <div className="space-y-2.5 text-sm text-slate-400">
                                <Link to="/market" className="block hover:text-mero-teal transition-colors">Live Market</Link>
                                <Link to="/screener" className="block hover:text-mero-teal transition-colors">Stock Screener</Link>
                                <Link to="/leaderboard" className="block hover:text-mero-teal transition-colors">Leaderboard</Link>
                                <Link to="/news" className="block hover:text-mero-teal transition-colors">News</Link>
                                <Link to="/ipo" className="block hover:text-mero-teal transition-colors">IPO</Link>
                                <Link to="/pricing" className="block hover:text-mero-teal transition-colors">Pricing</Link>
                                <Link to="/dashboard" className="block hover:text-mero-teal transition-colors">Dashboard</Link>
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Company</h4>
                            <div className="space-y-2.5 text-sm text-slate-400">
                                <Link to="/about" className="block hover:text-mero-teal transition-colors">About Us</Link>
                                <Link to="/contact" className="block hover:text-mero-teal transition-colors">Contact</Link>
                                <Link to="/disclaimer" className="block hover:text-mero-teal transition-colors">Disclaimer</Link>
                                <Link to="/privacy" className="block hover:text-mero-teal transition-colors">Privacy Policy</Link>
                                <Link to="/terms" className="block hover:text-mero-teal transition-colors">Terms of Use</Link>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="col-span-2 md:col-span-1">
                            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Get Started</h4>
                            <p className="text-sm text-slate-400 mb-4">Free forever. No credit card needed.</p>
                            <button
                                onClick={() => navigate('/login', { state: { register: true } })}
                                className="bg-mero-teal hover:bg-mero-darkTeal text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-all duration-300 hover:shadow-lg hover:shadow-mero-teal/20"
                            >
                                Create Free Account
                            </button>
                        </div>
                    </div>

                    {/* Bottom divider */}
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-slate-500">
                            © {new Date().getFullYear()} ShareSathi. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">Paper Trading Platform <span className="text-mero-teal">·</span> Real NEPSE Data</span>
                        </div>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-mero-teal text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
