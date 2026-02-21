import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/Card";
import { useAuthStore } from "../../store/authStore";

export const Profile = () => {
    const { user, updateProfile, isLoading, initialize, isInitialized } = useAuthStore();

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

    return (
        <div className="space-y-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-2xl font-bold tracking-tight">Profile & Settings</h1>
                <p className="text-sm text-slate-400 mt-1">Manage your account information</p>
            </header>

            {/* Account Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="text-sm text-slate-500">Email</p>
                        <p className="font-medium text-slate-800">{email}</p>
                    </div>
                    <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="text-sm text-slate-500">Email Verified</p>
                        <p className="font-medium text-slate-800">
                            {user?.emailVerified ? (
                                <span className="text-emerald-600">Verified</span>
                            ) : (
                                <span className="text-amber-600">Not Verified</span>
                            )}
                        </p>
                    </div>
                    <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="text-sm text-slate-500">Auth Providers</p>
                        <p className="font-medium text-slate-800">{user?.providers?.join(", ") || "—"}</p>
                    </div>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Your display name"
                            />
                        </div>

                        {profileMsg.text && (
                            <div className={`text-sm px-3 py-2 rounded ${profileMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                                {profileMsg.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </form>
                </CardContent>
            </Card>

            {/* Account Details Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">User ID</span>
                            <span className="text-slate-800 font-mono text-xs">{user?.id || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Created</span>
                            <span className="text-slate-800">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Last Updated</span>
                            <span className="text-slate-800">{user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "—"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card>
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-slate-500 mb-3">Account deletion is not yet available. Contact support if needed.</p>
                    <button
                        disabled
                        className="bg-red-100 text-red-400 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                        Delete Account (Coming Soon)
                    </button>
                </CardContent>
            </Card>
        </div>
    );
};

export default Profile;
