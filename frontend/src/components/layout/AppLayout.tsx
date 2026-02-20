import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export const AppLayout = () => {
    return (
        <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
            <Sidebar className="hidden md:flex flex-col w-64 bg-slate-800 border-r border-slate-700 h-full" />

            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Navbar className="h-16 flex-shrink-0 flex items-center justify-between px-6 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 z-10" />

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-900 p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
