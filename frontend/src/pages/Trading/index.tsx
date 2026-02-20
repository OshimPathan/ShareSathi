import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";

export const Trading = () => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Active Trading</h1>
                <p className="text-sm text-slate-400 mt-1">Live market order execution</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="h-96">
                        <CardHeader><CardTitle>Market Depth</CardTitle></CardHeader>
                        <CardContent className="flex h-[80%] justify-center items-center italic text-slate-500 border border-slate-700 border-dashed rounded-md mx-6">
                            Order Book DOM (Buy/Sell Spread)
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card className="h-96">
                        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm font-mono">
                                <li className="flex justify-between text-emerald-500"><span>Buy NABIL</span> <span>624.50</span></li>
                                <li className="flex justify-between text-rose-500"><span>Sell SCB</span> <span>540.20</span></li>
                                <li className="flex justify-between text-emerald-500"><span>Buy NICA</span> <span>710.00</span></li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Trading;
