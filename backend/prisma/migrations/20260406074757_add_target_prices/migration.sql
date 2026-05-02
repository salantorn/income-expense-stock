/*
  Warnings:

  - You are about to drop the column `is_target_triggered` on the `stock_positions` table. All the data in the column will be lost.
  - You are about to drop the column `target_sell_price` on the `stock_positions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "stock_positions" DROP COLUMN "is_target_triggered",
DROP COLUMN "target_sell_price",
ADD COLUMN     "is_stop_loss_alerted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_take_profit_alerted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stop_loss_price" DECIMAL(15,2),
ADD COLUMN     "take_profit_price" DECIMAL(15,2);
