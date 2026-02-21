import type { ReactNode } from "react";
import { PublicNavbar } from "./PublicNavbar";
import { Footer } from "./Footer";
import Ticker from "../domain/Ticker";
import PaperTradingBanner from "./PaperTradingBanner";

interface PublicLayoutProps {
    children: ReactNode;
    showTicker?: boolean;
}

export const PublicLayout = ({ children, showTicker = true }: PublicLayoutProps) => {
    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans selection:bg-mero-teal/20 overflow-x-hidden flex flex-col">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <PaperTradingBanner />
            <PublicNavbar />
            {showTicker && <Ticker />}
            <main id="main-content" className="flex-1 w-full" role="main">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
