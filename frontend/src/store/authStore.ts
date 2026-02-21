import { create } from 'zustand';
import insforge from '../lib/insforge';
import { useSubscriptionStore, PLAN_FEATURES } from './subscriptionStore';

interface User {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    emailVerified: boolean;
    providers: string[];
    createdAt: string;
    updatedAt: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;

    // Actions
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName?: string) => Promise<{ requireEmailVerification: boolean }>;
    loginWithOAuth: (provider: 'google' | 'github') => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
    updateProfile: (data: { name?: string; [key: string]: unknown }) => Promise<void>;
    sendResetPasswordEmail: (email: string) => Promise<void>;
    verifyEmail: (email: string, otp: string) => Promise<void>;
    resetPassword: (otp: string, newPassword: string) => Promise<void>;
    exchangeResetPasswordToken: (email: string, code: string) => Promise<string>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,

    initialize: async () => {
        try {
            set({ isLoading: true });
            const { data, error } = await insforge.auth.getCurrentSession();
            if (error || !data?.session) {
                set({ user: null, token: null, isAuthenticated: false, isInitialized: true, isLoading: false });
                return;
            }
            const session = data.session;
            const u = session.user;
            set({
                user: {
                    id: u.id,
                    email: u.email,
                    name: u.profile?.name ?? null,
                    avatar_url: u.profile?.avatar_url ?? null,
                    emailVerified: u.emailVerified,
                    providers: u.providers ?? [],
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt,
                },
                token: session.accessToken,
                isAuthenticated: true,
                isInitialized: true,
            });
            // Initialize subscription tier after successful auth restore
            useSubscriptionStore.getState().initialize();
        } catch {
            set({ user: null, token: null, isAuthenticated: false, isInitialized: true });
        } finally {
            set({ isLoading: false });
        }
    },

    login: async (email: string, password: string) => {
        const { data, error } = await insforge.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data) throw new Error('Login failed');

        const u = data.user;
        set({
            user: {
                id: u.id,
                email: u.email,
                name: u.profile?.name ?? null,
                avatar_url: u.profile?.avatar_url ?? null,
                emailVerified: u.emailVerified,
                providers: u.providers ?? [],
                createdAt: u.createdAt,
                updatedAt: u.updatedAt,
            },
            token: data.accessToken,
            isAuthenticated: true,
        });
        // Initialize subscription tier after login
        useSubscriptionStore.getState().initialize();
    },

    register: async (email: string, password: string, fullName?: string) => {
        const { data, error } = await insforge.auth.signUp({
            email,
            password,
            name: fullName || undefined,
        });
        if (error) throw error;
        if (!data) throw new Error('Registration failed');

        // If email verification is required, return that flag
        if (data.requireEmailVerification) {
            return { requireEmailVerification: true };
        }

        // If no verification needed, user is auto-signed in
        if (data.accessToken && data.user) {
            const u = data.user;
            set({
                user: {
                    id: u.id,
                    email: u.email,
                    name: u.profile?.name ?? null,
                    avatar_url: u.profile?.avatar_url ?? null,
                    emailVerified: u.emailVerified,
                    providers: u.providers ?? [],
                    createdAt: u.createdAt,
                    updatedAt: u.updatedAt,
                },
                token: data.accessToken,
                isAuthenticated: true,
            });
        }
        return { requireEmailVerification: false };
    },

    loginWithOAuth: async (provider: 'google' | 'github') => {
        const { error } = await insforge.auth.signInWithOAuth({
            provider,
            redirectTo: `${window.location.origin}/dashboard`,
        });
        if (error) throw error;
        // Browser will redirect to OAuth provider
    },

    logout: async () => {
        await insforge.auth.signOut();
        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
        // Reset subscription to free on logout
        useSubscriptionStore.setState({ tier: 'free', features: PLAN_FEATURES.free });
    },

    verifyEmail: async (email: string, otp: string) => {
        const { data, error } = await insforge.auth.verifyEmail({ email, otp });
        if (error) throw error;
        if (!data) throw new Error('Verification failed');

        const u = data.user;
        set({
            user: {
                id: u.id,
                email: u.email,
                name: u.profile?.name ?? null,
                avatar_url: u.profile?.avatar_url ?? null,
                emailVerified: u.emailVerified,
                providers: u.providers ?? [],
                createdAt: u.createdAt ?? '',
                updatedAt: u.updatedAt ?? '',
            },
            token: data.accessToken,
            isAuthenticated: true,
        });
    },

    updateProfile: async (data) => {
        const { data: profile, error } = await insforge.auth.setProfile(data);
        if (error) throw error;
        if (profile) {
            const p = profile as any;
            set((state) => ({
                user: state.user
                    ? {
                          ...state.user,
                          name: p.name ?? state.user.name,
                          avatar_url: p.avatar_url ?? state.user.avatar_url,
                      }
                    : null,
            }));
        }
    },

    sendResetPasswordEmail: async (email: string) => {
        const { error } = await insforge.auth.sendResetPasswordEmail({ email });
        if (error) throw error;
    },

    exchangeResetPasswordToken: async (email: string, code: string) => {
        const { data, error } = await insforge.auth.exchangeResetPasswordToken({ email, code });
        if (error) throw error;
        if (!data) throw new Error('Invalid code');
        return data.token;
    },

    resetPassword: async (otp: string, newPassword: string) => {
        const { error } = await insforge.auth.resetPassword({ newPassword, otp });
        if (error) throw error;
    },
}));

export default useAuthStore;
