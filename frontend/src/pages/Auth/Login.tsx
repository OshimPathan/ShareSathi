import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import api from "../../services/api";

export const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isLogin) {
                // FastAPI OAuth2PasswordRequestForm expects form-data
                const formData = new URLSearchParams();
                formData.append("username", email); // OAuth2 expects 'username' field
                formData.append("password", password);

                const response = await api.post("/auth/login", formData, {
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                });

                localStorage.setItem("access_token", response.data.access_token);
                navigate("/dashboard");
            } else {
                // Registration expects JSON
                await api.post("/auth/register", { email, password });
                setIsLogin(true); // Switch to login after successful register
                setError("Registration successful! Please log in.");
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md space-y-8 bg-slate-900/80 backdrop-blur-xl p-8 rounded-xl border border-slate-800 shadow-2xl relative z-10">
                <div className="text-center">
                    <img src="/logo.png" alt="Logo" className="w-16 h-16 mx-auto mb-4 bg-white rounded p-1" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        {isLogin ? "Sign in to your trading dashboard" : "Start your paper trading journey"}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className={`p-3 rounded text-sm text-center ${error.includes("successful") ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label className="text-sm text-slate-400 font-medium">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="trader@sharesathi.com"
                            />
                        </div>
                        <div>
                            <label className="text-sm text-slate-400 font-medium">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        {isLogin && (
                            <>
                                <div className="flex items-center">
                                    <input id="remember-me" type="checkbox" className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <a href="#" className="font-medium text-blue-500 hover:text-blue-400">Forgot password?</a>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <Button className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? "Processing..." : (isLogin ? "Sign in" : "Register")}
                        </Button>
                    </div>

                    <div className="text-center text-sm text-slate-400 mt-4">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(""); }}
                            className="text-blue-500 font-medium hover:underline"
                        >
                            {isLogin ? "Sign up here" : "Sign in here"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
