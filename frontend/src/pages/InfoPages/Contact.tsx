import { useState } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import SEO from '../../components/ui/SEO';
import insforge from "../../lib/insforge";

export const Contact = () => {
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;

        try {
            const { error: dbError } = await insforge.database.from("contact_submissions").insert([
                { name, email, message, created_at: new Date().toISOString() },
            ]);

            if (dbError) throw dbError;

            setSubmitted(true);
            form.reset();
            setTimeout(() => setSubmitted(false), 5000);
        } catch (err: unknown) {
            console.error("Contact form error:", err);
            setError("Failed to send message. Please try emailing us directly.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PublicLayout showTicker={false}>
            <SEO title="Contact Us" description="Get in touch with the ShareSathi team. Questions, feedback, or support — we're here to help." canonical="/contact" />
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
                            {error && (
                                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-medium">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                                <input type="text" name="name" required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="Your name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                                <input type="email" name="email" required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="your@email.com" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                                <textarea rows={4} name="message" required className="w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg p-2.5 focus:ring-2 focus:ring-mero-teal outline-none" placeholder="How can we help?"></textarea>
                            </div>
                            <button type="submit" disabled={loading} className="bg-mero-teal hover:bg-mero-darkTeal disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-2.5 px-6 rounded-lg transition-colors w-full">
                                {loading ? "Sending..." : "Send Message"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Contact;
