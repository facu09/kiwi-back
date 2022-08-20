const express = require("express");
const gustosController = require("../controllers/gustos");
const router = express.Router();

console.log("antes de entrar al route /api/gustos")

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/gustos") 
//   -->  /api/gustos
router.post("/", gustosController.createGusto);
// Esto genera un alta en DB.PostgreSQL en entidad/Tabla ttGustos

//   -->  /api/gustos
router.get("/", gustosController.getAllGustos)
// Esto trae un json {} con todos los gustos disponibles en la tabla ttGustos

//  --> /api/gustos/id/:id
router.put("/codGusto/:codGusto", gustosController.updateByCod)
// Esto actualiza el gusto por el codGusto


//  --> /api/gustos/codGusto/:codGusto
router.delete("/codGusto/:codGusto", gustosController.deleteByCod) 
// Esto elimina un Gusto por el codGusto

// otras rutas de gustos ..


module.exports = router;