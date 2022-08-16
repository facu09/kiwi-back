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
}

module.exports = Producto;