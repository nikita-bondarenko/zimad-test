/*
  Warnings:

  - Changed the type of `uploaded` on the `files` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `touched_at` on the `tokens` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `files` DROP COLUMN `uploaded`,
    ADD COLUMN `uploaded` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `tokens` DROP COLUMN `touched_at`,
    ADD COLUMN `touched_at` DATETIME(3) NOT NULL;
