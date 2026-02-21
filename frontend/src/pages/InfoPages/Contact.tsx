import PublicLayout from "../../components/layout/PublicLayout";

export const Contact = () => {
    return (
        <PublicLayout showTicker={false}>
            <div className="py-16 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
                    <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Contact Us</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4">Get in Touch</h2>
                            <p className="text-slate-600 mb-6">Have questions or need assistance? Reach out to Oshim Pathan and the ShareSathi team.</p>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-mero-teal/10 text-mero-darkTeal flex items-center justify-center font-bold">✉</div>
                                    <div>
                                        <p className="font-bold text-sm">Email</p>
                                        <p className="text-slate-600">oshimpathan@gmail.com</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-mero-teal/10 text-mero-darkTeal flex items-center justify-center font-bold">📞</div>
                                    <div>
                                        <p className="font-bold text-sm">Phone</p>
                                        <p className="text-slate-600">+977 9800000000</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-mero-teal/10 text-mero-darkTeal flex items-center justify-center font-bold">📍</div>
                                    <div>
                                        <p className="font-bold text-sm">Location</p>
                                        <p className="text-slate-600">Kathmandu, Nepal</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Thanks for the message! We will get back to you soon."); }}>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Your Name</label>
                                <input type="text" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="Oshim Pathan" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input type="email" className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="oshimpathan@gmail.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea rows={4} className="w-full border border-slate-300 rounded p-2 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" className="bg-mero-teal hover:bg-mero-darkTeal text-white font-bold py-2 px-6 rounded transition-colors w-full">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Contact;
