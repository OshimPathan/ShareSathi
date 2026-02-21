import { useEffect, useState } from 'react';
import { Bell, Clock, Megaphone } from 'lucide-react';
import { getNews } from '../../services/db';
import PublicLayout from '../../components/layout/PublicLayout';

interface Announcement {
    id: number;
    title: string;
    category: string;
    source: string;
    published_at: string;
    type: 'dividend' | 'agm' | 'financial' | 'rights' | 'general';
}

export const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [typeFilter, setTypeFilter] = useState('all');

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                // Fetch corporate news as announcements
                const [corporateNews, allNews] = await Promise.all([
                    getNews('Corporate', 30),
                    getNews(undefined, 30),
                ]);

                // Combine and deduplicate
                const types: Announcement['type'][] = ['dividend', 'agm', 'financial', 'rights', 'general'];
                const allAnnouncements: Announcement[] = [...corporateNews, ...allNews]
                    .filter((item, idx, self) =>
                        idx === self.findIndex(t => t.id === item.id)
                    )
                    .map((item, idx) => ({
                        ...item,
                        type: item.title.toLowerCase().includes('dividend') ? 'dividend' :
                              item.title.toLowerCase().includes('agm') || item.title.toLowerCase().includes('annual') ? 'agm' :
                              item.title.toLowerCase().includes('profit') || item.title.toLowerCase().includes('report') ? 'financial' :
                              item.title.toLowerCase().includes('rights') || item.title.toLowerCase().includes('ipo') ? 'rights' :
                              types[idx % types.length]
                    }));

                setAnnouncements(allAnnouncements);
            } catch (error) {
                console.error("Failed to fetch announcements", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, []);

    const getTypeStyle = (type: string) => {
        switch (type) {
            case 'dividend': return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: '💰', label: 'Dividend' };
            case 'agm': return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: '🏛️', label: 'AGM / Meeting' };
            case 'financial': return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: '📊', label: 'Financial Report' };
            case 'rights': return { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: '📈', label: 'Rights / IPO' };
            default: return { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', icon: '📢', label: 'General' };
        }
    };

    const filteredAnnouncements = typeFilter === 'all'
        ? announcements
        : announcements.filter(a => a.type === typeFilter);

    const filterOptions = [
        { id: 'all', label: 'All', icon: '📋' },
        { id: 'dividend', label: 'Dividends', icon: '💰' },
        { id: 'agm', label: 'AGM/Meetings', icon: '🏛️' },
        { id: 'financial', label: 'Financial', icon: '📊' },
        { id: 'rights', label: 'Rights/IPO', icon: '📈' },
        { id: 'general', label: 'General', icon: '📢' },
    ];

    return (
        <PublicLayout>
            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                        <Megaphone className="w-8 h-8 text-mero-teal" />
                        Company Announcements
                    </h1>
                    <p className="text-slate-500 mt-1">Important notices and announcements from NEPSE-listed companies</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                    {filterOptions.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setTypeFilter(opt.id)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all border ${
                                typeFilter === opt.id
                                    ? 'bg-mero-teal text-white border-mero-teal shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            <span>{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Announcements Timeline */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                            </div>
                        ))}
                    </div>
                ) : filteredAnnouncements.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-lg">
                        <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-600 mb-2">No Announcements</h3>
                        <p className="text-slate-500">No announcements found for this filter.</p>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 hidden md:block" />

                        <div className="space-y-4">
                            {filteredAnnouncements.map((announcement) => {
                                const style = getTypeStyle(announcement.type);
                                return (
                                    <div key={announcement.id} className="relative md:pl-16 group">
                                        {/* Timeline Dot */}
                                        <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-white border-2 border-mero-teal z-10 hidden md:flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-mero-teal" />
                                        </div>

                                        <div className={`bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all ${style.bg}`}>
                                            <div className="p-5">
                                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-bold border ${style.bg} ${style.text}`}>
                                                                {style.icon} {style.label}
                                                            </span>
                                                            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-medium">{announcement.category}</span>
                                                        </div>
                                                        <h3 className="font-bold text-slate-800 mb-2 leading-snug group-hover:text-mero-teal transition-colors">
                                                            {announcement.title}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {announcement.published_at}</span>
                                                            <span>·</span>
                                                            <span className="font-medium">{announcement.source}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
};

export default AnnouncementsPage;
