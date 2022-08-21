/*
  Warnings:

  - You are about to drop the column `fecHsEnvio` on the `ttPedidos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(0);

-- AlterTable
ALTER TABLE "ttPedidos" DROP COLUMN "fecHsEnvio",
ADD COLUMN     "fecHsEnvioDiferido" TIMESTAMPTZ(0),
ALTER COLUMN "fecHsAltPedido" SET DATA TYPE TIMESTAMPTZ(0),
ALTER COLUMN "fecHsAsignado" SET DATA TYPE TIMESTAMPTZ(0),
ALTER COLUMN "fecHsEntregado" SET DATA TYPE TIMESTAMPTZ(0),
ALTER COLUMN "fecHsEstiamdaArribo" SET DATA TYPE TIMESTAMPTZ(0);
