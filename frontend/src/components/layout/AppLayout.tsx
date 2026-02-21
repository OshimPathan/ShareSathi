import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { Footer } from "./Footer";
import Ticker from "../domain/Ticker";
import PaperTradingBanner from "./PaperTradingBanner";

export const AppLayout = () => {
    return (
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 font-sans overflow-x-hidden selection:bg-mero-teal/20">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <PaperTradingBanner />
            <Navbar />
            <Ticker />

            <main id="main-content" className="flex-1 w-full py-6 px-4 md:px-6 lg:px-8" role="main">
                <div className="mx-auto max-w-7xl animate-fade-in">
                    <Outlet />
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default AppLayout;
