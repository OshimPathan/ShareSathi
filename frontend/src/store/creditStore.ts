import { create } from 'zustand';
import {
  getUserCredits,
  purchaseCredits as purchaseCreditsService,
  getCreditPackages as getCreditPackagesService,
} from '../services/db/credits';
import type { UserCredits, CreditPackage } from '../types';

interface CreditState {
  credits: UserCredits | null;
  packages: CreditPackage[];
  isLoading: boolean;
  error: string | null;

  initialize: () => Promise<void>;
  loadPackages: () => Promise<void>;
  purchaseCredits: (packageId: string, paymentRef?: string) => Promise<{ success: boolean; message: string }>;
  refreshBalance: () => Promise<void>;
}

export const useCreditStore = create<CreditState>((set) => ({
  credits: null,
  packages: [],
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    try {
      const [credits, packages] = await Promise.all([
        getUserCredits(),
        getCreditPackagesService(),
      ]);
      set({ credits, packages, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Failed to load credits' });
    }
  },

  loadPackages: async () => {
    const packages = await getCreditPackagesService();
    set({ packages });
  },

  purchaseCredits: async (packageId: string, paymentRef?: string) => {
    set({ isLoading: true, error: null });
    const result = await purchaseCreditsService(packageId, paymentRef);

    if (result.success && result.credits) {
      set({ credits: result.credits, isLoading: false });
    } else {
      set({ isLoading: false, error: result.message });
    }

    return { success: result.success, message: result.message };
  },

  refreshBalance: async () => {
    const credits = await getUserCredits();
    if (credits) set({ credits });
  },
}));
