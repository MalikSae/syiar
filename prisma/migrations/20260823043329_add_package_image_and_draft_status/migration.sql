-- AlterTable
ALTER TABLE `package` ADD COLUMN `featuredImageUrl` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'draft';
