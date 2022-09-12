/*
  Warnings:

  - You are about to drop the column `token` on the `sessions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[refreshToken]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[bearerToken]` on the table `sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bearerToken` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `sessions_token_key` ON `sessions`;

-- AlterTable
ALTER TABLE `sessions` DROP COLUMN `token`,
    ADD COLUMN `bearerToken` VARCHAR(191) NOT NULL,
    ADD COLUMN `refreshToken` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `sessions_refreshToken_key` ON `sessions`(`refreshToken`);

-- CreateIndex
CREATE UNIQUE INDEX `sessions_bearerToken_key` ON `sessions`(`bearerToken`);
