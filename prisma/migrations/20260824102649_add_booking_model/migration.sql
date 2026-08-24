-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `packageDepartureId` VARCHAR(191) NULL,
    `agentId` VARCHAR(191) NULL,
    `jamaahName` VARCHAR(191) NOT NULL,
    `jamaahPhone` VARCHAR(191) NOT NULL,
    `jamaahEmail` VARCHAR(191) NULL,
    `roomType` VARCHAR(191) NOT NULL,
    `priceSnapshot` INTEGER NOT NULL,
    `commissionAmountSnapshot` INTEGER NOT NULL,
    `referralCodeUsed` VARCHAR(191) NULL,
    `bookingCode` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending_payment',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_bookingCode_key`(`bookingCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
