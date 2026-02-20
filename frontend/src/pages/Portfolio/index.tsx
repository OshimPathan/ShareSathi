import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";

export const Portfolio = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">My Portfolio</h1>
                <p className="text-sm text-slate-400 mt-1">Simulated investments & P&L</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Balance</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">Rs. 1,000,000.00</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Total Invested</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">Rs. 450,200.00</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Current Value</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono">Rs. 510,400.00</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Lifetime P&L</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-mono text-emerald-500">+ Rs. 60,200.00</div>
                        <p className="text-xs text-emerald-500 mt-1">↑ +13.37%</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Current Holdings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-400 uppercase bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3">Symbol</th>
                                    <th className="px-6 py-3">Qty</th>
                                    <th className="px-6 py-3">Avg Price</th>
                                    <th className="px-6 py-3">LTP</th>
                                    <th className="px-6 py-3">P&L</th>
                                    <th className="px-6 py-3">Change %</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-400">NABIL</td>
                                    <td className="px-6 py-4 font-mono">100</td>
                                    <td className="px-6 py-4 font-mono">600.00</td>
                                    <td className="px-6 py-4 font-mono">624.50</td>
                                    <td className="px-6 py-4 font-mono text-emerald-500">+2,450.00</td>
                                    <td className="px-6 py-4 font-mono text-emerald-500">+4.08%</td>
                                </tr>
                                <tr className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4 font-medium text-blue-400">SCB</td>
                                    <td className="px-6 py-4 font-mono">50</td>
                                    <td className="px-6 py-4 font-mono">550.00</td>
                                    <td className="px-6 py-4 font-mono">540.20</td>
                                    <td className="px-6 py-4 font-mono text-rose-500">-490.00</td>
                                    <td className="px-6 py-4 font-mono text-rose-500">-1.78%</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Portfolio;
