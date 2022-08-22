/*
  Warnings:

  - Made the column `estadoActivo` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "estadoActivo" SET NOT NULL,
ALTER COLUMN "estadoActivo" SET DEFAULT true;
