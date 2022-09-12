-- AlterTable
ALTER TABLE `files` MODIFY `uploaded` BIGINT NOT NULL;

-- AlterTable
ALTER TABLE `tokens` MODIFY `touched_at` BIGINT NOT NULL;
