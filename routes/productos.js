const express = require("express");
const productosController = require("../controllers/productos");
const router = express.Router();

console.log("antes de entrar al route /api/productos")

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/gustos") 
//   -->  /api/productos
router.post("/", productosController.createProducto);
// Esto genera un alta en DB.PostgreSQL en entidad/Tabla ttProductos

//   -->  /api/productos
router.get("/", productosController.getAllProductos)
// Esto trae un json {} con todos los productos disponibles en la tabla ttProducto

//  --> /api/productos/id/:id
router.get("/codProducto/:codProducto", productosController.getByCod)
// Trea un producto por el codProd

//  --> /api/productos/id/:id
router.put("/codProducto/:codProducto", productosController.updateByCod)
// Esto actualiza un producto  por el codProd

//  --> /api/productos/id/:id
router.delete("/codProducto/:codProducto", productosController.deleteByCod)
// Esto elimina un producto por el codProd

// otras rutas de productos ..

module.exports = router;