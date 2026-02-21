import PublicLayout from "../../components/layout/PublicLayout";

export const About = () => {
    return (
        <PublicLayout showTicker={false}>
            <div className="py-16 px-4 md:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl bg-white border border-slate-200 p-8 rounded-xl shadow-sm">
                    <h1 className="text-3xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">About ShareSathi</h1>
                    <p className="text-slate-600 mb-4 leading-relaxed">
                        ShareSathi is a premier paper trading and stock market analytics platform designed specifically for the Nepalese Stock Exchange (NEPSE). Founded by Oshim Pathan, our goal is to empower investors with real-time data, advanced analytics, and risk-free trading environments.
                    </p>
                    <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Our Mission</h2>
                    <p className="text-slate-600 leading-relaxed">
                        To demystify the stock market for everyone—from beginners to seasoned traders—by providing transparent, accessible, and comprehensive financial tools.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
};

export default About;
