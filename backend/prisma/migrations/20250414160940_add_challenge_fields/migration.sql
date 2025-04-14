/*
  Warnings:

  - The values [MEDIUM] on the enum `Difficulty` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ChallengeResource` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Difficulty_new" AS ENUM ('EZ', 'EASY', 'NORMAL', 'HARD', 'EXPERT');
ALTER TABLE "Challenge" ALTER COLUMN "difficulty" TYPE "Difficulty_new" USING ("difficulty"::text::"Difficulty_new");
ALTER TYPE "Difficulty" RENAME TO "Difficulty_old";
ALTER TYPE "Difficulty_new" RENAME TO "Difficulty";
DROP TYPE "Difficulty_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ChallengeResource" DROP CONSTRAINT "ChallengeResource_challengeId_fkey";

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "subtitle" TEXT,
ADD COLUMN     "url" TEXT;

-- DropTable
DROP TABLE "ChallengeResource";

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "value" TEXT NOT NULL,
    "name" TEXT,
    "mimeType" TEXT,
    "size" INTEGER,
    "fileData" BYTEA,
    "challengeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resource_challengeId_idx" ON "Resource"("challengeId");

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
