import { create } from 'zustand';
import insforge from '../lib/insforge';

export type PlanTier = 'free' | 'basic' | 'pro';

interface PlanFeatures {
  maxWatchlist: number;
  maxDailyTrades: number;
  advancedCharts: boolean;
  aiInsights: boolean;
  exportData: boolean;
  prioritySupport: boolean;
}

export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    maxWatchlist: 10,
    maxDailyTrades: 5,
    advancedCharts: false,
    aiInsights: false,
    exportData: false,
    prioritySupport: false,
  },
  basic: {
    maxWatchlist: 50,
    maxDailyTrades: 25,
    advancedCharts: true,
    aiInsights: false,
    exportData: true,
    prioritySupport: false,
  },
  pro: {
    maxWatchlist: -1, // unlimited
    maxDailyTrades: -1,
    advancedCharts: true,
    aiInsights: true,
    exportData: true,
    prioritySupport: true,
  },
};

export const PLAN_PRICING: Record<PlanTier, { monthly: number; yearly: number; label: string }> = {
  free: { monthly: 0, yearly: 0, label: 'Free' },
  basic: { monthly: 199, yearly: 1999, label: 'Basic' },
  pro: { monthly: 499, yearly: 4999, label: 'Pro' },
};

interface SubscriptionState {
  tier: PlanTier;
  isLoading: boolean;
  features: PlanFeatures;

  initialize: () => Promise<void>;
  canUseFeature: (feature: keyof PlanFeatures) => boolean;
  getLimit: (feature: 'maxWatchlist' | 'maxDailyTrades') => number;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  tier: 'free',
  isLoading: false,
  features: PLAN_FEATURES.free,

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: session } = await insforge.auth.getCurrentSession();
      if (!session?.session?.user) {
        set({ tier: 'free', features: PLAN_FEATURES.free, isLoading: false });
        return;
      }

      // Check subscription from database
      const { data } = await insforge.database
        .from('subscriptions')
        .select()
        .eq('user_id', session.session.user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (data && typeof data === 'object' && 'tier' in data) {
        const tier = (data as { tier: PlanTier }).tier;
        set({ tier, features: PLAN_FEATURES[tier], isLoading: false });
      } else {
        set({ tier: 'free', features: PLAN_FEATURES.free, isLoading: false });
      }
    } catch {
      set({ tier: 'free', features: PLAN_FEATURES.free, isLoading: false });
    }
  },

  canUseFeature: (feature) => {
    const val = get().features[feature];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val !== 0;
    return false;
  },

  getLimit: (feature) => {
    return get().features[feature];
  },
}));
