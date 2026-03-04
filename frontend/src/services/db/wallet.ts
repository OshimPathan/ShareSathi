// ─── Wallet (authenticated) ────────────────────────────────
import insforge from '../../lib/insforge';
import type { WalletData } from '../../types';

export async function getWallet(): Promise<WalletData | null> {
  const { data: session } = await insforge.auth.getCurrentSession();
  if (!session?.session?.user) return null;
  const userId = session.session.user.id;

  const { data, error } = await insforge.database
    .from('wallets')
    .select()
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    // Auto-create wallet for new users
    const { data: newWallet, error: createErr } = await insforge.database
      .from('wallets')
      .insert({ user_id: userId, balance: 1000000.00 })
      .select()
      .single();
    if (createErr || !newWallet) return null;
    return newWallet as WalletData;
  }
  return data as WalletData;
}
