import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export const StockDetail = () => {
    const { symbol } = useParams();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{symbol || "NABIL"}</h1>
                    <p className="text-slate-400 mt-1">Nabil Bank Limited • Commercial Banks</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold font-mono">Rs. 624.50</div>
                    <p className="text-emerald-500 font-medium">↑ 12.00 (1.96%)</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-96 flex flex-col justify-center items-center">
                        <span className="text-slate-500 italic">Candlestick Chart Container (Lightweight Charts)</span>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>AI Prediction (Arima)</CardTitle>
                        </CardHeader>
                        <CardContent className="h-48 flex justify-center items-center">
                            <span className="text-slate-500 italic">Prediction Graph Container</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Trading & Stats */}
                <div className="space-y-6">
                    <Card className="border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <CardHeader>
                            <CardTitle>Trade {symbol}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex bg-slate-900 rounded-md p-1 border border-slate-700">
                                <button className="flex-1 py-1.5 text-sm font-medium bg-emerald-600 rounded text-content text-white">Buy</button>
                                <button className="flex-1 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">Sell</button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Order Type</label>
                                <select className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200">
                                    <option>Market Order</option>
                                    <option>Limit Order</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">Quantity</label>
                                <input type="number" min="10" defaultValue="10" className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm text-slate-200" />
                            </div>

                            <div className="pt-2 border-t border-slate-700 mt-4">
                                <div className="flex justify-between text-sm mb-4">
                                    <span className="text-slate-400">Estimated Cost</span>
                                    <span className="font-mono font-medium">Rs. 6,245.00</span>
                                </div>
                                <Button className="w-full" variant="success">Execute Buy</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Key Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">52 Week High</span>
                                    <span className="font-mono">750.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">52 Week Low</span>
                                    <span className="font-mono">485.20</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400">Volume</span>
                                    <span className="font-mono">145,230</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StockDetail;
