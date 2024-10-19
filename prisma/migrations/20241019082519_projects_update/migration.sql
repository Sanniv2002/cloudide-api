/*
  Warnings:

  - Added the required column `is_running` to the `Projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "is_running" BOOLEAN NOT NULL,
ADD COLUMN     "resumedAt" TIMESTAMP(3),
ADD COLUMN     "stoppedAt" TIMESTAMP(3);