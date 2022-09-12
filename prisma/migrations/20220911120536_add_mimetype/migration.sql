/*
  Warnings:

  - You are about to drop the column `uploaded` on the `files` table. All the data in the column will be lost.
  - Added the required column `mmimetype` to the `files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedAt` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `files` DROP COLUMN `uploaded`,
    ADD COLUMN `mmimetype` VARCHAR(191) NOT NULL,
    ADD COLUMN `uploadedAt` VARCHAR(191) NOT NULL;
