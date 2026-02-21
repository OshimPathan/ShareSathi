import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import useAuthStore from "../../store/authStore";

export const Login = ({ initialMode }: { initialMode?: 'login' | 'register' | 'forgot' } = {}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, register, loginWithOAuth, sendResetPasswordEmail, exchangeResetPasswordToken, resetPassword } = useAuthStore();

    const [isLogin, setIsLogin] = useState(
        initialMode === 'register' ? false : (location.state?.register ? false : true)
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Forgot password flow
    const [showForgotPassword, setShowForgotPassword] = useState(initialMode === 'forgot');
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");
    const [forgotStep, setForgotStep] = useState<'email' | 'code' | 'newPassword'>('email');
    const [resetCode, setResetCode] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
                navigate("/dashboard");
            } else {
                if (password.length < 6) {
                    setError("Password must be at least 6 characters long");
                    setIsLoading(false);
                    return;
                }
                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    setIsLoading(false);
                    return;
                }
                const result = await register(email, password, fullName || undefined);
                if (result.requireEmailVerification) {
                    // Navigate to email verification page
                    navigate("/verify-email", { state: { email } });
                } else {
                    navigate("/dashboard");
                }
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || "Authentication failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOAuth = async (provider: 'google' | 'github') => {
        try {
            await loginWithOAuth(provider);
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || `Failed to sign in with ${provider}`);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setForgotMessage("");
        try {
            if (forgotStep === 'email') {
                await sendResetPasswordEmail(forgotEmail);
                setForgotMessage("A 6-digit code has been sent to your email.");
                setForgotStep('code');
            } else if (forgotStep === 'code') {
                const token = await exchangeResetPasswordToken(forgotEmail, resetCode);
                setResetToken(token);
                setForgotStep('newPassword');
                setForgotMessage("");
            } else if (forgotStep === 'newPassword') {
                if (newPassword !== confirmNewPassword) {
                    setForgotMessage("Passwords do not match.");
                    return;
                }
                if (newPassword.length < 6) {
                    setForgotMessage("Password must be at least 6 characters.");
                    return;
                }
                await resetPassword(resetToken, newPassword);
                setForgotMessage("Password reset successful! You can now log in.");
                setTimeout(() => {
                    setShowForgotPassword(false);
                    setForgotStep('email');
                    setForgotMessage("");
                    setResetCode("");
                    setResetToken("");
                    setNewPassword("");
                    setConfirmNewPassword("");
                }, 2000);
            }
        } catch (err: unknown) {
            const e = err as { message?: string };
            setForgotMessage(e.message || "Something went wrong. Please try again.");
        }
    };

    if (showForgotPassword) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="w-full max-w-md space-y-8 bg-slate-900/80 backdrop-blur-xl p-8 rounded-xl border border-slate-800 shadow-2xl relative z-10">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-slate-200">Reset Password</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {forgotStep === 'email' && "Enter your email to receive a reset code"}
                            {forgotStep === 'code' && "Enter the 6-digit code from your email"}
                            {forgotStep === 'newPassword' && "Enter your new password"}
                        </p>
                    </div>
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        {forgotMessage && (
                            <div className={`p-3 rounded text-sm text-center ${forgotMessage.includes("successful") ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                                {forgotMessage}
                            </div>
                        )}

                        {forgotStep === 'email' && (
                            <div>
                                <label className="text-sm text-slate-400 font-medium">Email Address</label>
                                <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="trader@sharesathi.com" />
                            </div>
                        )}

                        {forgotStep === 'code' && (
                            <div>
                                <label className="text-sm text-slate-400 font-medium">6-Digit Code</label>
                                <input type="text" required value={resetCode} onChange={(e) => setResetCode(e.target.value)}
                                    maxLength={6} pattern="[0-9]{6}"
                                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center tracking-[0.5em] text-lg"
                                    placeholder="000000" />
                            </div>
                        )}

                        {forgotStep === 'newPassword' && (
                            <>
                                <div>
                                    <label className="text-sm text-slate-400 font-medium">New Password</label>
                                    <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                        minLength={6}
                                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 font-medium">Confirm New Password</label>
                                    <input type="password" required value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)}
                                        minLength={6}
                                        className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••" />
                                </div>
                            </>
                        )}

                        <Button className="w-full" size="lg">
                            {forgotStep === 'email' && "Send Reset Code"}
                            {forgotStep === 'code' && "Verify Code"}
                            {forgotStep === 'newPassword' && "Reset Password"}
                        </Button>
                        <button type="button" onClick={() => { setShowForgotPassword(false); setForgotStep('email'); setForgotMessage(""); }} className="w-full text-sm text-blue-500 hover:underline">
                            Back to login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

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
                        {!isLogin && (
                            <div>
                                <label className="text-sm text-slate-400 font-medium">Full Name (optional)</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Your Name"
                                />
                            </div>
                        )}
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
                            {!isLogin && (
                                <p className="mt-1 text-xs text-slate-500">Minimum 6 characters</p>
                            )}
                        </div>
                        {!isLogin && (
                            <div>
                                <label className="text-sm text-slate-400 font-medium">Confirm Password</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-2.5 text-sm text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        {isLogin && (
                            <>
                                <div className="flex items-center">
                                    <input id="remember-me" type="checkbox" className="h-4 w-4 bg-slate-800 border-slate-700 rounded text-blue-600 focus:ring-blue-500" />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">Remember me</label>
                                </div>
                                <div className="text-sm">
                                    <button type="button" onClick={() => setShowForgotPassword(true)} className="font-medium text-blue-500 hover:text-blue-400">Forgot password?</button>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <Button className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? "Processing..." : (isLogin ? "Sign in" : "Register")}
                        </Button>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-slate-900/80 text-slate-400">Or continue with</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleOAuth('google')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-700 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleOAuth('github')}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-700 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                            </svg>
                            GitHub
                        </button>
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
