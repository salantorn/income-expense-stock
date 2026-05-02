-- AlterTable
ALTER TABLE "stock_positions" ADD COLUMN     "is_target_triggered" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "target_sell_price" DECIMAL(15,2);
