const prisma = require("../utils/clientPrismaPostgre");
const XDate = require("XDate");

const { v4: uuidv4 } = require("uuid");

class Pedido {
    constructor( userId, domicilio, mobbile, dscPedido, totalPedido, totalPaga, totalVuelto, pedidoDiferido) {
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
        await prisma.ttPedidos.create({
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
        console.log (this)
        return this; //devuelvo la instancia de pedido que se construyó
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

  static async cancelPedidoByIdByUs(idPedido, userId, motivoCancelUs) {
    console.log("==> cancelPedidoById --> ", idPedido, " motivo: ", motivoCancelUs)
    try {
      // console.log("el mail recibido en findByEmail", email)
      const pedidoCanceled = await prisma.ttPedidos.update({
        where: {
            idPedido: parseInt(idPedido,10),
          },
          data: {
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

  static async asignarPedidoACadeteById(idPedido, fecHsEstArribo, nomCadete) {
   //fecHsEstArribo: si viene lleno viene en formato GMT UTC+00, ej: "2022-08-20T19:37:00.333Z",
    console.log("==> asignarPedidoACadeteById --> idPedido:" + idPedido +  ", fecHsEstimada Arribo: " + fecHsEstArribo + ",  cadete: " + nomCadete + "." )

    const today = new XDate();

    console.log("Today is ---> :) ", today )
    console.log("Today is ---> to ISO --> :) ", today.toISOString() )

    let lsFecHsEstimaArribo = today

    //Sino vino fecHsEstiamdaArribo del Front: le agrego 45 minutos (tiempo estandar de demora) a la fecHsAsignado para obetner la fecHsEstimadaArribao
    if (!fecHsEstArribo || fecHsEstArribo === "") {
        console.log ("ENTRO AL VACIO o '' --> le sumo 45 minuts a la fecHora Actual: --> ")
        lsFecHsEstimaArribo = today.addMinutes(45).toISOString()
    } else {
        console.log ("ENTRO AL TIENE DATOS DEL FRONT")
        lsFecHsEstimaArribo = fecHsEstArribo
    }

    console.log ("La hora de arribo estamiada es: ---> :-)", lsFecHsEstimaArribo)

    try {
       const pedidoAsignadoACadete = await prisma.ttPedidos.update({
        where: {
            idPedido: parseInt(idPedido,10),
          },
          data: {
            xAsingadoCadete: "X",
            fecHsAsignado: new XDate().toISOString() ,
            fecHsEstiamdaArribo: lsFecHsEstimaArribo,
            nomCadete: nomCadete,
            // por ahora no se guardan a que cadete --> proxima iteración
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


module.exports = Pedido;