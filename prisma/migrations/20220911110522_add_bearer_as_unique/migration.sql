/*
  Warnings:

  - A unique constraint covering the columns `[bearerToken]` on the table `tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `tokens_bearerToken_key` ON `tokens`(`bearerToken`);
