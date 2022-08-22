const express = require("express");
const gustosController = require("../controllers/gustos");
const router = express.Router();
const auth = require("../middlewares/authorization")

console.log("antes de entrar al route /api/gustos")

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/gustos") 
//   -->  /api/gustos
// Solo para ADMIN
router.post("/", auth.authorizationForAdmin, gustosController.createGusto);
// Esto genera un alta en DB.PostgreSQL en entidad/Tabla ttGustos

//   -->  /api/gustos
// Publica
router.get("/", gustosController.getAllGustos)
// Esto trae un json {} con todos los gustos disponibles en la tabla ttGustos

//  --> /api/gustos/id/:id
// Solo para ADMIN
router.put("/codGusto/:codGusto", auth.authorizationForAdmin ,gustosController.updateByCod)
// Esto actualiza el gusto por el codGusto


//  --> /api/gustos/codGusto/:codGusto
// Solo para ADMIN
router.delete("/codGusto/:codGusto", auth.authorizationForAdmin, gustosController.deleteByCod) 
// Esto elimina un Gusto por el codGusto

// otras rutas de gustos ..


module.exports = router;