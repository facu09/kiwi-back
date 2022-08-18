const prisma = require("../utils/clientPrismaPostgre");

class Producto {
    constructor(codProd, nomProd, dscProd, unidad, precioUnitFinal, foto) {
      this.codProd = codProd;
      this.nomProd = nomProd;
      this.dscProd = dscProd;
      this.unidad = unidad;
      this.precioUnitFinal = precioUnitFinal;
      this.foto = foto;
    }

//Acá va el Alta en la DB
async save() {
    try {
        console.log (this.codProd + ", " +  this.nomProd  + ", " + this.dscProd + ", " +  this.unidad + ", " +  this.precioUnitFinal + ", " +  this.foto + ".")
        await prisma.ttProductos.create({
            data: {
                codProd : this.codProd,
                nomProd: this.nomProd,
                dscProd: this.dscProd,
                unidad: this.unidad,
                precioUnitFinal: this.precioUnitFinal,
                foto: this.foto,
            },
        });
        console.log (this)
        return this; //devuelvo la instancia de TipoGasto que se construyó
    } catch (err){
        return "Error e models/productos" + err;
    }
  }

  static async getAllProductos() {
    try {
        const allProductos = await prisma.ttProductos.findMany()
        return allProductos
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }  

  static async findByCod(codProd) {
    console.log("==> findByCod --> " +  codProd)
    try {
      const prodFinded = await prisma.ttProductos.findUnique({
        where: {
          codProd: codProd,
        },
      })
      return prodFinded;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async findByName(nomProd) {
    console.log("==> findByCod --> ", nomProd)
    try {
      // console.log("el mail recibido en findByEmail", email)
      const prodFinded = await prisma.ttProductos.findUnique({
        where: {
          nomProd: nomProd,
        },
      })
      // console.log("el userfinded:" ,userfinded)
      return prodFinded;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async uptadeByCod (codProd, nomProd, dscProd, unidad, precioUnitFinal, foto) {
    try {
      const updatedProd = await prisma.ttProductos.update({
        where: {
          codProd: codProd,
        },
        data: {
          nomProd: nomProd,
          dscProd: dscProd,
          unidad: unidad,
          precioUnitFinal: precioUnitFinal,
          foto: foto, 
        },
      })
      // console.log (updatedUser)
      return updatedProd
  
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }   
  }

  static async deleteByCod (codProd) {
    try {
      const deletedProd = await prisma.ttProductos.delete({
        where: {
            codProd: codProd,
        },
      })
      return deletedProd

    } catch (error) {
        console.log(error);
        throw new Error(error);
        return;
    }   
  }

}



module.exports = Producto;