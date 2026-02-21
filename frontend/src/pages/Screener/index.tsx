import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, SlidersHorizontal, ArrowUpDown, ArrowUp, ArrowDown, X, Bookmark, TrendingUp, TrendingDown, BarChart3, Filter } from "lucide-react";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import PublicLayout from "../../components/layout/PublicLayout";
import { getAllStocks } from "../../services/db";
import type { Stock } from "../../types";

type SortKey = "symbol" | "ltp" | "percentage_change" | "volume" | "turnover" | "high" | "low";
type SortDir = "asc" | "desc";

interface Filters {
  search: string;
  sector: string;
  minPrice: string;
  maxPrice: string;
  minChange: string;
  maxChange: string;
  minVolume: string;
}

const SECTORS = [
  "All Sectors",
  "Commercial Banks",
  "Development Banks",
  "Finance",
  "Hydro Power",
  "Life Insurance",
  "Non Life Insurance",
  "Microfinance",
  "Manufacturing And Processing",
  "Hotels And Tourism",
  "Trading",
  "Others",
  "Investment",
  "Mutual Fund",
];

const ScreenerPage = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("turnover");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    sector: "All Sectors",
    minPrice: "",
    maxPrice: "",
    minChange: "",
    maxChange: "",
    minVolume: "",
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getAllStocks();
      setStocks(data);
      setLoading(false);
    })();
  }, []);

  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    // Text search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          (s.company_name && s.company_name.toLowerCase().includes(q))
      );
    }

    // Sector
    if (filters.sector !== "All Sectors") {
      result = result.filter((s) => s.sector === filters.sector);
    }

    // Price range
    if (filters.minPrice) result = result.filter((s) => s.ltp >= Number(filters.minPrice));
    if (filters.maxPrice) result = result.filter((s) => s.ltp <= Number(filters.maxPrice));

    // Change range
    if (filters.minChange) result = result.filter((s) => s.percentage_change >= Number(filters.minChange));
    if (filters.maxChange) result = result.filter((s) => s.percentage_change <= Number(filters.maxChange));

    // Volume
    if (filters.minVolume) result = result.filter((s) => s.volume >= Number(filters.minVolume));

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortKey] ?? 0;
      const bVal = b[sortKey] ?? 0;
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return result;
  }, [stocks, filters, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const activeFilterCount = [
    filters.sector !== "All Sectors",
    filters.minPrice,
    filters.maxPrice,
    filters.minChange,
    filters.maxChange,
    filters.minVolume,
  ].filter(Boolean).length;

  const clearFilters = () =>
    setFilters({ search: "", sector: "All Sectors", minPrice: "", maxPrice: "", minChange: "", maxChange: "", minVolume: "" });

  // Stats
  const gainers = stocks.filter((s) => s.percentage_change > 0).length;
  const losers = stocks.filter((s) => s.percentage_change < 0).length;
  const totalVolume = stocks.reduce((sum, s) => sum + (s.volume || 0), 0);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3 text-mero-teal" /> : <ArrowDown className="w-3 h-3 text-mero-teal" />;
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Stock Screener
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Scan {stocks.length} NEPSE stocks with custom filters
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up delay-100" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
          {[
            { label: "Total Stocks", value: stocks.length, icon: <BarChart3 className="w-4 h-4 text-blue-600" /> },
            { label: "Gainers", value: gainers, icon: <TrendingUp className="w-4 h-4 text-emerald-600" /> },
            { label: "Losers", value: losers, icon: <TrendingDown className="w-4 h-4 text-rose-600" /> },
            { label: "Total Volume", value: totalVolume.toLocaleString(), icon: <BarChart3 className="w-4 h-4 text-purple-600" /> },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  {s.icon}
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</span>
                </div>
                <div className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: "forwards" } as React.CSSProperties}>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by symbol or company name…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mero-teal/30 focus:border-mero-teal dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:focus:bg-slate-700"
            />
          </div>
          <select
            value={filters.sector}
            onChange={(e) => setFilters((f) => ({ ...f, sector: e.target.value }))}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mero-teal/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          >
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-mero-teal text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="animate-slide-down">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-mero-teal" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Advanced Filters</span>
                </div>
                <button onClick={clearFilters} className="text-xs text-mero-teal hover:underline font-medium">
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mero-teal/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Max Price</label>
                  <input
                    type="number"
                    placeholder="∞"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mero-teal/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Min Change %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="-∞"
                    value={filters.minChange}
                    onChange={(e) => setFilters((f) => ({ ...f, minChange: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mero-teal/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Max Change %</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="∞"
                    value={filters.maxChange}
                    onChange={(e) => setFilters((f) => ({ ...f, maxChange: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mero-teal/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Min Volume</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minVolume}
                    onChange={(e) => setFilters((f) => ({ ...f, minVolume: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-mero-teal/30 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Showing <strong className="text-slate-900 dark:text-white">{filteredStocks.length}</strong> of {stocks.length} stocks
          </span>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-mero-teal hover:underline font-medium">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>

        {/* Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  {[
                    { key: "symbol" as SortKey, label: "Symbol", align: "left" },
                    { key: "ltp" as SortKey, label: "LTP (Rs.)", align: "right" },
                    { key: "percentage_change" as SortKey, label: "Change %", align: "right" },
                    { key: "high" as SortKey, label: "High", align: "right" },
                    { key: "low" as SortKey, label: "Low", align: "right" },
                    { key: "volume" as SortKey, label: "Volume", align: "right" },
                    { key: "turnover" as SortKey, label: "Turnover", align: "right" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`px-4 py-3 font-semibold text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-white transition-colors select-none ${
                        col.align === "right" ? "text-right" : "text-left"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label} <SortIcon col={col.key} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-100 dark:border-slate-700/50">
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <Bookmark className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No stocks match your filters</p>
                      <button onClick={clearFilters} className="mt-2 text-xs text-mero-teal hover:underline font-medium">
                        Clear all filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => {
                    const isPositive = stock.percentage_change > 0;
                    const isNegative = stock.percentage_change < 0;
                    return (
                      <tr
                        key={stock.symbol}
                        className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link to={`/stock/${stock.symbol}`} className="group">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-mero-teal transition-colors">
                              {stock.symbol}
                            </span>
                            {stock.company_name && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                                {stock.company_name}
                              </p>
                            )}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {Number(stock.ltp).toLocaleString("en-NP", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${
                          isPositive ? "text-emerald-600" : isNegative ? "text-rose-600" : "text-slate-500"
                        }`}>
                          <span className="inline-flex items-center gap-1">
                            {isPositive && <TrendingUp className="w-3 h-3" />}
                            {isNegative && <TrendingDown className="w-3 h-3" />}
                            {isPositive ? "+" : ""}{Number(stock.percentage_change).toFixed(2)}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {Number(stock.high).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {Number(stock.low).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {Number(stock.volume).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600 dark:text-slate-400">
                          {(Number(stock.turnover) / 100000).toFixed(1)}L
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PublicLayout>
  );
};

export default ScreenerPage;
