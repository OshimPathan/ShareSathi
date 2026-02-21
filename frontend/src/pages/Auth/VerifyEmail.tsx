import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import useAuthStore from "../../store/authStore";
import insforge from "../../lib/insforge";

export const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail } = useAuthStore();
    const email = (location.state as { email?: string })?.email || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendMsg, setResendMsg] = useState("");

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            await verifyEmail(email, otp);
            navigate("/dashboard");
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e.message || "Verification failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setResendMsg("");
        setError("");
        try {
            const { error } = await insforge.auth.resendVerificationEmail({ email });
            if (error) throw error;
            setResendMsg("A new verification code has been sent to your email.");
        } catch {
            setError("Failed to resend code. Please try again.");
        }
    };

    if (!email) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
                <div className="text-center text-slate-400">
                    <p>No email provided. Please register first.</p>
                    <button onClick={() => navigate("/login", { state: { register: true } })} className="text-blue-500 hover:underline mt-2">
                        Go to registration
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-md space-y-8 bg-slate-900/80 backdrop-blur-xl p-8 rounded-xl border border-slate-800 shadow-2xl relative z-10">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-200">Verify Your Email</h2>
                    <p className="mt-2 text-sm text-slate-400">
                        We sent a 6-digit code to <span className="text-blue-400 font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    {error && (
                        <div className="p-3 rounded text-sm text-center bg-rose-500/10 text-rose-500 border border-rose-500/20">
                            {error}
                        </div>
                    )}
                    {resendMsg && (
                        <div className="p-3 rounded text-sm text-center bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {resendMsg}
                        </div>
                    )}

                    <div>
                        <label className="text-sm text-slate-400 font-medium">Verification Code</label>
                        <input
                            type="text"
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-md p-3 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center tracking-[0.5em] text-2xl font-mono"
                            placeholder="000000"
                            autoFocus
                        />
                    </div>

                    <Button className="w-full" size="lg" disabled={isLoading || otp.length !== 6}>
                        {isLoading ? "Verifying..." : "Verify Email"}
                    </Button>

                    <div className="text-center text-sm text-slate-400">
                        Didn't receive the code?{" "}
                        <button type="button" onClick={handleResend} className="text-blue-500 font-medium hover:underline">
                            Resend code
                        </button>
                    </div>

                    <div className="text-center">
                        <button type="button" onClick={() => navigate("/login")} className="text-sm text-slate-500 hover:text-slate-300">
                            Back to login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
