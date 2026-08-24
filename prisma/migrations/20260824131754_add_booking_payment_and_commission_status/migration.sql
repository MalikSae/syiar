-- AlterTable
ALTER TABLE `booking` ADD COLUMN `commissionStatus` VARCHAR(191) NOT NULL DEFAULT 'not_eligible',
    ADD COLUMN `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending';
