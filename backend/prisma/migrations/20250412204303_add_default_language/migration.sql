/*
  Warnings:

  - Made the column `languageId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_languageId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "languageId" SET NOT NULL,
ALTER COLUMN "languageId" SET DEFAULT 'fr';

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES "Language"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
