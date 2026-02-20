import { Bell, Search, User, Menu } from "lucide-react";
import { cn } from "../../utils/cn";

export const Navbar = ({ className, onMenuClick }: { className?: string, onMenuClick?: () => void }) => {
    return (
        <header className={cn("", className)}>
            <div className="flex items-center gap-4">
                <button onClick={onMenuClick} className="p-2 -ml-2 text-slate-400 hover:text-slate-100 md:hidden">
                    <Menu className="w-6 h-6" />
                </button>

                {/* Search */}
                <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search symbols (e.g., NABIL)..."
                        className="w-64 bg-slate-900 border border-slate-700 rounded-full py-2 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-100 transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
                </button>

                <div className="h-8 w-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 font-medium cursor-pointer hover:border-slate-400 transition-colors">
                    <User className="w-4 h-4" />
                </div>
            </div>
        </header>
    );
};

export default Navbar;
