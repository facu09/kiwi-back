const express = require("express");
const usersController = require("../controllers/users");
const router = express.Router();
const auth = require("../middlewares/authorization");

// Ruteo establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/users") 
//  /api/users

// Para el Alta de Usuarios:
// Esta ruta queda para los Administradores para crear usuario Adhoc
// Solo para ADMIN  (porque es para crearlos forzaados: para eso está el Registro que es Publico)
router.post("/", auth.authorizationForAdmin ,usersController.createUser);

// Trae todos los Usuarios (a los fines didacticos o para experotarlo a un archivo texto)
//  /api/users/
// Para ADMIN
router.get("/", auth.authorizationForAdmin, usersController.getAllUsers);

//Busqueda por email:
// /api/users/search?email=roberto5@gmail.com
// Solo para ADMIN (xque no se va a usar)
router.get("/search", auth.authorizationForAdmin, usersController.findUserByEmail)
// en el controller tendré que tomarlo con un req.query.email
// .. como un ejemplo para que quede aca, si quisiera ingresar mas de un campo en la url, seria asi
//      // /api/users/search?email=roberto5@gmail.com&name=Roberto Garcia
// --> devuelve los datos del usuarior

// Modificación datos del usuario:
// /api/users/email/roberto5@gmail.com
// Para ADMIN
// Para el usuario que modifique sus datos
router.put("/email/:email", auth.authorizationForAllUser, usersController.updateByEmail)
//  en el controller tendré que tomarlo con un  req.params.email

// Baja de Usuario (Baja logica):
// /api/users/email/roberto5@gmail.com
// Para ADMIN
// Para el usuario que modifique sus datos
router.put("/baja/email/:email", auth.authorizationForAllUser, usersController.bajaUserByEmail)
//  en el controller tendré que tomarlo con un  req.params.email

// Activar Cuenta  de Usuario (activación logica):
// /api/users/email/roberto5@gmail.com
// Para ADMIN
// Para el usuario que modifique sus datos
router.put("/activate/email/:email", auth.authorizationForAllUser, usersController.activateUserByEmail)
//  en el controller tendré que tomarlo con un  req.params.email

// otras rutas ..

module.exports = router;