-- CreateTable
CREATE TABLE `Package` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `airline` VARCHAR(191) NOT NULL,
    `hotelMakkah` VARCHAR(191) NOT NULL,
    `hotelMadinah` VARCHAR(191) NOT NULL,
    `include` TEXT NOT NULL,
    `exclude` TEXT NOT NULL,
    `itinerary` TEXT NOT NULL,
    `priceQuad` INTEGER NULL,
    `priceTriple` INTEGER NULL,
    `priceDouble` INTEGER NULL,
    `commissionAmount` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PackageDeparture` (
    `id` VARCHAR(191) NOT NULL,
    `tenantId` VARCHAR(191) NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
