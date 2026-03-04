-- ============================================================
-- Practice Trading Credits System
-- Run via InsForge run-raw-sql MCP tool
-- ============================================================

-- 1. Credit packages available for purchase
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price_npr DECIMAL(10,2) NOT NULL,       -- Real price in Nepali Rupees
    credits INTEGER NOT NULL,                -- Credits awarded
    bonus_credits INTEGER DEFAULT 0,         -- Extra bonus credits
    description TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default packages
INSERT INTO credit_packages (name, price_npr, credits, bonus_credits, description, is_popular, sort_order) VALUES
    ('Starter',   25,   100,   0,  'Perfect for beginners to try a few practice trades',          false, 1),
    ('Popular',   50,   250,  50,  'Most popular — great value for regular practice',             true,  2),
    ('Pro',      100,   600, 100,  'Best value! Serious practice for aspiring traders',           false, 3),
    ('Ultimate', 200,  1500, 300,  'Maximum credits for power users who want unlimited practice', false, 4)
ON CONFLICT DO NOTHING;

-- 2. User credit balance
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. Credit transaction ledger (purchases + debits)
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('purchase', 'trade_debit', 'bonus', 'refund')),
    amount INTEGER NOT NULL,                 -- positive for credit, negative for debit
    balance_after INTEGER NOT NULL,          -- balance after this transaction
    description TEXT,
    package_id UUID REFERENCES credit_packages(id),
    payment_reference VARCHAR(255),          -- Khalti/eSewa token
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Practice portfolio (separate from main paper trading portfolio)
CREATE TABLE IF NOT EXISTS practice_portfolio (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    average_buy_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

-- 5. Practice trade history
CREATE TABLE IF NOT EXISTS practice_trades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    action VARCHAR(4) NOT NULL CHECK (action IN ('BUY', 'SELL')),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    credits_used INTEGER NOT NULL DEFAULT 1,
    fees DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_credits_user ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_txns_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_portfolio_user ON practice_portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_trades_user ON practice_trades(user_id);

-- RLS policies
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_trades ENABLE ROW LEVEL SECURITY;

-- Everyone can read credit packages
CREATE POLICY credit_packages_read ON credit_packages FOR SELECT USING (true);

-- Users read their own credit data
CREATE POLICY user_credits_select ON user_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY user_credits_insert ON user_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY user_credits_update ON user_credits FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY credit_txns_select ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY credit_txns_insert ON credit_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY practice_portfolio_select ON practice_portfolio FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY practice_portfolio_insert ON practice_portfolio FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY practice_portfolio_update ON practice_portfolio FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY practice_portfolio_delete ON practice_portfolio FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY practice_trades_select ON practice_trades FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY practice_trades_insert ON practice_trades FOR INSERT WITH CHECK (auth.uid() = user_id);
