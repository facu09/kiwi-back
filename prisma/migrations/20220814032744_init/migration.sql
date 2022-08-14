/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ttGustos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ttPedidos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ttPedidosLineas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ttPedidosLineasDetalle` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ttProductos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ttPedidos" DROP CONSTRAINT "ttPedidos_userId_fkey";

-- DropForeignKey
ALTER TABLE "ttPedidosLineas" DROP CONSTRAINT "ttPedidosLineas_pedidoId_fkey";

-- DropForeignKey
ALTER TABLE "ttPedidosLineas" DROP CONSTRAINT "ttPedidosLineas_prodCod_fkey";

-- DropForeignKey
ALTER TABLE "ttPedidosLineasDetalle" DROP CONSTRAINT "ttPedidosLineasDetalle_gustoId_fkey";

-- DropForeignKey
ALTER TABLE "ttPedidosLineasDetalle" DROP CONSTRAINT "ttPedidosLineasDetalle_pedidoLineaId_fkey";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "ttGustos";

-- DropTable
DROP TABLE "ttPedidos";

-- DropTable
DROP TABLE "ttPedidosLineas";

-- DropTable
DROP TABLE "ttPedidosLineasDetalle";

-- DropTable
DROP TABLE "ttProductos";

-- DropEnum
DROP TYPE "Role";
