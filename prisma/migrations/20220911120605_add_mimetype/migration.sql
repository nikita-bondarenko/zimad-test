/*
  Warnings:

  - You are about to drop the column `mmimetype` on the `files` table. All the data in the column will be lost.
  - Added the required column `mimetype` to the `files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `files` DROP COLUMN `mmimetype`,
    ADD COLUMN `mimetype` VARCHAR(191) NOT NULL;
