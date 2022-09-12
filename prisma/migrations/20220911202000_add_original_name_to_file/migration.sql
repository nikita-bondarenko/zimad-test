/*
  Warnings:

  - Added the required column `original_name` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `files` ADD COLUMN `original_name` VARCHAR(191) NOT NULL;
