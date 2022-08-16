/*
  Warnings:

  - Added the required column `dscProd` to the `ttProductos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ttProductos" ADD COLUMN     "dscProd" VARCHAR(100) NOT NULL;
