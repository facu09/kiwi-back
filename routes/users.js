const express = require("express");
const usersController = require("../controllers/users");
const router = express.Router();

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/users") 
//  /api/users
// Esta ruta queda para los Administradores para crear usuario Adhoc
router.post("/", usersController.createUser);

//  /api/users/
router.get("/", usersController.getAllUsers);

// /api/users/search?email=roberto5@gmail.com
router.get("/search", usersController.findUserByEmail)
// en el controller tendré que tomarlo con un req.query.email
// .. como un ejemplo para que quede aca, si quisiera ingresar mas de un campo en la url, seria asi
//      // /api/users/search?email=roberto5@gmail.com&name=Roberto Garcia

// /api/users/email/roberto5@gmail.com
router.put("/email/:email", usersController.updateByEmail)
//  en el controller tendré que tomarlo con un  req.params.email

// /api/users/email/roberto5@gmail.com
router.delete("/email/:email", usersController.deleteByEmail)
//  en el controller tendré que tomarlo con un  req.params.email



// otras rutas ..


module.exports = router;