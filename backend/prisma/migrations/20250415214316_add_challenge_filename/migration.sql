/*
  Warnings:

  - Added the required column `filename` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "filename" TEXT NOT NULL;
