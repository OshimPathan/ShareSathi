import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { getIpos } from "../../services/db";
import type { IpoData } from "../../types";

export const IpoWidget = () => {
    const [ipos, setIpos] = useState<IpoData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchIpos = async () => {
            const data = await getIpos();
            setIpos(data);
            setIsLoading(false);
        };
        fetchIpos();
    }, []);

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-slate-800">Live IPOs & Issues</CardTitle>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold border border-blue-200 tracking-wider">Real-Time</span>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-slate-100 rounded-md border border-slate-200"></div>
                        ))}
                    </div>
                ) : ipos.length === 0 ? (
                    <div className="text-sm text-slate-500 text-center py-6 italic">No active IPOs found.</div>
                ) : (
                    <div className="space-y-3 relative">
                        {ipos.slice(0, 10).map(ipo => (
                            <div key={ipo.id} className="p-3 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="truncate pr-2">
                                        <h4 className="font-bold text-slate-800 text-sm truncate" title={ipo.company_name}>{ipo.company_name}</h4>
                                        <p className="text-xs text-slate-500 mt-0.5">{ipo.sector}</p>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold tracking-wider ${ipo.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        ipo.status === 'UPCOMING' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                            'bg-slate-100 text-slate-600 border border-slate-300'
                                        }`}>
                                        {ipo.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                                    <div className="text-xs">
                                        <span className="text-slate-500 font-medium">Units: </span>
                                        <span className="font-mono text-slate-800 font-bold">{ipo.units}</span>
                                    </div>
                                    <div className="text-xs text-right">
                                        <span className="text-slate-500 font-medium">Closes: </span>
                                        <span className="font-mono text-slate-800 font-bold">{ipo.closing_date}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {ipos.length > 10 && (
                            <div className="pt-2 text-center">
                                <button className="text-sm font-bold text-mero-teal hover:text-mero-darkTeal transition-colors flex items-center justify-center w-full py-2 bg-slate-50 rounded border border-slate-200 hover:bg-slate-100">
                                    View All {ipos.length} IPOs →
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
