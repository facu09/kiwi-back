-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "domicilio" TEXT,
    "mobbile" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ttPedidos" (
    "idPedido" SERIAL NOT NULL,
    "fecHsAltPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecHsEnvio" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "domicilio" TEXT,
    "mobbile" TEXT,
    "dscPedido" TEXT,
    "totalPedido" DECIMAL(65,30) NOT NULL,
    "totalPaga" DECIMAL(65,30),
    "totalVuelto" DECIMAL(65,30),
    "xAsingadoCadete" TEXT,
    "fecHsAsignado" TIMESTAMP(3),
    "xEntregado" TEXT,
    "fecHsEntregado" TIMESTAMP(3),
    "obsEntregaUs" TEXT,
    "pedidoDiferido" BOOLEAN,
    "canceladoXUs" BOOLEAN,
    "motivoCancelUs" TEXT,
    "canceladoXHel" BOOLEAN,
    "motivoCancelHel" TEXT,

    CONSTRAINT "ttPedidos_pkey" PRIMARY KEY ("idPedido")
);

-- CreateTable
CREATE TABLE "ttPedidosLineas" (
    "idLinea" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "prodCod" TEXT NOT NULL,
    "cantidad" DECIMAL(65,30) NOT NULL,
    "precioUnit" DECIMAL(65,30) NOT NULL,
    "importe" DECIMAL(65,30) NOT NULL,
    "importeConIVA" DECIMAL(65,30) NOT NULL,
    "dscLinea" TEXT,

    CONSTRAINT "ttPedidosLineas_pkey" PRIMARY KEY ("idLinea")
);

-- CreateTable
CREATE TABLE "ttPedidosLineasDetalle" (
    "idDetLineaPed" SERIAL NOT NULL,
    "pedidoLineaId" INTEGER NOT NULL,
    "gustoId" INTEGER NOT NULL,

    CONSTRAINT "ttPedidosLineasDetalle_pkey" PRIMARY KEY ("idDetLineaPed")
);

-- CreateTable
CREATE TABLE "ttGustos" (
    "idGusto" INTEGER NOT NULL,
    "nomGusto" TEXT NOT NULL,
    "dscGusto" TEXT,

    CONSTRAINT "ttGustos_pkey" PRIMARY KEY ("idGusto")
);

-- CreateTable
CREATE TABLE "ttProductos" (
    "codProd" TEXT NOT NULL,
    "nomProd" TEXT NOT NULL,
    "unidad" TEXT NOT NULL,
    "precioUnitFinal" DECIMAL(65,30) NOT NULL,
    "foto" TEXT,

    CONSTRAINT "ttProductos_pkey" PRIMARY KEY ("codProd")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "ttPedidos" ADD CONSTRAINT "ttPedidos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ttPedidosLineas" ADD CONSTRAINT "ttPedidosLineas_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "ttPedidos"("idPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ttPedidosLineas" ADD CONSTRAINT "ttPedidosLineas_prodCod_fkey" FOREIGN KEY ("prodCod") REFERENCES "ttProductos"("codProd") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ttPedidosLineasDetalle" ADD CONSTRAINT "ttPedidosLineasDetalle_pedidoLineaId_fkey" FOREIGN KEY ("pedidoLineaId") REFERENCES "ttPedidosLineas"("idLinea") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ttPedidosLineasDetalle" ADD CONSTRAINT "ttPedidosLineasDetalle_gustoId_fkey" FOREIGN KEY ("gustoId") REFERENCES "ttGustos"("idGusto") ON DELETE RESTRICT ON UPDATE CASCADE;
