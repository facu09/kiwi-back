const prisma = require("../utils/clientPrismaPostgre");

class Gusto {
    constructor(codGusto, nombreGusto, dscGusto) {
      this.codGusto = codGusto;
      this.nombreGusto = nombreGusto;
      this.dscGusto = dscGusto;
    }

  //Acá va el Alta en la DB
  async save() {
    try {
        console.log (this.codGusto + ", " +  this.nombreGusto  + ", " + this.dscGusto + ".")
        await prisma.ttGustos.create({
            data: {
                codGusto : this.codGusto,
                nombreGusto: this.nombreGusto,
                dscGusto: this.dscGusto,
            },
        });
        console.log (this)
        return this; //devuelvo la instancia de TipoGasto que se construyó
    } catch (err){
        return "Error e models/gustos" + err;
    }
  }

  static async findByCod(codGusto) {
    console.log("==> findByCod --> ", codGusto)
    try {
      // console.log("el mail recibido en findByEmail", email)
      const gustoFinded = await prisma.ttGustos.findUnique({
        where: {
          codGusto: parseInt(codGusto,10),
        },
      })
      // console.log("el userfinded:" ,userfinded)
      return gustoFinded;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
  }

  static async getAllGustos() {
    try {
        const allGustos = await prisma.ttGustos.findMany()
        return allGustos
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }   
    }

  static async uptadeByCod (codGusto, nombreGusto, dscGusto) {
      try {
        const updatedGusto = await prisma.ttGustos.update({
          where: {
            codGusto: parseInt(codGusto,10),
          },
          data: {
            nombreGusto: nombreGusto,
            dscGusto: dscGusto,
          },
        })
        // console.log (updatedUser)
        return updatedGusto
    
      } catch (error) {
        console.log(error);
        throw new Error(error);
      }   
    }

  static async deleteByCod (codGusto) {
    try {
      const deletedGusto = await prisma.ttGustos.delete({
        where: {
            codGusto: parseInt(codGusto,10),
        },
      })
      return deletedGusto;

    } catch (error) {
        console.log(error);
        throw new Error(error);
        return;
    }   
  }

}

module.exports = Gusto;