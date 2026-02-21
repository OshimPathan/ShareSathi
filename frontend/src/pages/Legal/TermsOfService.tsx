import PublicLayout from "../../components/layout/PublicLayout";

export const TermsOfService = () => {
    return (
        <PublicLayout showTicker={false}>
            <div className="py-16 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm prose prose-slate max-w-none">
                    <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Terms of Service</h1>
                    <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">1. Acceptance of Terms</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        By accessing or using ShareSathi ("the Platform"), you agree to be bound by these Terms of Service.
                        If you do not agree with any part of these terms, you may not use the Platform.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">2. Nature of the Platform</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        ShareSathi is a <strong>paper trading simulator and educational tool</strong> for the Nepal Stock Exchange (NEPSE).
                        Key points:
                    </p>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                        <li>All trades are simulated using virtual money (Rs. 1,000,000 starting balance)</li>
                        <li>No real securities are purchased, sold, or held</li>
                        <li>ShareSathi is NOT a licensed broker, dealer, or investment advisor</li>
                        <li>The Platform is not registered with SEBON or any regulatory authority</li>
                        <li>Some financial data (fundamentals, AI forecasts) are estimated/simulated</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">3. User Accounts</h2>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                        <li>You must provide a valid email address to create an account</li>
                        <li>You are responsible for maintaining the security of your account</li>
                        <li>One account per person; multiple accounts may be terminated</li>
                        <li>You must be at least 16 years of age to use this Platform</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">4. Acceptable Use</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">You agree NOT to:</p>
                    <ul className="list-disc pl-6 text-slate-600 space-y-2 mb-4">
                        <li>Use the Platform for any illegal purpose</li>
                        <li>Attempt to manipulate or exploit the trading system</li>
                        <li>Use automated scripts or bots to interact with the Platform without permission</li>
                        <li>Scrape, copy, or redistribute Platform data without authorization</li>
                        <li>Impersonate another user or misrepresent your identity</li>
                    </ul>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">5. Intellectual Property</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        All content, designs, code, and branding on ShareSathi are the intellectual property of the Platform creators.
                        NEPSE market data is sourced from publicly available APIs and remains the property of Nepal Stock Exchange Ltd.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">6. No Financial Advice</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        Nothing on this Platform constitutes financial advice. All information is provided for educational and
                        demonstration purposes only. See our <a href="/disclaimer" className="text-blue-600 hover:underline">Disclaimer</a> for
                        complete details.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">7. Limitation of Liability</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        ShareSathi and its creators shall not be liable for any direct, indirect, incidental, or consequential
                        damages arising from the use of or inability to use the Platform. This includes, but is not limited to,
                        any losses resulting from reliance on simulated data or paper trading results.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">8. Termination</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        We reserve the right to suspend or terminate accounts that violate these Terms of Service.
                        You may delete your account at any time by contacting support.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">9. Changes to Terms</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        We may modify these Terms at any time. Continued use of the Platform after changes constitutes acceptance
                        of the new Terms. We will make reasonable efforts to notify users of significant changes.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">10. Governing Law</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        These Terms shall be governed by and construed in accordance with the laws of Nepal.
                        Any disputes shall be subject to the jurisdiction of courts in Kathmandu, Nepal.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">11. Contact</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        For questions about these Terms, contact us at{' '}
                        <a href="mailto:oshimpathan@gmail.com" className="text-blue-600 hover:underline">oshimpathan@gmail.com</a>.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
};

export default TermsOfService;
