import { useEffect, useState } from 'react';
import { Newspaper, Clock, ExternalLink } from 'lucide-react';
import { getNews, getNewsCategories } from '../../services/db';
import PublicLayout from '../../components/layout/PublicLayout';
import type { NewsItem } from '../../types';

export const NewsPage = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getNewsCategories().then(setCategories);
    }, []);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            const items = await getNews(activeCategory === 'All' ? undefined : activeCategory, 30);
            setNews(items);
            setLoading(false);
        };
        fetchNews();
    }, [activeCategory]);

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            'Corporate': 'bg-blue-100 text-blue-700 border-blue-200',
            'Market': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'Hydropower': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'IPO': 'bg-purple-100 text-purple-700 border-purple-200',
            'Sector Analysis': 'bg-amber-100 text-amber-700 border-amber-200',
            'Economy': 'bg-rose-100 text-rose-700 border-rose-200',
        };
        return colors[category] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getCategoryIcon = (category: string) => {
        const icons: Record<string, string> = {
            'Corporate': '🏢',
            'Market': '📊',
            'Hydropower': '⚡',
            'IPO': '📈',
            'Sector Analysis': '🔍',
            'Economy': '💰',
        };
        return icons[category] || '📰';
    };

    return (
        <PublicLayout>
            <div className="container mx-auto max-w-7xl px-4 lg:px-20 py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800 flex items-center gap-3">
                        <Newspaper className="w-8 h-8 text-mero-teal" />
                        Financial News
                    </h1>
                    <p className="text-slate-500 mt-1">Latest news and updates from Nepal's financial market</p>
                </div>

                {/* Category Filters */}
                <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all border ${
                                activeCategory === cat
                                    ? 'bg-mero-teal text-white border-mero-teal shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                            }`}
                        >
                            <span>{getCategoryIcon(cat)}</span>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* News Grid */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-1/4 mb-3"></div>
                                <div className="h-5 bg-slate-200 rounded w-full mb-2"></div>
                                <div className="h-5 bg-slate-200 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : news.length === 0 ? (
                    <div className="text-center py-16">
                        <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-600 mb-2">No news found</h3>
                        <p className="text-slate-500">No news articles available for "{activeCategory}" category.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured News (First Item) */}
                        {news.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mb-6 hover:shadow-md transition-shadow">
                                <div className="md:flex">
                                    <div className="md:w-2/5 bg-gradient-to-br from-mero-teal to-mero-darkTeal p-8 flex flex-col justify-center text-white">
                                        <span className={`text-xs px-2 py-1 rounded inline-block w-fit mb-3 bg-white/20 font-bold tracking-wider`}>
                                            {getCategoryIcon(news[0].category)} {news[0].category}
                                        </span>
                                        <h2 className="text-xl font-bold leading-snug mb-3">{news[0].title}</h2>
                                        <div className="flex items-center gap-3 text-sm text-white/80">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {news[0].published_at}</span>
                                            <span>·</span>
                                            <span>{news[0].source}</span>
                                        </div>
                                    </div>
                                    <div className="md:w-3/5 p-6 flex flex-col justify-center">
                                        <p className="text-slate-600 mb-4 leading-relaxed">
                                            Stay updated with the latest developments in Nepal's financial market. This report covers key market movements, corporate announcements, and regulatory updates affecting NEPSE-listed companies.
                                        </p>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold border ${getCategoryColor(news[0].category)}`}>
                                                {news[0].category}
                                            </span>
                                            <span className="text-xs text-slate-500">Source: {news[0].source}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* News Cards Grid */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {news.slice(1).map((item) => (
                                <article key={item.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 group">
                                    <div className="p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${getCategoryColor(item.category)}`}>
                                                {getCategoryIcon(item.category)} {item.category}
                                            </span>
                                            <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-mero-teal transition-colors" />
                                        </div>
                                        <h3 className="font-bold text-slate-800 mb-3 leading-snug group-hover:text-mero-teal transition-colors line-clamp-3">
                                            {item.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.published_at}</span>
                                            <span className="font-medium text-slate-600">{item.source}</span>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </PublicLayout>
    );
};

export default NewsPage;
