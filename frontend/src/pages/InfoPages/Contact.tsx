import { useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";

export const Contact = () => {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 4000);
    };

    return (
        <PublicLayout showTicker={false}>
            <div className="py-16 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 rounded-xl shadow-sm">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Contact Us</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-xl font-bold mb-4 dark:text-white">Get in Touch</h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">Have questions or need assistance? Reach out to Oshim Pathan and the ShareSathi team.</p>

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

                        <form className="space-y-4" onSubmit={handleSubmit}>
                            {submitted && (
                                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-medium">
                                    Thanks for the message! We'll get back to you soon.
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                                <input type="text" required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input type="email" required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="your@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                                <textarea rows={4} required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" className="bg-mero-teal hover:bg-mero-darkTeal text-white font-bold py-2.5 px-6 rounded-lg transition-colors w-full">
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
