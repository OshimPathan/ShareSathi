import PublicLayout from "../../components/layout/PublicLayout";

export const PrivacyPolicy = () => {
    return (
        <PublicLayout showTicker={false}>
            <div className="py-16 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm prose prose-slate max-w-none">
                    <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Privacy Policy</h1>
                    <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. Information We Collect</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        When you create an account on ShareSathi, we collect:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                        <li><strong>Account information:</strong> Email address, name (optional), and authentication credentials</li>
                        <li><strong>Usage data:</strong> Paper trading activity, watchlist preferences, and platform interactions</li>
                        <li><strong>Technical data:</strong> IP address, browser type, and device information for security and analytics</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                        <li>To provide and maintain your paper trading account</li>
                        <li>To track your virtual portfolio performance</li>
                        <li>To send important account notifications</li>
                        <li>To improve our platform and user experience</li>
                        <li>To prevent abuse and ensure platform security</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. Data Storage & Security</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        Your data is stored securely using InsForge Backend-as-a-Service with encrypted database connections.
                        Passwords are hashed using industry-standard algorithms and are never stored in plain text.
                        We implement rate limiting, CORS policies, and authentication tokens to protect your account.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Data Sharing</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        We do <strong>NOT</strong> sell, trade, or share your personal information with third parties.
                        Your paper trading data is private and only accessible by you. We may share anonymized,
                        aggregated statistics for analytics purposes.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. Cookies & Local Storage</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        We use authentication tokens stored in your browser to maintain your login session.
                        No third-party tracking cookies are used.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">6. Your Rights</h2>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                        <li>Access your personal data at any time through your profile</li>
                        <li>Request deletion of your account and associated data</li>
                        <li>Update your profile information</li>
                        <li>Opt out of non-essential communications</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">7. Contact Us</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        For any privacy-related questions or data deletion requests, contact us at{' '}
                        <a href="mailto:oshimpathan@gmail.com" className="text-blue-600 hover:underline">oshimpathan@gmail.com</a>.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">8. Changes to This Policy</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        We may update this Privacy Policy from time to time. Changes will be posted on this page with an
                        updated revision date. Continued use of the platform constitutes acceptance of the updated policy.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
};

export default PrivacyPolicy;
