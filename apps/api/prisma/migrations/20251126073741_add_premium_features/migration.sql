/*
  Warnings:

  - A unique constraint covering the columns `[verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'RESOLVED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_payment_date" TIMESTAMP(3),
ADD COLUMN     "premium_until" TIMESTAMP(3),
ADD COLUMN     "subscription_status" TEXT NOT NULL DEFAULT 'inactive',
ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "payments" (
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

-- CreateTable
CREATE TABLE "support_tickets" (
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

-- CreateTable
CREATE TABLE "whale_transactions" (
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

-- CreateTable
CREATE TABLE "whale_alerts" (
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

-- CreateTable
CREATE TABLE "tracked_wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tracked_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sentiment_data" (
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

-- CreateTable
CREATE TABLE "sentiment_alerts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "threshold" DECIMAL(65,30) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sentiment_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_connections" (
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

-- CreateTable
CREATE TABLE "defi_positions" (
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

-- CreateTable
CREATE TABLE "contract_analysis" (
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
    "warnings" JSONB NOT NULL,
    "analyzed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token_approvals" (
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

-- CreateTable
CREATE TABLE "copy_trading_configs" (
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

-- CreateTable
CREATE TABLE "copy_trades" (
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

-- CreateIndex
CREATE UNIQUE INDEX "payments_tx_hash_key" ON "payments"("tx_hash");

-- CreateIndex
CREATE UNIQUE INDEX "whale_transactions_hash_key" ON "whale_transactions"("hash");

-- CreateIndex
CREATE INDEX "whale_transactions_chain_timestamp_idx" ON "whale_transactions"("chain", "timestamp");

-- CreateIndex
CREATE INDEX "whale_transactions_from_label_idx" ON "whale_transactions"("from_label");

-- CreateIndex
CREATE INDEX "whale_transactions_to_label_idx" ON "whale_transactions"("to_label");

-- CreateIndex
CREATE INDEX "whale_alerts_user_id_idx" ON "whale_alerts"("user_id");

-- CreateIndex
CREATE INDEX "whale_alerts_wallet_address_idx" ON "whale_alerts"("wallet_address");

-- CreateIndex
CREATE INDEX "tracked_wallets_user_id_idx" ON "tracked_wallets"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tracked_wallets_user_id_address_chain_key" ON "tracked_wallets"("user_id", "address", "chain");

-- CreateIndex
CREATE INDEX "sentiment_data_token_timestamp_idx" ON "sentiment_data"("token", "timestamp");

-- CreateIndex
CREATE INDEX "sentiment_data_timestamp_idx" ON "sentiment_data"("timestamp");

-- CreateIndex
CREATE INDEX "sentiment_alerts_user_id_idx" ON "sentiment_alerts"("user_id");

-- CreateIndex
CREATE INDEX "exchange_connections_user_id_idx" ON "exchange_connections"("user_id");

-- CreateIndex
CREATE INDEX "defi_positions_user_id_idx" ON "defi_positions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "contract_analysis_address_key" ON "contract_analysis"("address");

-- CreateIndex
CREATE INDEX "contract_analysis_chain_security_score_idx" ON "contract_analysis"("chain", "security_score");

-- CreateIndex
CREATE INDEX "token_approvals_user_id_idx" ON "token_approvals"("user_id");

-- CreateIndex
CREATE INDEX "token_approvals_wallet_address_idx" ON "token_approvals"("wallet_address");

-- CreateIndex
CREATE INDEX "copy_trading_configs_user_id_idx" ON "copy_trading_configs"("user_id");

-- CreateIndex
CREATE INDEX "copy_trading_configs_followed_wallet_idx" ON "copy_trading_configs"("followed_wallet");

-- CreateIndex
CREATE INDEX "copy_trades_user_id_idx" ON "copy_trades"("user_id");

-- CreateIndex
CREATE INDEX "copy_trades_config_id_idx" ON "copy_trades"("config_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_verification_token_key" ON "users"("verification_token");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whale_alerts" ADD CONSTRAINT "whale_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracked_wallets" ADD CONSTRAINT "tracked_wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sentiment_alerts" ADD CONSTRAINT "sentiment_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_connections" ADD CONSTRAINT "exchange_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defi_positions" ADD CONSTRAINT "defi_positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token_approvals" ADD CONSTRAINT "token_approvals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_trading_configs" ADD CONSTRAINT "copy_trading_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "copy_trades" ADD CONSTRAINT "copy_trades_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "copy_trading_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
