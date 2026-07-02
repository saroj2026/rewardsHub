-- AlterTable
ALTER TABLE "card_products" ADD COLUMN     "annual_fee" DECIMAL(65,30),
ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[];
