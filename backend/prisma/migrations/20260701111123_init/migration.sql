-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('otp', 'google', 'apple', 'guest');

-- CreateEnum
CREATE TYPE "CardNetwork" AS ENUM ('visa', 'mastercard', 'rupay', 'amex');

-- CreateEnum
CREATE TYPE "RateType" AS ENUM ('flat', 'tiered');

-- CreateEnum
CREATE TYPE "CapPeriod" AS ENUM ('monthly', 'annual');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('percentage', 'flat_amount', 'cashback');

-- CreateEnum
CREATE TYPE "PointBalanceStatus" AS ENUM ('active', 'redeemed', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "auth_provider" "AuthProvider" NOT NULL,
    "household_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_products" (
    "id" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "network" "CardNetwork" NOT NULL,
    "card_type" TEXT NOT NULL,
    "last_verified_at" TIMESTAMP(3),
    "source_confidence" DOUBLE PRECISION,

    CONSTRAINT "card_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_rules" (
    "id" TEXT NOT NULL,
    "card_product_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "rate_type" "RateType" NOT NULL,
    "rate_value" DECIMAL(65,30) NOT NULL,
    "cap_amount" DECIMAL(65,30),
    "cap_period" "CapPeriod",
    "exclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_to" TIMESTAMP(3),

    CONSTRAINT "reward_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "mcc_code" TEXT,
    "aliases" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "card_product_id" TEXT,
    "merchant_id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discount_type" "DiscountType" NOT NULL,
    "discount_value" DECIMAL(65,30) NOT NULL,
    "min_transaction" DECIMAL(65,30),
    "requires_enrollment" BOOLEAN NOT NULL DEFAULT false,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "source" TEXT,
    "last_verified_at" TIMESTAMP(3),

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_product_id" TEXT NOT NULL,
    "nickname" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_balances" (
    "id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "points_batch_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),
    "status" "PointBalanceStatus" NOT NULL DEFAULT 'active',

    CONSTRAINT "point_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "card_id" TEXT NOT NULL,
    "merchant_id" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "category" TEXT NOT NULL,
    "gst_eligible" BOOLEAN NOT NULL DEFAULT false,
    "entered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "messages" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "reward_rules_card_product_id_idx" ON "reward_rules"("card_product_id");

-- CreateIndex
CREATE INDEX "offers_merchant_id_idx" ON "offers"("merchant_id");

-- CreateIndex
CREATE INDEX "offers_card_product_id_idx" ON "offers"("card_product_id");

-- CreateIndex
CREATE INDEX "cards_user_id_idx" ON "cards"("user_id");

-- CreateIndex
CREATE INDEX "point_balances_card_id_idx" ON "point_balances"("card_id");

-- CreateIndex
CREATE INDEX "transactions_user_id_idx" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "transactions_card_id_idx" ON "transactions"("card_id");

-- CreateIndex
CREATE INDEX "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");

-- AddForeignKey
ALTER TABLE "reward_rules" ADD CONSTRAINT "reward_rules_card_product_id_fkey" FOREIGN KEY ("card_product_id") REFERENCES "card_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_card_product_id_fkey" FOREIGN KEY ("card_product_id") REFERENCES "card_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_card_product_id_fkey" FOREIGN KEY ("card_product_id") REFERENCES "card_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_balances" ADD CONSTRAINT "point_balances_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_card_id_fkey" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_merchant_id_fkey" FOREIGN KEY ("merchant_id") REFERENCES "merchants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
