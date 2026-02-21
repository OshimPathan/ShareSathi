import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, type IChartApi } from 'lightweight-charts';

type ChartType = 'candlestick' | 'area';
type Indicator = 'sma20' | 'sma50' | 'ema12' | 'ema26';

interface TradingChartProps {
    data: { time: string; open: number; high: number; low: number; close: number; volume?: number }[];
    colors?: {
        backgroundColor?: string;
        textColor?: string;
    };
    showControls?: boolean;
}

function computeSMA(data: { close: number }[], period: number): (number | null)[] {
    return data.map((_, i) => {
        if (i < period - 1) return null;
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
        return sum / period;
    });
}

function computeEMA(data: { close: number }[], period: number): (number | null)[] {
    const k = 2 / (period + 1);
    const result: (number | null)[] = [];
    let prev: number | null = null;
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) { result.push(null); continue; }
        if (prev === null) {
            let sum = 0;
            for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
            prev = sum / period;
        } else {
            prev = data[i].close * k + prev * (1 - k);
        }
        result.push(prev);
    }
    return result;
}

const INDICATOR_CONFIG: Record<Indicator, { label: string; color: string; compute: (d: { close: number }[]) => (number | null)[] }> = {
    sma20: { label: 'SMA 20', color: '#f59e0b', compute: (d) => computeSMA(d, 20) },
    sma50: { label: 'SMA 50', color: '#8b5cf6', compute: (d) => computeSMA(d, 50) },
    ema12: { label: 'EMA 12', color: '#06b6d4', compute: (d) => computeEMA(d, 12) },
    ema26: { label: 'EMA 26', color: '#ec4899', compute: (d) => computeEMA(d, 26) },
};

export const TradingChart: React.FC<TradingChartProps> = ({
    data,
    colors = {
        backgroundColor: 'transparent',
        textColor: '#94a3b8',
    },
    showControls = true,
}) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [chartType, setChartType] = useState<ChartType>('candlestick');
    const [activeIndicators, setActiveIndicators] = useState<Set<Indicator>>(new Set());

    const toggleIndicator = (ind: Indicator) => {
        setActiveIndicators(prev => {
            const next = new Set(prev);
            if (next.has(ind)) next.delete(ind); else next.add(ind);
            return next;
        });
    };

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;

        try {
            const isDark = document.documentElement.classList.contains('dark');
            const gridColor = isDark ? 'rgba(51,65,85,0.4)' : 'rgba(226,232,240,0.6)';

            const chart = createChart(chartContainerRef.current, {
                layout: {
                    background: { type: ColorType.Solid, color: colors.backgroundColor || 'transparent' },
                    textColor: colors.textColor || (isDark ? '#94a3b8' : '#64748b'),
                },
                grid: {
                    vertLines: { color: gridColor },
                    horzLines: { color: gridColor },
                },
                width: chartContainerRef.current.clientWidth || 600,
                height: 400,
                timeScale: { timeVisible: false, secondsVisible: false },
                crosshair: { mode: 0 },
                rightPriceScale: { borderVisible: false },
            });
            chartRef.current = chart;

            const sortedData = [...data]
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                .filter((item, index, self) => index === self.findIndex((t) => t.time === item.time));

            if (chartType === 'candlestick') {
                const series = chart.addCandlestickSeries({
                    upColor: '#10b981',
                    downColor: '#ef4444',
                    borderVisible: false,
                    wickUpColor: '#10b981',
                    wickDownColor: '#ef4444',
                });
                series.setData(sortedData as any);
            } else {
                const isPositive = sortedData.length >= 2 && sortedData[sortedData.length - 1].close >= sortedData[0].close;
                const lineColor = isPositive ? '#10b981' : '#ef4444';
                const series = chart.addAreaSeries({
                    lineColor,
                    topColor: isPositive ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)',
                    bottomColor: 'rgba(0,0,0,0)',
                    lineWidth: 2,
                });
                series.setData(sortedData.map(d => ({ time: d.time, value: d.close })) as any);
            }

            // Add volume histogram
            const volumeSeries = chart.addHistogramSeries({
                priceFormat: { type: 'volume' },
                priceScaleId: 'volume',
            });
            chart.priceScale('volume').applyOptions({
                scaleMargins: { top: 0.85, bottom: 0 },
            });
            volumeSeries.setData(sortedData.map(d => ({
                time: d.time,
                value: d.volume || 0,
                color: d.close >= d.open ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
            })) as any);

            // Add indicator overlays
            activeIndicators.forEach(ind => {
                const cfg = INDICATOR_CONFIG[ind];
                const values = cfg.compute(sortedData);
                const lineData = sortedData
                    .map((d, i) => values[i] !== null ? { time: d.time, value: values[i]! } : null)
                    .filter(Boolean) as { time: string; value: number }[];
                if (lineData.length > 0) {
                    const lineSeries = chart.addLineSeries({
                        color: cfg.color,
                        lineWidth: 1,
                        priceLineVisible: false,
                        lastValueVisible: false,
                        crosshairMarkerVisible: false,
                    });
                    lineSeries.setData(lineData as any);
                }
            });

            chart.timeScale().fitContent();

            const resizeObserver = new ResizeObserver(entries => {
                if (entries.length === 0 || entries[0].target !== chartContainerRef.current) return;
                const newRect = entries[0].contentRect;
                if (newRect.width > 0) {
                    chart.applyOptions({ width: newRect.width });
                }
            });
            resizeObserver.observe(chartContainerRef.current);

            return () => {
                resizeObserver.disconnect();
                chart.remove();
                chartRef.current = null;
            };
        } catch (e: any) {
            console.error("Chart Rendering Error:", e);
            setError(e.message);
        }
    }, [data, colors, chartType, activeIndicators]);

    if (error) {
        return <div className="p-4 text-rose-500 bg-rose-500/10 rounded w-full h-full flex items-center justify-center text-sm">Error Rendering Chart: {error}</div>;
    }

    return (
        <div>
            {showControls && (
                <div className="flex items-center gap-2 flex-wrap mb-3 px-1">
                    {/* Chart type toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                        {(['candlestick', 'area'] as ChartType[]).map(t => (
                            <button
                                key={t}
                                onClick={() => setChartType(t)}
                                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                                    chartType === t
                                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {t === 'candlestick' ? '🕯️ Candles' : '📈 Area'}
                            </button>
                        ))}
                    </div>
                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                    {/* Indicator toggles */}
                    {(Object.entries(INDICATOR_CONFIG) as [Indicator, typeof INDICATOR_CONFIG[Indicator]][]).map(([key, cfg]) => (
                        <button
                            key={key}
                            onClick={() => toggleIndicator(key)}
                            className={`px-2 py-1 text-[11px] font-medium rounded-md border transition-all ${
                                activeIndicators.has(key)
                                    ? 'border-current bg-opacity-10'
                                    : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                            style={activeIndicators.has(key) ? { color: cfg.color, backgroundColor: cfg.color + '15', borderColor: cfg.color + '40' } : {}}
                        >
                            {cfg.label}
                        </button>
                    ))}
                </div>
            )}
            <div ref={chartContainerRef} className="w-full h-[400px] relative" />
        </div>
    );
};

