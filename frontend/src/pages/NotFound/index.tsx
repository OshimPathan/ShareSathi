import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <h1 className="text-8xl font-bold text-mero-teal mb-4">404</h1>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Page Not Found</h2>
                <p className="text-slate-500 mb-8">
                    The page you're looking for doesn't exist or has been moved.
                </p>
                <div className="flex gap-3 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-mero-teal hover:bg-mero-darkTeal text-white font-bold px-6 py-3 rounded-lg transition-colors"
                    >
                        <Home className="w-4 h-4" /> Go Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-6 py-3 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
