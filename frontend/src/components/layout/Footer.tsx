import { ChevronUp } from "lucide-react";

export const Footer = () => {
    return (
        <footer className="w-full font-sans">
            {/* Main Footer Body */}
            <div className="bg-[#238b96] text-white pt-12 pb-8 px-6 lg:px-20">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        {/* Column 1 */}
                        <div className="space-y-3 text-sm">
                            <a href="#" className="block hover:underline">Home</a>
                            <a href="#" className="block hover:underline">Latest Market</a>
                            <a href="#" className="block hover:underline">Daily Stock Quotes</a>
                            <a href="#" className="block hover:underline">Floorsheet</a>
                            <a href="#" className="block hover:underline">Indices</a>
                            <a href="#" className="block hover:underline">Top Brokers</a>
                            <a href="#" className="block hover:underline">Top Gainers</a>
                            <a href="#" className="block hover:underline">Top Losers</a>
                        </div>
                        {/* Column 2 */}
                        <div className="space-y-3 text-sm">
                            <a href="#" className="block hover:underline">Latest News</a>
                            <a href="#" className="block hover:underline">Popular News</a>
                            <a href="#" className="block hover:underline">Announcements</a>
                            <a href="#" className="block hover:underline">Annual Reports</a>
                            <a href="#" className="block hover:underline">Quarterly Reports</a>
                            <a href="#" className="block hover:underline">Companies</a>
                            <a href="#" className="block hover:underline">Brokers</a>
                        </div>
                        {/* Column 3 */}
                        <div className="space-y-3 text-sm">
                            <a href="mailto:oshimpathan@gmail.com" className="block hover:underline">Contact Us</a>
                            <a href="#" className="block hover:underline">Video Tutorials</a>
                            <a href="#bank-details" className="block hover:underline">Bank Accounts</a>
                            <a href="#" className="block hover:underline">About Us</a>
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
                            <div id="bank-details" className="pt-2 border-t border-white/20">
                                <h4 className="font-bold mb-1">Bank Account Details</h4>
                                <p>NIC Asia Bank</p>
                                <p><span className="font-bold">A/C Name:</span> Oshim Pathan</p>
                                <p><span className="font-bold">A/C Number:</span> 1234567890123456</p>
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
                            <h4 className="font-bold mb-3 uppercase text-sm">Payment Partners</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-white text-purple-600 px-4 py-1.5 rounded font-bold text-sm">Ncell</span>
                                <span className="bg-[#60bb46] text-white px-4 py-1.5 rounded font-bold tracking-tight text-sm">eSewa</span>
                                <span className="bg-white text-blue-600 px-4 py-1.5 rounded font-bold text-sm border border-blue-600">connect IPS</span>
                                <span className="bg-purple-700 text-white px-4 py-1.5 rounded font-bold text-sm">Khalti</span>
                                <span className="bg-red-600 text-white px-4 py-1.5 rounded font-bold text-sm">IME pay</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3 uppercase text-sm">We Accept</h4>
                            <div className="flex gap-2">
                                <span className="bg-white text-blue-800 px-4 py-1.5 rounded font-bold text-sm italic border border-slate-300">VISA</span>
                                <span className="bg-white text-slate-800 px-4 py-1.5 rounded font-bold text-xs flex flex-col items-center leading-tight border border-slate-300">
                                    <span className="text-blue-600">VERIFIED</span>
                                    <span>by VISA</span>
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 lg:pt-0">
                            <button className="bg-white text-slate-800 font-medium px-6 py-2 rounded shadow-sm hover:bg-slate-100 transition-colors">
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

                    <p>Disclaimer, Privacy & Terms of Use</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
