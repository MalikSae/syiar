-- CreateIndex
CREATE UNIQUE INDEX `Agent_tenantId_phone_key` ON `Agent`(`tenantId`, `phone`);
