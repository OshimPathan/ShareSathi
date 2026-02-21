import { ChevronUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export const Footer = () => {
    const navigate = useNavigate();

    return (
        <footer className="w-full font-sans">
            {/* Main Footer Body */}
            <div className="bg-[#238b96] text-white pt-12 pb-8 px-6 lg:px-20">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        {/* Column 1 */}
                        <div className="space-y-3 text-sm">
                            <Link to="/" className="block hover:underline">Home</Link>
                            <Link to="/market" className="block hover:underline">Latest Market</Link>
                            <Link to="/market" className="block hover:underline">Daily Stock Quotes</Link>
                            <Link to="/market" className="block hover:underline">Floorsheet</Link>
                            <Link to="/reports" className="block hover:underline">Indices</Link>
                            <Link to="/market" className="block hover:underline">Top Brokers</Link>
                            <Link to="/market" className="block hover:underline">Top Gainers</Link>
                            <Link to="/market" className="block hover:underline">Top Losers</Link>
                        </div>
                        {/* Column 2 */}
                        <div className="space-y-3 text-sm">
                            <Link to="/news" className="block hover:underline">Latest News</Link>
                            <Link to="/news" className="block hover:underline">Popular News</Link>
                            <Link to="/announcements" className="block hover:underline">Announcements</Link>
                            <Link to="/reports" className="block hover:underline">Annual Reports</Link>
                            <Link to="/reports" className="block hover:underline">Quarterly Reports</Link>
                            <Link to="/market" className="block hover:underline">Companies</Link>
                            <Link to="/market" className="block hover:underline">Brokers</Link>
                        </div>
                        {/* Column 3 */}
                        <div className="space-y-3 text-sm">
                            <Link to="/contact" className="block hover:underline">Contact Us</Link>
                            <Link to="/services" className="block hover:underline">Video Tutorials</Link>
                            <Link to="/pricing" className="block hover:underline">Pricing & Plans</Link>
                            <Link to="/about" className="block hover:underline">About Us</Link>
                        </div>

                        {/* Column 4 (Spans 2 on large) */}
                        <div className="lg:col-span-2 space-y-4 text-sm">
                            <div>
                                <h3 className="font-bold text-base mb-2">OSHIM PATHAN / SHARE SATHI</h3>
                                <p>Kathmandu, Nepal</p>
                                <p><span className="font-bold">Phone:</span> (+977) 9800000000</p>
                            </div>
                            <div>
                                <h4 className="font-bold">Contact Info</h4>
                                <p><span className="font-bold">E-mail:</span> oshimpathan@gmail.com</p>
                            </div>
                            <div className="pt-2 border-t border-white/20">
                                <h4 className="font-bold mb-1">Platform</h4>
                                <p>Paper Trading & Analytics</p>
                                <p>Real NEPSE Data</p>
                                <p className="text-white/70 text-xs mt-1">Free educational platform — no real money involved</p>
                            </div>

                            {/* Social Icons Placeholder */}
                            <div className="flex gap-2 pt-4">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white text-[#238b96] flex items-center justify-center rounded font-bold hover:bg-slate-200 transition-colors">f</a>
                                <a href="https://linkedin.com/in" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white text-[#238b96] flex items-center justify-center rounded font-bold hover:bg-slate-200 transition-colors">in</a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white text-[#238b96] flex items-center justify-center rounded font-bold text-[10px] leading-tight text-center hover:bg-slate-200 transition-colors">You<br />Tube</a>
                            </div>
                        </div>
                    </div>

                    {/* Partners Section */}
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center pt-8 border-t border-white/20 gap-8">
                        <div className="flex-1">
                            <h4 className="font-bold mb-3 uppercase text-sm">Platform</h4>
                            <div className="flex flex-wrap gap-3 text-sm">
                                <span className="bg-white/10 text-white px-4 py-1.5 rounded font-medium text-sm border border-white/20">Paper Trading</span>
                                <span className="bg-white/10 text-white px-4 py-1.5 rounded font-medium text-sm border border-white/20">Real NEPSE Data</span>
                                <span className="bg-white/10 text-white px-4 py-1.5 rounded font-medium text-sm border border-white/20">Free to Use</span>
                            </div>
                        </div>

                        <div className="pt-6 lg:pt-0">
                            <button onClick={() => navigate('/login', { state: { register: true } })} className="bg-white text-slate-800 font-medium px-6 py-2 rounded shadow-sm hover:bg-slate-100 transition-colors">
                                Create Free Account
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-12 text-sm max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-2">
                        <p>ShareSathi Paper Trading & Analytics</p>
                        <span className="hidden md:inline">*</span>
                        <p>Built for NEPSE Investors</p>
                        <span className="hidden md:inline">*</span>
                        <p>support@sharesathi.com</p>
                    </div>

                    {/* Scroll to Top */}
                    <div className="flex justify-end mt-4">
                        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="border-2 border-white/50 text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                            <ChevronUp className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Orange Bar */}
            <div className="bg-[#eda34c] text-white text-xs py-4 px-6 lg:px-20">
                <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <p>© {new Date().getFullYear()} - SHARE SATHI. All Rights Reserved</p>

                    <div className="flex items-center gap-2">
                        <span>Powered By:</span>
                        <span className="bg-white text-mero-teal font-bold px-2 py-0.5 rounded text-[10px] tracking-widest border border-slate-200">AI</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/disclaimer" className="hover:underline">Disclaimer</Link>
                        <span>|</span>
                        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
                        <span>|</span>
                        <Link to="/terms" className="hover:underline">Terms of Use</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
