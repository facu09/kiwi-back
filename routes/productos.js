const express = require("express");
const productosController = require("../controllers/productos");
const router = express.Router();
const auth = require("../middlewares/authorization");

console.log("antes de entrar al route /api/productos")

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/gustos") 
//   -->  /api/productos
// Solo para ADMIN
router.post("/", auth.authorizationForAdmin, productosController.createProducto);
// Esto genera un alta en DB.PostgreSQL en entidad/Tabla ttProductos

//   -->  /api/productos
// Publica
router.get("/", productosController.getAllProductos)
// Esto trae un json {} con todos los productos disponibles en la tabla ttProductos

//  --> /api/productos/CodProd/:codProd
// Publica
router.get("/codProd/:codProd", productosController.getByCod)
// Trea un producto por el codProd

//  --> /api/productos/codProd/:codProd
// Solo para ADMIN
router.put("/codProd/:codProd", auth.authorizationForAdmin,productosController.updateByCod)
// Esto actualiza un producto  por el codProd

//  --> /api/productos/codProd/:id
// Solo para ADMIN
router.delete("/codProd/:codProd", auth.authorizationForAdmin,  productosController.deleteByCod)
// Esto elimina un producto por el codProd

// otras rutas de productos ..

module.exports = router;