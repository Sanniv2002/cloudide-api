/*
  Warnings:

  - You are about to drop the column `is_running` on the `Projects` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('FAILED', 'RUNNING', 'STOPPED', 'TERMINATED');

-- AlterTable
ALTER TABLE "Projects" DROP COLUMN "is_running",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'FAILED';
