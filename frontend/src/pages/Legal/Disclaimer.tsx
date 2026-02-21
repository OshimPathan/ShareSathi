import PublicLayout from "../../components/layout/PublicLayout";

export const Disclaimer = () => {
    return (
        <PublicLayout showTicker={false}>
            <div className="py-16 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm prose prose-slate max-w-none">
                    <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Disclaimer</h1>
                    <p className="text-sm text-slate-500 mb-6">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Paper Trading Platform</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        ShareSathi is a <strong>paper trading and educational platform</strong>. All trades executed on this platform use virtual money.
                        No real securities are bought, sold, or held on behalf of any user. ShareSathi is NOT a broker, dealer, or registered
                        investment advisor with SEBON (Securities Board of Nepal) or any other regulatory body.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Market Data</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        Stock prices, indices, and volume data are sourced from NEPSE and are provided on an "as-is" basis.
                        While we strive for accuracy, data may be delayed or incomplete. <strong>Fundamental metrics
                        (EPS, P/E ratio, Book Value, Dividend Yield, PBV, Market Cap)</strong> displayed on this platform are
                        <strong> estimated/simulated values</strong> generated for educational purposes only. They do NOT reflect
                        actual company financials.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">AI Forecasts & Signals</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        Any AI-generated forecasts, buy/sell signals, confidence scores, or technical analysis displayed on this
                        platform are <strong>simulated and randomly generated</strong> for demonstration purposes. They are NOT based
                        on real machine learning models, actual technical analysis, or genuine market research. Do NOT use them
                        for real investment decisions.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">No Financial Advice</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        Nothing on this platform constitutes financial advice, investment recommendation, or solicitation to buy or
                        sell securities. Users should consult qualified financial advisors before making real investment decisions.
                        Always conduct your own research and due diligence.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Limitation of Liability</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        ShareSathi, its creators, and affiliates shall not be liable for any losses, damages, or claims arising
                        from the use of this platform. Users acknowledge that paper trading results do not guarantee real market
                        performance. Past simulated performance is not indicative of future results.
                    </p>

                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-3">Brokerage Fee Simulation</h2>
                    <p className="text-slate-600 leading-relaxed mb-4">
                        The brokerage fees, SEBON fees, and DP charges applied in paper trades are modeled after actual NEPSE fee
                        structures for educational realism. These are virtual deductions and no real money is charged.
                    </p>

                    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-800 font-medium">
                            By using ShareSathi, you acknowledge that you have read and understood this disclaimer and agree that
                            all trading on this platform is simulated and for educational purposes only.
                        </p>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default Disclaimer;
