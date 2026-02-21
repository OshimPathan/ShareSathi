import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getTopGainers, getTopLosers } from '../../services/db';
import type { Stock } from '../../types';

export const Ticker = () => {
    const [tickerData, setTickerData] = useState<Stock[]>([]);

    useEffect(() => {
        const fetchTickerData = async () => {
            const [gainers, losers] = await Promise.all([
                getTopGainers(10),
                getTopLosers(5),
            ]);
            const combined = [...gainers, ...losers].sort(() => Math.random() - 0.5);
            setTickerData(combined);
        };
        fetchTickerData();
    }, []);

    if (tickerData.length === 0) return null;

    return (
        <div className="bg-slate-800 text-white text-xs py-1.5 overflow-hidden w-full border-b border-slate-700 shadow-sm relative flex items-center h-8">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-mero-orange font-bold flex items-center justify-center z-10 shadow-[4px_0_10px_rgba(0,0,0,0.3)]">
                LIVE MARKET
            </div>

            <div className="flex animate-ticker whitespace-nowrap items-center ml-28 group hover:[animation-play-state:paused] cursor-default">
                {[...tickerData, ...tickerData].map((stock, idx) => (
                    <div key={`${stock.symbol}-${idx}`} className="flex items-center mx-6 gap-2 border-r border-slate-600 pr-6">
                        <span className="font-bold text-slate-200">{stock.symbol}</span>
                        <span className="font-mono">{Number(stock.ltp).toFixed(2)}</span>

                        <span className={`flex items-center gap-0.5 font-bold ${Number(stock.percentage_change) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {Number(stock.percentage_change) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(Number(stock.percentage_change)).toFixed(2)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Ticker;
