-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'RESOLVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable "users"
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "telegram_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verification_token" TEXT,
    "verification_token_expiry" TIMESTAMP(3),
    "email_alerts" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "is_two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "password_reset_token" TEXT,
    "password_reset_token_expiry" TIMESTAMP(3),
    "premium_until" TIMESTAMP(3),
    "last_payment_date" TIMESTAMP(3),
    "subscription_status" TEXT NOT NULL DEFAULT 'inactive',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Add email_alerts column if it doesn't exist (for existing tables)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='email_alerts') THEN
        ALTER TABLE "users" ADD COLUMN "email_alerts" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- CreateTable "wallets"
CREATE TABLE IF NOT EXISTS "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable "alerts"
CREATE TABLE IF NOT EXISTS "alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable "portfolio_snapshots"
CREATE TABLE IF NOT EXISTS "portfolio_snapshots" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_value_usd" DECIMAL(65,30) NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable "payments"
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USDT',
    "network" TEXT NOT NULL DEFAULT 'TRC20',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "subscription_months" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable "support_tickets"
CREATE TABLE IF NOT EXISTS "support_tickets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable "whale_transactions"
CREATE TABLE IF NOT EXISTS "whale_transactions" (
    "id" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "from_label" TEXT,
    "to_address" TEXT NOT NULL,
    "to_label" TEXT,
    "value" TEXT NOT NULL,
    "value_usd" DECIMAL(65,30),
    "token" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "block_number" INTEGER NOT NULL,
    "is_to_exchange" BOOLEAN NOT NULL DEFAULT false,
    "is_from_exchange" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whale_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable "whale_alerts"
CREATE TABLE IF NOT EXISTS "whale_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "wallet_label" TEXT,
    "chain" TEXT NOT NULL,
    "min_amount" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whale_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable "tracked_wallets"
CREATE TABLE IF NOT EXISTS "tracked_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracked_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable "sentiment_data"
CREATE TABLE IF NOT EXISTS "sentiment_data" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "volume" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentiment_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable "sentiment_alerts"
CREATE TABLE IF NOT EXISTS "sentiment_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentiment_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable "exchange_connections"
CREATE TABLE IF NOT EXISTS "exchange_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exchange" TEXT NOT NULL,
    "api_key" TEXT NOT NULL,
    "api_secret" TEXT NOT NULL,
    "label" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_sync" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exchange_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable "defi_positions"
CREATE TABLE IF NOT EXISTS "defi_positions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "tokens" JSONB NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "apy" DECIMAL(65,30),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "defi_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable "contract_analysis"
CREATE TABLE IF NOT EXISTS "contract_analysis" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "name" TEXT,
    "symbol" TEXT,
    "security_score" DECIMAL(65,30) NOT NULL,
    "is_honeypot" BOOLEAN NOT NULL,
    "is_rugpull" BOOLEAN NOT NULL,
    "ownership_renounced" BOOLEAN NOT NULL,
    "liquidity_locked" BOOLEAN NOT NULL,
    "buy_tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "sell_tax" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "is_mintable" BOOLEAN NOT NULL DEFAULT false,
    "is_proxy" BOOLEAN NOT NULL DEFAULT false,
    "warnings" JSONB NOT NULL,
    "analyzed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable "token_approvals"
CREATE TABLE IF NOT EXISTS "token_approvals" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "wallet_address" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "spender_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "is_risky" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "token_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable "copy_trading_configs"
CREATE TABLE IF NOT EXISTS "copy_trading_configs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "followed_wallet" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "max_amount_per_trade" DECIMAL(65,30) NOT NULL,
    "stop_loss_percent" DECIMAL(65,30),
    "take_profit_percent" DECIMAL(65,30),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "copy_trading_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable "copy_trades"
CREATE TABLE IF NOT EXISTS "copy_trades" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "config_id" TEXT NOT NULL,
    "whale_wallet" TEXT NOT NULL,
    "whale_tx_hash" TEXT NOT NULL,
    "user_tx_hash" TEXT,
    "token_in" TEXT NOT NULL,
    "token_out" TEXT NOT NULL,
    "amount_in" DECIMAL(65,30) NOT NULL,
    "amount_out" DECIMAL(65,30),
    "status" TEXT NOT NULL,
    "profit" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executed_at" TIMESTAMP(3),

    CONSTRAINT "copy_trades_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_telegram_id_key" ON "users"("telegram_id");
CREATE UNIQUE INDEX IF NOT EXISTS "users_verification_token_key" ON "users"("verification_token");
CREATE UNIQUE INDEX IF NOT EXISTS "users_password_reset_token_key" ON "users"("password_reset_token");

CREATE UNIQUE INDEX IF NOT EXISTS "payments_tx_hash_key" ON "payments"("tx_hash");

CREATE UNIQUE INDEX IF NOT EXISTS "whale_transactions_hash_key" ON "whale_transactions"("hash");
CREATE INDEX IF NOT EXISTS "whale_transactions_chain_timestamp_idx" ON "whale_transactions"("chain", "timestamp");
CREATE INDEX IF NOT EXISTS "whale_transactions_from_label_idx" ON "whale_transactions"("from_label");
CREATE INDEX IF NOT EXISTS "whale_transactions_to_label_idx" ON "whale_transactions"("to_label");

CREATE INDEX IF NOT EXISTS "whale_alerts_user_id_idx" ON "whale_alerts"("user_id");
CREATE INDEX IF NOT EXISTS "whale_alerts_wallet_address_idx" ON "whale_alerts"("wallet_address");

CREATE UNIQUE INDEX IF NOT EXISTS "tracked_wallets_user_id_address_chain_key" ON "tracked_wallets"("user_id", "address", "chain");
CREATE INDEX IF NOT EXISTS "tracked_wallets_user_id_idx" ON "tracked_wallets"("user_id");

CREATE INDEX IF NOT EXISTS "sentiment_data_token_timestamp_idx" ON "sentiment_data"("token", "timestamp");
CREATE INDEX IF NOT EXISTS "sentiment_data_timestamp_idx" ON "sentiment_data"("timestamp");

CREATE INDEX IF NOT EXISTS "sentiment_alerts_user_id_idx" ON "sentiment_alerts"("user_id");

CREATE INDEX IF NOT EXISTS "exchange_connections_user_id_idx" ON "exchange_connections"("user_id");

CREATE INDEX IF NOT EXISTS "defi_positions_user_id_idx" ON "defi_positions"("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "contract_analysis_address_key" ON "contract_analysis"("address");
CREATE INDEX IF NOT EXISTS "contract_analysis_chain_security_score_idx" ON "contract_analysis"("chain", "security_score");

CREATE INDEX IF NOT EXISTS "token_approvals_user_id_idx" ON "token_approvals"("user_id");
CREATE INDEX IF NOT EXISTS "token_approvals_wallet_address_idx" ON "token_approvals"("wallet_address");

CREATE INDEX IF NOT EXISTS "copy_trading_configs_user_id_idx" ON "copy_trading_configs"("user_id");
CREATE INDEX IF NOT EXISTS "copy_trading_configs_followed_wallet_idx" ON "copy_trading_configs"("followed_wallet");

CREATE INDEX IF NOT EXISTS "copy_trades_user_id_idx" ON "copy_trades"("user_id");
CREATE INDEX IF NOT EXISTS "copy_trades_config_id_idx" ON "copy_trades"("config_id");

-- AddForeignKeys (using DO block to avoid errors if they exist)

DO $$ BEGIN
    ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "portfolio_snapshots" ADD CONSTRAINT "portfolio_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "whale_alerts" ADD CONSTRAINT "whale_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "tracked_wallets" ADD CONSTRAINT "tracked_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "sentiment_alerts" ADD CONSTRAINT "sentiment_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "exchange_connections" ADD CONSTRAINT "exchange_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "defi_positions" ADD CONSTRAINT "defi_positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "token_approvals" ADD CONSTRAINT "token_approvals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "copy_trading_configs" ADD CONSTRAINT "copy_trading_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "copy_trading_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN null; END $$;
