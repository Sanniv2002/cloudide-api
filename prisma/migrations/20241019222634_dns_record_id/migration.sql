/*
  Warnings:

  - A unique constraint covering the columns `[dns_record_id]` on the table `Projects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "dns_record_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Projects_dns_record_id_key" ON "Projects"("dns_record_id");
