/*
  Warnings:

  - You are about to drop the column `priceSnapshot` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `roomType` on the `booking` table. All the data in the column will be lost.
  - Added the required column `totalCommission` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPax` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPrice` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `priceSnapshot`,
    DROP COLUMN `roomType`,
    ADD COLUMN `doubleCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `priceDoubleSnapshot` INTEGER NULL,
    ADD COLUMN `priceQuadSnapshot` INTEGER NULL,
    ADD COLUMN `priceTripleSnapshot` INTEGER NULL,
    ADD COLUMN `quadCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `totalCommission` INTEGER NOT NULL,
    ADD COLUMN `totalPax` INTEGER NOT NULL,
    ADD COLUMN `totalPrice` INTEGER NOT NULL,
    ADD COLUMN `tripleCount` INTEGER NOT NULL DEFAULT 0;
