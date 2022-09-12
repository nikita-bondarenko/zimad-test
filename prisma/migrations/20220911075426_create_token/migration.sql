/*
  Warnings:

  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_user_id_fkey`;

-- DropTable
DROP TABLE `sessions`;

-- CreateTable
CREATE TABLE `tokens` (
    `refreshToken` VARCHAR(191) NOT NULL,
    `bearerToken` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `touched_at` INTEGER NOT NULL,

    UNIQUE INDEX `tokens_refreshToken_key`(`refreshToken`),
    UNIQUE INDEX `tokens_bearerToken_key`(`bearerToken`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tokens` ADD CONSTRAINT `tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
