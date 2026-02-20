import { Button } from "../../components/ui/Button";

export const Login = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
            <div className="w-full max-w-md space-y-8 bg-slate-900 p-8 rounded-xl border border-slate-800 shadow-2xl">
                <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">ShareSathi</h2>
                    <p className="mt-2 text-sm text-slate-400">Sign in to your trading account</p>
                </div>

                <form className="mt-8 space-y-6">
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="text-sm text-slate-400 font-medium">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="trader@sharesathi.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 font-medium">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" type="checkbox" className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">Remember me</label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="font-medium text-blue-500 hover:text-blue-400">Forgot password?</a>
                        </div>
                    </div>

                    <div>
                        <Button className="w-full" size="lg">Sign in</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
