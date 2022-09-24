const prisma = require("../utils/clientPrismaPostgre");
const XDate = require("xdate");

const { v4: uuidv4 } = require("uuid");

class Pedido {
    constructor( userId, domicilio, mobbile, dscPedido, totalPedido, totalPaga, totalVuelto, pedidoDiferido ) {
      this.userId = userId;
      this.domicilio = domicilio;
      this.mobbile = mobbile;
      this.dscPedido = dscPedido;
      this.totalPedido = totalPedido;
      this.totalPaga = totalPaga;
      this.totalVuelto = totalVuelto;
      this.pedidoDiferido = pedidoDiferido? pedidoDiferido : false;
    }

//Acá va el Alta en la DB
async save() {
    try {
        console.log (this.userId + ", " +
            this.domicilio + ", " +
            this.mobbile + ", " +
            this.dscPedido + ", " +
            this.totalPedido + ", " +
            this.totalPaga + ", " +
            this.totalVuelto + ", " +
            this.pedidoDiferido + ".")
        
        const newPed = await prisma.ttPedidos.create({
            data: {
                userId : this.userId,
                domicilio: this.domicilio,
                mobbile: this.mobbile,
                dscPedido: this.dscPedido,
                totalPedido: this.totalPedido,
                totalPaga: this.totalPaga,
                totalVuelto: this.totalVuelto,
                pedidoDiferido: this.pedidoDiferido,
            },
        });
        // console.log (this)
        // console.log (newPed)
        // return this; //devuelvo la instancia de pedido que se construyó
        return newPed  //devuelvo el registro que se creo en DB para poder tener el idPedido Autonumerico que se creo
    } catch (err){
        return "Error e models/pedidos" + err;
    }
  }

  static async getById(idPedido) {
    console.log("==> getById --> " +  idPedido)
    try {
      const pedidoFinded = await prisma.ttPedidos.findUnique({
        where: {
          idPedido: parseInt(idPedido,10),
        },
      })
      return pedidoFinded;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async getLastPedido() {
    console.log("==> get Last Pedido --> "  )
    try {
      const pedidoFinded = await prisma.ttPedidos.findFirst({
         orderBy: {
          idPedido: 'desc',
        },
      })
      return pedidoFinded;
      //habria que ver como hacerlo con SQL STRING directo

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async getLasPedidDeUnUsuario(piIdUser) {
    console.log("==> get Last Pedido de 1 Usuario--> "  )
    try {
      const pedidoFinded = await prisma.ttPedidos.findFirst({
        where: {
          userId: parseInt(piIdUser,10),
        },
        orderBy: {
          idPedido: 'desc',
        },
      })
      return pedidoFinded;
      //habria que ver como hacerlo con SQL STRING directo
      
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  // {
  //   include: {
  //     ttPedidosLineasDetalle: {
  //       include: {
  //         ttGustos: true,
  //       },
  //     }, 
  //   },
  // },

  static async getAllPedidosPorAsignar() {
    try {
        const allPedidosXAsignar = await prisma.ttPedidos.findMany({
            where: {
              xAsingadoCadete: null,
              canceladoXUs: null,
              canceladoXHel: null,
            },
          })
        return allPedidosXAsignar
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }  

  static async getAllPedidosAsignadosPorEntregar() {
    try {
        const allPedidosAsignXEntregar = await prisma.ttPedidos.findMany({
            where: {
              xAsingadoCadete: "X",
              xEntregado: null,
            },
          })
        return allPedidosAsignXEntregar
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  } 

  static async cancelPedidoByIdByUs(idPedido, motivoCancelUs) {
    console.log("==> cancelPedidoById --> ", idPedido, " motivo: ", motivoCancelUs)
    try {
      // console.log("el mail recibido en findByEmail", email)
      const pedidoCanceled = await prisma.ttPedidos.update({
        where: {
            idPedido: parseInt(idPedido,10),
          },
          data: {
            fecHsCancelPedido: new XDate().toISOString(),
            canceladoXUs: true,
            motivoCancelUs: motivoCancelUs,
          },
        })
        // console.log (updatedUser)
        return pedidoCanceled
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async cancelPedidoByIdByHel(idPedido, motivoCancelHel) {
    console.log("==> cancelPedidoById --> ", idPedido, " motivo" , motivoCancelHel)
    try {
      // console.log("el mail recibido en findByEmail", email)
      const pedidoCanceled = await prisma.ttPedidos.update({
        where: {
            idPedido:  parseInt(idPedido,10),
          },
          data: {
            fecHsCancelPedido: new XDate().toISOString(),
            canceladoXHel: true,
            motivoCancelHel: motivoCancelHel,
          },
        })
        // console.log (updatedUser)
        return pedidoCanceled
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async asignarPedidoACadeteById(idPedido, fecHsEstArriboEnIsoString, idUserCadete, nomCadete) {
   //VC fecHsEstArriboEnIsoString: siempre viene lleno en formato ISO GMT UTC+00, ej: "2022-08-20T19:37:00.333Z" con lo que hay pener en la DB
    try {
      console.log(".Model: asignarPedidoACadeteById --> idPedido:" + idPedido +  ", fecHsEstimada Arribo: " + fecHsEstArriboEnIsoString + ",  cadete: " + nomCadete + "." )

      const pedidoAsignadoACadete = await prisma.ttPedidos.update({
        where: {
            idPedido: parseInt(idPedido,10),
          },
          data: {
            xAsingadoCadete: "X",
            fecHsAsignado: new XDate().toISOString() ,
            fecHsEstiamdaArribo: fecHsEstArriboEnIsoString,
            idUserCadete:  idUserCadete,
            nomCadete: nomCadete,
          },
        })
        // console.log (updatedUser)
        return pedidoAsignadoACadete
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async entregaDePedidoById(idPedido) {
    console.log("==> Model: entregaDePedidoById --> ", idPedido)
    try {
       const pedidoEntregado = await prisma.ttPedidos.update({
        where: {
            idPedido: parseInt(idPedido,10),
          },
          data: {
            xEntregado: "X",
            fecHsEntregado: new XDate().toISOString(),
          },
        })
        // console.log (updatedUser)
        return pedidoEntregado;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }
}

class LineaPedido {
  constructor( idPedido, codProd, cantidad, precioUnit, importe, importeConIVA, dscLinea ) {
    this.idPedido = idPedido;
    this.codProd = codProd;
    this.cantidad = cantidad;
    this.precioUnit = precioUnit;
    this.importe = importe;
    this.importeConIVA  = importeConIVA;
    this.dscLinea = dscLinea;
  }

//Acá va el Alta en la DB la linea asociada al Pedido
async save() {
  try {
      console.log (".Entro al Save de la Linea Pedido")
      console.log (this.idPedido + ", " +
          this.codProd + ", " +
          this.cantidad + ", " +
          this.precioUnit + ", " +
          this.importe + ", " +
          this.importeConIVA + ", " +
          this.dscLinea + ".")
      const newLinea = await prisma.ttPedidosLineas.create({
          data: {
              idPedido: this.idPedido,
              codProd: this.codProd,
              cantidad: this.cantidad,
              precioUnit: this.precioUnit,
              importe: this.importe,
              importeConIVA: this.importeConIVA,
              dscLinea: this.dscLinea,
          },
      });
      console.log (newLinea)
      return newLinea; //devuelvo la instancia de pedido que se construyó
  } catch (err){
      return "Error e models/pedidos" + err;
  }
}
}

class LineaPedidoDetalle {
  constructor( idLineaPedido, codGusto, cantGusto ) {
    this.idLineaPedido = idLineaPedido;
    this.codGusto = codGusto;
    this.cantGusto = cantGusto;
  }

  //Acá va el Alta en la DB la linea asociada al Pedido
  async save() {
    try {
        console.log (this.idLineaPedido+ ", " +
            this.codGusto + ", " +
            this.cantGusto + ".")
        const newLineaDet = await prisma.ttPedidosLineasDetalle.create({
            data: {
                idLineaPedido : this.idLineaPedido,
                codGusto: this.codGusto,
                cantGusto: this.cantGusto,
            },
        });
        console.log (newLineaDet)
        return newLineaDet; //devuelvo la instancia de pedido que se construyó
    } catch (err){
        return "Error e models/pedidos" + err;
    }
  }
}



// module.exports = Pedido;

module.exports = { 
  Pedido, 
  LineaPedido,
  LineaPedidoDetalle,
} ;
//Aprendizaje: ahora en el controller voy a tener que invocar asi: --> 
// new Pedido.Pedido(...) para construir.
// LPM 
