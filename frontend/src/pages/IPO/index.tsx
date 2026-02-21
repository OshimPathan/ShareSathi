import { useEffect, useState } from 'react';
import { CalendarDays, Clock, Building2, AlertCircle } from 'lucide-react';
import { getIpos } from '../../services/db';
import PublicLayout from '../../components/layout/PublicLayout';
import type { IpoData } from '../../types';

export const IpoPage = () => {
    const [ipos, setIpos] = useState<IpoData[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('All');

    useEffect(() => {
        const fetchIpos = async () => {
            const data = await getIpos();
            setIpos(data);
            setLoading(false);
        };
        fetchIpos();
    }, []);

    const filteredIpos = statusFilter === 'All' ? ipos : ipos.filter(ipo => ipo.status === statusFilter);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'UPCOMING': return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'CLOSED': return 'bg-slate-100 text-slate-600 border-slate-300';
            default: return 'bg-slate-100 text-slate-600 border-slate-300';
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-emerald-500';
            case 'UPCOMING': return 'bg-blue-500';
            case 'CLOSED': return 'bg-slate-400';
            default: return 'bg-slate-400';
        }
    };

    const openCount = ipos.filter(i => i.status === 'OPEN').length;
    const upcomingCount = ipos.filter(i => i.status === 'UPCOMING').length;
    const closedCount = ipos.filter(i => i.status === 'CLOSED').length;

    return (
        <PublicLayout>
            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                            <AlertCircle className="w-8 h-8 text-mero-teal" />
                            IPO & Issues
                        </h1>
                        <p className="text-slate-500 mt-1">Track Initial Public Offerings and share issues in NEPSE</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-700">{openCount}</p>
                                <p className="text-xs text-slate-500 font-medium">Open IPOs</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700">{upcomingCount}</p>
                                <p className="text-xs text-slate-500 font-medium">Upcoming</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                <CalendarDays className="w-5 h-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-700">{closedCount}</p>
                                <p className="text-xs text-slate-500 font-medium">Closed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {['All', 'OPEN', 'UPCOMING', 'CLOSED'].map(filter => (
                        <button
                            key={filter}
                            onClick={() => setStatusFilter(filter)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                                statusFilter === filter
                                    ? 'bg-mero-teal text-white border-mero-teal'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {filter === 'All' ? `All (${ipos.length})` : `${filter} (${ipos.filter(i => i.status === filter).length})`}
                        </button>
                    ))}
                </div>

                {/* IPO Listings */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
                                <div className="flex justify-between">
                                    <div className="space-y-3 flex-1">
                                        <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                    </div>
                                    <div className="h-8 w-24 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredIpos.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-lg">
                        <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-600 mb-2">No IPOs Found</h3>
                        <p className="text-slate-500">No {statusFilter !== 'All' ? statusFilter.toLowerCase() : ''} IPOs available at this time.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredIpos.map(ipo => (
                            <div key={ipo.id} className={`bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all ${
                                ipo.status === 'OPEN' ? 'border-emerald-200 border-l-4 border-l-emerald-500' :
                                ipo.status === 'UPCOMING' ? 'border-blue-200 border-l-4 border-l-blue-500' :
                                'border-slate-200 border-l-4 border-l-slate-300'
                            }`}>
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Building2 className="w-5 h-5 text-slate-400" />
                                                <h3 className="text-lg font-bold text-slate-800">{ipo.company_name}</h3>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-medium">{ipo.sector}</span>
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3" />
                                                    {ipo.opening_date} — {ipo.closing_date}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 mb-1">Units Offered</p>
                                                <p className="font-bold font-mono text-slate-800">{ipo.units}</p>
                                            </div>
                                            <span className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 ${getStatusStyle(ipo.status)}`}>
                                                <span className={`w-2 h-2 rounded-full ${getStatusDot(ipo.status)} ${ipo.status === 'OPEN' ? 'animate-pulse' : ''}`} />
                                                {ipo.status}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar for Open IPOs */}
                                    {ipo.status === 'OPEN' && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                                                <span>Application Period</span>
                                                <span className="font-bold text-emerald-600">Active</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2">
                                                <div className="bg-emerald-500 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* IPO Information Section */}
                <div className="mt-10 bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">How to Apply for IPO in Nepal</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <div className="w-10 h-10 bg-mero-teal/10 rounded-full flex items-center justify-center text-mero-teal font-bold">1</div>
                            <h4 className="font-bold text-sm">Open DEMAT Account</h4>
                            <p className="text-sm text-slate-500">Open a DEMAT account with any licensed depository participant (DP).</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-10 h-10 bg-mero-teal/10 rounded-full flex items-center justify-center text-mero-teal font-bold">2</div>
                            <h4 className="font-bold text-sm">Apply via MeroShare</h4>
                            <p className="text-sm text-slate-500">Use the MeroShare portal to apply for available IPOs online.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-10 h-10 bg-mero-teal/10 rounded-full flex items-center justify-center text-mero-teal font-bold">3</div>
                            <h4 className="font-bold text-sm">Check Allotment</h4>
                            <p className="text-sm text-slate-500">After the IPO closes, check your allotment status on MeroShare.</p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
};

export default IpoPage;
