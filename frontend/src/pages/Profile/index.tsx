import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { useAuthStore } from "../../store/authStore";
import { useSubscriptionStore, PLAN_PRICING } from "../../store/subscriptionStore";
import { User, Shield, Mail, CheckCircle, AlertCircle, Crown, ArrowUpRight, Trash2, KeyRound, Users } from "lucide-react";

export const Profile = () => {
    const { user, updateProfile, isLoading, initialize, isInitialized } = useAuthStore();
    const { tier, features } = useSubscriptionStore();

    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [profileMsg, setProfileMsg] = useState<{ text: string; type: string }>({ text: "", type: "" });

    useEffect(() => {
        if (!isInitialized) {
            initialize();
        }
    }, [isInitialized, initialize]);

    useEffect(() => {
        if (user) {
            setDisplayName(user.name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMsg({ text: "", type: "" });
        try {
            await updateProfile({ name: displayName });
            setProfileMsg({ text: "Profile updated successfully!", type: "success" });
        } catch (error: unknown) {
            const err = error as { message?: string };
            setProfileMsg({
                text: err.message || "Failed to update profile.",
                type: "error"
            });
        }
    };

    const tierColors: Record<string, string> = {
        free: 'from-slate-500 to-slate-600',
        basic: 'from-blue-500 to-indigo-600',
        pro: 'from-amber-500 to-orange-600',
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <header className="animate-slide-up">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                    <User className="w-6 h-6 text-mero-teal" /> Profile & Settings
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">Manage your account &amp; subscription</p>
            </header>

            {/* Subscription Tier Card */}
            <div className={`rounded-2xl bg-gradient-to-r ${tierColors[tier]} p-[1px] animate-slide-up delay-100`} style={{ opacity: 0, animationFillMode: 'forwards' }}>
                <div className="bg-white rounded-2xl p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tierColors[tier]} flex items-center justify-center`}>
                                <Crown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900">{PLAN_PRICING[tier].label} Plan</h3>
                                <p className="text-xs text-slate-400">
                                    {tier === 'free' ? 'Upgrade for more features' : `Rs. ${PLAN_PRICING[tier].monthly}/mo`}
                                </p>
                            </div>
                        </div>
                        {tier !== 'pro' && (
                            <Link to="/pricing" className="flex items-center gap-1 text-sm font-semibold text-mero-teal hover:text-mero-darkTeal transition-colors">
                                Upgrade <ArrowUpRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-400">Watchlist</p>
                            <p className="text-lg font-bold text-slate-800 font-mono">{features.maxWatchlist === -1 ? '∞' : features.maxWatchlist}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-400">Daily Trades</p>
                            <p className="text-lg font-bold text-slate-800 font-mono">{features.maxDailyTrades === -1 ? '∞' : features.maxDailyTrades}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-slate-400">AI Insights</p>
                            <p className="text-lg font-bold text-slate-800">{features.aiInsights ? '✓' : '—'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Info Card */}
            <Card className="animate-slide-up delay-200" style={{ opacity: 0, animationFillMode: 'forwards' } as React.CSSProperties}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                        <Shield className="w-4 h-4 text-slate-400" /> Account Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Email</p>
                            <p className="font-medium text-slate-800 text-sm">{email}</p>
                        </div>
                    </div>
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                        {user?.emailVerified ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Verification</p>
                            <p className={`font-semibold text-sm ${user?.emailVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {user?.emailVerified ? "Verified" : "Not Verified"}
                            </p>
                        </div>
                    </div>
                    <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
                        <Users className="w-4 h-4 text-slate-400" />
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Auth Providers</p>
                            <p className="font-medium text-slate-800 text-sm">{user?.providers?.join(", ") || "—"}</p>
                        </div>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-mero-teal/20 focus:border-mero-teal text-sm transition-all"
                                placeholder="Your display name"
                            />
                        </div>

                        {profileMsg.text && (
                            <div className={`text-sm px-3 py-2 rounded-xl ${profileMsg.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                                {profileMsg.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-mero-teal hover:bg-mero-darkTeal text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </CardContent>
            </Card>

            {/* Account Details Card */}
            <Card className="animate-slide-up delay-300" style={{ opacity: 0, animationFillMode: 'forwards' } as React.CSSProperties}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                        <KeyRound className="w-4 h-4 text-slate-400" /> Account Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-400">User ID</span>
                            <span className="text-slate-700 font-mono text-xs bg-slate-50 px-2 py-0.5 rounded">{user?.id || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Created</span>
                            <span className="text-slate-700">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Last Updated</span>
                            <span className="text-slate-700">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "—"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="animate-slide-up delay-400" style={{ opacity: 0, animationFillMode: 'forwards' } as React.CSSProperties}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-rose-600">
                        <Trash2 className="w-4 h-4" /> Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-3">Account deletion is not yet available. Contact support if needed.</p>
                    <button
                        disabled
                        className="bg-rose-50 text-rose-300 px-4 py-2 rounded-xl text-sm font-medium cursor-not-allowed border border-rose-200"
                    >
                        Delete Account (Coming Soon)
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
