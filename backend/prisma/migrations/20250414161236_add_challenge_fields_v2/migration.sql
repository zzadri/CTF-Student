/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "fileUrl",
DROP COLUMN "imageUrl",
ADD COLUMN     "fileb64" TEXT,
ADD COLUMN     "imageb64" TEXT;
