/*
  Warnings:

  - A unique constraint covering the columns `[PORT]` on the table `Projects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Projects" ADD COLUMN     "PORT" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Projects_PORT_key" ON "Projects"("PORT");
