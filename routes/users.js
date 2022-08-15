const express = require("express");
const usersController = require("../controllers/users");
const router = express.Router();

// Ruteo establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/users") 
//  /api/users

// Para el Alta de Usuarios:
// Esta ruta queda para los Administradores para crear usuario Adhoc
router.post("/", usersController.createUser);

// Trae todos los Usuarios (a los fines didacticos o para experotarlo a un archivo texto)
//  /api/users/
router.get("/", usersController.getAllUsers);

//Busqueda por email:
// /api/users/search?email=roberto5@gmail.com
router.get("/search", usersController.findUserByEmail)
// en el controller tendré que tomarlo con un req.query.email
// .. como un ejemplo para que quede aca, si quisiera ingresar mas de un campo en la url, seria asi
//      // /api/users/search?email=roberto5@gmail.com&name=Roberto Garcia
// --> devuelve los datos del usuarior

// Modificación datos del usuario
// /api/users/email/roberto5@gmail.com
router.put("/email/:email", usersController.updateByEmail)
//  en el controller tendré que tomarlo con un  req.params.email

// Baja de Usuario:
// /api/users/email/roberto5@gmail.com
router.delete("/email/:email", usersController.deleteByEmail)
//  en el controller tendré que tomarlo con un  req.params.email



// otras rutas ..


module.exports = router;