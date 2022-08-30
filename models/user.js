const prisma = require("../utils/clientPrismaPostgre");

const { v4: uuidv4 } = require("uuid");

class User {
  constructor(email, name, password, role, domicilio, mobbile, id) {
    this.id = id ? id : uuidv4(); // ⇨ '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'
    this.email = email;
    this.name = name ? name : "";  //si fuese opcional
    this.password = password;
    this.role = role ? role : "USER";
    this.domicilio = domicilio;
    this.mobbile = mobbile;
  }

  // Grava la Entidad en db
  async save() {
    try {
      console.log (this.email + ", " + this.name + ", " + this.password + ", " + this.role + ", " + this. domicilio + ", " + this.mobbile)
      await prisma.User.create({
        data: {
          email: this.email,
          name: this.name,
          password: this.password,
          role: this.role,
          domicilio: this.domicilio, 
          mobbile: this.mobbile,
        },
      });
      console.log (this)
      return this;
    
    } catch (error) {
      console.log("entro catch del models.user.save()")
      throw new Error(error);
      return;
    }
  }

  static async findByEmail(email) {
    try {
        console.log(". En el model: en findeByEmail. El mail recibido en findByEmail es: ", email)
        const userfinded = await prisma.User.findUnique({
          where: {
            email: email,
          },
        })
        console.log(".So: findByEmail: el userfinded: " ,userfinded)
        return userfinded;
    
    } catch (error) {
        console.log(error);
        throw new Error(error);
        return;
    }   
  }

  static async findByIdUser(id) {
    try {
      // console.log("el mail recibido en findByEmail", email)
      const userfinded = await prisma.User.findUnique({
        where: {
          id: +id,
        },
      })
      // console.log("el userfinded:" ,userfinded)
      return userfinded;
    } catch (error) {
        console.log(error);
        throw new Error(error);
        return;
    }   
  }

  static async getAllUsers (){
    try {
      const allUsers = await prisma.User.findMany()
      return allUsers
    } catch (error) {
      console.log(error);
      throw new Error(error);
      return;
    }   
  }

  //#Tested 15/08/22
  static async uptadeByEmail (email, name, password, domicilio, mobbile) {
    //no actualizo por aca el role (x seguridad)
    try {
      const updatedUser = await prisma.User.update({
        where: {
          email: email,
        },
        data: {
          name: name, 
          password: password,
          domicilio: domicilio,
          mobbile: mobbile,
        },
      })
      // console.log (updatedUser)
      return updatedUser

    } catch (error) {
      console.log(error);
      throw new Error(error);
      return;
    }   
  }

  //#Tested 15/08/22
  // FALTA VER CIRCUITO: EN ALTA SI EXISTE PERO ESTA INACTIVO ==> 
  //      ==> HACER Update y pasar Estado = "Activo"
  //      ==> Deberia cambiar el Login: y chequear que este "Activo"
  // Falta Cicuito de Recuperación de Contraseña
  // ---> para Next Iteration.
  static async bajaUserByEmail (email) {
  //Hago bajas lógicas: no borro, paso el registro a Desactivado.
    try {
      const bajadUser = await prisma.User.update({
        where: {
          email: email,
        },
        data: {
          estadoActivo: false, 
        },
      })
      return bajadUser

    } catch (error) {
      console.log(error);
      throw new Error(error);
      return;
    }   
  }

  static async activateUserByEmail (email) {
    //Hago bajas lógicas: no borro, paso el registro a Desactivado.
      try {
        const activatedUser = await prisma.User.update({
          where: {
            email: email,
          },
          data: {
            estadoActivo: true, 
          },
        })
        return activatedUser
  
      } catch (error) {
        console.log(error);
        throw new Error(error);
        return;
      }   
    }


}//cirra el User Class

module.exports = User;