const prisma = require("../utils/clientPrismaPostgre");
const pool = require("../utils/clientPostgreSQL");
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


// const resultados = await pool.query('SELECT ' + 
//   ' GT."id", U."email", GT."importe",  GT."tipoGastoId", ' +
//   ' Tipo."nomTipoGasto",  ' + 
//   ' GT."fechaGasto", GT."userId" ' + 
// ' FROM "Gastos" AS GT ' + 
// ' JOIN "User" AS  U ON GT."userId" = U."id" ' +
// ' JOIN "TipoGasto" AS Tipo ON GT."tipoGastoId" = Tipo."id" ' +
// lsWhere + 
// ' ORDER BY gt."fechaGasto" ' );
// // console.log( resultados.rows);
// return resultados.rows

  // 26/09/2022 Andando con Prisma:
  //Traigo el ultimo pedido de la DB para control con Lineas y Gustos de cada Linea.
  static async getLastPedido() {
    console.log("==> get Last Pedido con líneas y gustos de cada una:--> "  )
    try {
      const pedidoFinded = await prisma.ttPedidos.findFirst({
         orderBy: {
          idPedido: 'desc',
        },
      })
      console.log ("IdPedido en cuestion: --> " + pedidoFinded)
    
      // // Con SQL String directo con POOL, y convinado con una vista creada desde pgAdmin4 (vst02_LineasPedido) que ya esta armda puedo filtrar mas facil.
      // //  La contra que el json no queda como json queda como tabla con campos repetidos. ==> de esta manera quedará para el FronEnd la responsabilidad de parsear bien los datos a como deban mostrarse.
      // const pedidoFindedCompleto = await pool.query('SELECT * ' + 
      //   ' FROM "vst02_LineasPedido" AS V ' + 
      //   ' WHERE "idPedido" =  ' + pedidoFinded.idPedido + 
      //   ' ORDER BY V."idDetalleLineaPed" ' );
      // // console.log( resultados.rows);
      // return pedidoFindedCompleto.rows
      
      //Idem anterior con Prisma mandando SQLString directo
      const pedidoFindedCompleto = await prisma.$queryRaw `SELECT * FROM "vst02_LineasPedido" WHERE "idPedido" = ${pedidoFinded.idPedido}` 
    //   const pedidoFindedCompleto = await prisma.$queryRaw(`SELECT pl."idLinea",
    //   pl."idPedido", 
    //   pl."codProd",
    //   p."nomProd",
    //   pl.cantidad,
    //   pl."precioUnit",
    //   pl.importe,
    //   pl."importeConIVA",
    //   pl."dscLinea",
    //   pld."idDetalleLineaPed",
    //   pld."idLineaPedido",
    //   pld."codGusto",
    //   pld."cantGusto",
    //   g."nombreGusto"
    //  FROM "ttPedidosLineas" pl
    //    JOIN "ttProductos" p ON pl."codProd"::text = p."codProd"::text
    //    JOIN ("ttPedidosLineasDetalle" pld
    //    JOIN "ttGustos" g ON pld."codGusto" = g."codGusto") ON pl."idLinea" = pld."idLineaPedido" 
    //  WHERE pl."idPedido" = ` + pedidoFinded.idPedido + `;`)

      return pedidoFindedCompleto

      // // ALTERNATIVA 1: acceder a la Vista creaada desde pgAdmin4 ==> no funciona prisma así, hay que meterle inteligencia leer instructivo: https://www.prisma.io/docs/guides/database/advanced-database-tasks/sql-views-postgres
      // const pedidoFindedCompleto = await prisma.vst02_LineasPedido.findMany({
      //   where: {
      //     idPedido: pedidoFinded.idPedido,
      //   },
      // })
      // return pedidoFindedCompleto

      // // Alterntiva 2: armar el json con los detalles de las lineas del pedido a pedal con 1 funcion:  
      // const  pedidoFindedCompleto = await completaLineasPedidoYGustos(pedidoFinded)
      // //Aprhenedido: Hallazgo está pasando los parametros por referencia boooo
      // return pedidoFinded;
      
      // acá habria que haber trabajado con relaciones adentro del modelo de prisma para simplificar y usar los include.
   
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  // // Lo mudo a String SQL directo
  // static async getLastPedido() {
  //   console.log("==> get Last Pedido SQL x StringSQL directo --> "  )
  //   try {
  //     const lastOrderDB = await pool.query()
  //     return pedidoFinded;
  //     //habria que ver como hacerlo con SQL STRING directo

  //   } catch (error) {
  //       console.log(error);
  //       throw new Error(error);
  //   }   
  // }


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

      const  pedidoFindedCompleto = await completaLineasPedidoYGustos(pedidoFinded)

      return pedidoFinded;
      //habria que ver como hacerlo con SQL STRING directo
      
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  // ## Falta: no pude usar los include xque no use relaciones jajajajaja
  //           para algo sirven las relaciones paaaaa
  //           voy a tratar de montar 1 vista y ver si puedo usarla para que se mas 
  //           facil y ver si arma el json resultante
  //           Para zafar de los 2 do whiles y recorridos con busqueda re primario mal
  //          --> una burrada 6 segundos para traer 1 pedido  buuuuuu!!!!
  //            ==>  Bueno che estoy aprendiendo jajajajaja
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

// FUNCIONES REUSABLES -------------------------------------------------------------
const completaLineasPedidoYGustos = async (pedido) => {
//Funcion para completar las lineas del pedido y los nombres de los Gustos de cada linea  
  let i;
  
  //Voy y busco las lineas del Pedido
  const lineasPedidF = await prisma.ttPedidosLineas.findMany({
    where: {
      idPedido: pedido.idPedido,
    },
  });

  //Recorro las lineas del Pedido para buscar su detalle (gustos) y agregarlos al json que estoy armando de cada linea
  console.log("La Cantidad de lineas del Pedido en cuestion es: --> ", lineasPedidF.length);
  i = 0;
  do {
    //Buco el nombre del codProducto y lo agrego
    const productF = await prisma.ttProductos.findFirst({
      where: {
        codProd: lineasPedidF[i].codProd,
      },
    })
    //Agrego el nomProducto de cada linea del Pedido
    lineasPedidF[i].nomProd = productF.nomProd

    //Voy y busco la  descripcion de cada linea del pedido (que son los gustos)
    const descPedidLinea = await prisma.ttPedidosLineasDetalle.findMany({
      where: {
        idLineaPedido: lineasPedidF[i].idLinea,
      },
    })

    //Agrego el nombre del codGusto del detalle de esa linea
    const descPedidoLineaConNomGustos = await completaNomGustosLinea(descPedidLinea)

    //Agrego el Detalla de cada linea los gustos
    lineasPedidF[i].detalles = descPedidoLineaConNomGustos

      //Avanzo próximo linea del Pedido
    i++;
   
    } while (i < lineasPedidF.length);
  
  //Agrego las lineas al Pedido entonctrado
  pedido.lineasPedido = lineasPedidF

  return pedido
}

const completaNomGustosLinea = async (descPedidLinea) => {
//Le agrego al nombre del gusto a cada linea de detalle de la linea del pedido
// descPedidoLinea son todos los registros de ttPedidosLineasDetalle de 1 Linea de Pedido
  let j;
  j = 0;
  do{
      const gustoDetalle = await prisma.ttGustos.findFirst({
        where: {
          codGusto: descPedidLinea[j].codGusto,
        },
      });

       //Agrego el nombre Gusto al Json del detalle de la Linea
      descPedidLinea[j].nomGusto = gustoDetalle.nombreGusto
     
      console.log("El nombre del gusto encontrado es: para la posicion " + j + " --> " + gustoDetalle.nombreGusto)

      //avanzo en la lista del json
      j++
  } while (j < descPedidLinea.length);

  //finalmente retorno el json descPedidoLinea pero ya agregado el Nombre
  return descPedidLinea

}
// FIN FUNCIONES REUSABLES --------------------------------------------------------------------------------

// module.exports = Pedido;

module.exports = { 
  Pedido, 
  LineaPedido,
  LineaPedidoDetalle,
} ;
//Aprendizaje: ahora en el controller voy a tener que invocar asi: --> 
// new Pedido.Pedido(...) para construir.
// LPM 
