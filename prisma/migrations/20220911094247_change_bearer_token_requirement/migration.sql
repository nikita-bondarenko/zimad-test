-- DropIndex
DROP INDEX `tokens_bearerToken_key` ON `tokens`;

-- AlterTable
ALTER TABLE `tokens` MODIFY `bearerToken` VARCHAR(191) NULL;
