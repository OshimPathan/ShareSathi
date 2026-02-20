import React, { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';

interface TradingChartProps {
    data: { time: string; open: number; high: number; low: number; close: number }[];
    colors?: {
        backgroundColor?: string;
        lineColor?: string;
        textColor?: string;
        areaTopColor?: string;
        areaBottomColor?: string;
    };
}

export const TradingChart: React.FC<TradingChartProps> = ({
    data,
    colors = {
        backgroundColor: 'transparent',
        lineColor: '#2962FF',
        textColor: '#94a3b8',
        areaTopColor: '#2962FF',
        areaBottomColor: 'rgba(41, 98, 255, 0.28)',
    }
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = React.useState<string | null>(null);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        try {
            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: colors.backgroundColor },
                    textColor: colors.textColor,
                },
                grid: {
                    vertLines: { color: '#1e293b' },
                    horzLines: { color: '#1e293b' },
                },
                width: chartContainerRef.current.clientWidth || 600,
                height: 400,
                timeScale: {
                    timeVisible: true,
                    secondsVisible: false,
                }
            });

            const candlestickSeries = chart.addCandlestickSeries({
                upColor: '#10b981',
                downColor: '#ef4444',
                borderVisible: false,
                wickUpColor: '#10b981',
                wickDownColor: '#ef4444'
            });

            // Ensure data is sorted by time and formatted correctly
            const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

            // Remove duplicates
            const uniqueData = sortedData.filter((item, index, self) =>
                index === self.findIndex((t) => t.time === item.time)
            );

            candlestickSeries.setData(uniqueData as any);
            chart.timeScale().fitContent();

            const resizeObserver = new ResizeObserver(entries => {
                if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return;
                const newRect = entries[0].contentRect;
                if (newRect.width > 0 && newRect.height > 0) {
                    chart.applyOptions({ width: newRect.width, height: newRect.height });
                }
            });
            resizeObserver.observe(chartContainerRef.current);

            return () => {
                resizeObserver.disconnect();
                chart.remove();
            };
        } catch (e: any) {
            console.error("Chart Rendering Error:", e);
            setError(e.message);
        }
    }, [data, colors]);

    if (error) {
        return <div className="p-4 text-rose-500 bg-rose-500/10 rounded w-full h-full flex items-center justify-center">Error Rendering Chart: {error}</div>;
    }

    return <div ref={chartContainerRef} className="w-full h-[400px] relative" />;
};
