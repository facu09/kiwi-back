-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" VARCHAR(30) NOT NULL,
    "name" VARCHAR(50),
    "password" VARCHAR(20) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "domicilio" VARCHAR(120),
    "mobbile" VARCHAR(30),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ttPedidos" (
    "idPedido" SERIAL NOT NULL,
    "fecHsAltPedido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecHsEnvio" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "domicilio" VARCHAR(120),
    "mobbile" VARCHAR(30),
    "dscPedido" VARCHAR(150),
    "totalPedido" DECIMAL(12,3) NOT NULL,
    "totalPaga" DECIMAL(12,3),
    "totalVuelto" DECIMAL(12,3),
    "xAsingadoCadete" VARCHAR(1),
    "fecHsAsignado" TIMESTAMP(3),
    "xEntregado" VARCHAR(1),
    "fecHsEntregado" TIMESTAMP(3),
    "obsEntregaUs" VARCHAR(150),
    "pedidoDiferido" BOOLEAN,
    "canceladoXUs" BOOLEAN,
    "motivoCancelUs" VARCHAR(100),
    "canceladoXHel" BOOLEAN,
    "motivoCancelHel" VARCHAR(100),

    CONSTRAINT "ttPedidos_pkey" PRIMARY KEY ("idPedido")
);

-- CreateTable
CREATE TABLE "ttPedidosLineas" (
    "idLinea" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "codProd" VARCHAR(10) NOT NULL,
    "cantidad" DECIMAL(10,2) NOT NULL,
    "precioUnit" DECIMAL(10,3) NOT NULL,
    "importe" DECIMAL(12,3) NOT NULL,
    "importeConIVA" DECIMAL(12,3) NOT NULL,
    "dscLinea" VARCHAR(150),

    CONSTRAINT "ttPedidosLineas_pkey" PRIMARY KEY ("idLinea")
);

-- CreateTable
CREATE TABLE "ttPedidosLineasDetalle" (
    "idDetalleLineaPed" SERIAL NOT NULL,
    "idLineaPedido" INTEGER NOT NULL,
    "codGusto" INTEGER NOT NULL,
    "cantGusto" SMALLINT NOT NULL,

    CONSTRAINT "ttPedidosLineasDetalle_pkey" PRIMARY KEY ("idDetalleLineaPed")
);

-- CreateTable
CREATE TABLE "ttGustos" (
    "codGusto" INTEGER NOT NULL,
    "nombreGusto" VARCHAR(30) NOT NULL,
    "dscGusto" VARCHAR(255),

    CONSTRAINT "ttGustos_pkey" PRIMARY KEY ("codGusto")
);

-- CreateTable
CREATE TABLE "ttProductos" (
    "codProd" VARCHAR(10) NOT NULL,
    "nomProd" VARCHAR(100) NOT NULL,
    "unidad" VARCHAR(14) NOT NULL,
    "precioUnitFinal" DECIMAL(10,3) NOT NULL,
    "foto" TEXT,

    CONSTRAINT "ttProductos_pkey" PRIMARY KEY ("codProd")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
