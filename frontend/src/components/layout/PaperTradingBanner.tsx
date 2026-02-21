import { Link } from "react-router-dom";

export const PaperTradingBanner = () => {
    return (
        <div className="bg-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide">
            <span className="mr-1">📋</span>
            PAPER TRADING PLATFORM — Virtual money only. Not a real broker. Not financial advice.{' '}
            <Link to="/disclaimer" className="underline hover:text-amber-100 ml-1">Read Disclaimer</Link>
        </div>
    );
};

export default PaperTradingBanner;
