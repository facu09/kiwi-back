const express = require("express");
const pedidosController = require("../controllers/pedidos");
const router = express.Router();

console.log("antes de entrar al route /api/pedidos")

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/pedidos") 
//   -->  /api/pedidos
router.post("/", pedidosController.createPedido);
// Esto genera un alta en DB.PostgreSQL en entidad/Tabla ttPedidos

//   -->  /api/pedidos
router.get("/idPedido/:idPedido", pedidosController.getById)
// Esto trae un json {} con todos los pedidos disponibles en la tabla ttPedidos

//   -->  /api/pedidos/xAsignar
router.get("/xAsignar", pedidosController.getAllPedidosPorAsignar)
// Esto trae un json {} con todos los pedidos disponibles a ser Asignados a Cadete de la tabla ttPedidos

//  --> /api/pedidos/xEntregar
router.get("/xEntregar", pedidosController.getAllPedidosAsignadosPorEntregar) 
// Esto treae todos los Pedidos por Entregar

//  --> /api/pedidos/cancelByUs/idPedido/:idPedido
router.put("/cancelByUs/idPedido/:idPedido", pedidosController.cancelPedidoByIdByUs)
// Esto Cancela el Pedido por el idPedido por el Usuario

//  --> /api/pedidos/cancelByHel/idPedido/:idPedido
router.put("/cancelByHel/idPedido/:idPedido", pedidosController.cancelPedidoByIdByHel)
// Esto Cancela el Pedido por el idPedido por la Heladería.

//  --> /api/pedidos/asignCadete/idPedido/:idPedido
router.put("/asignCadete/idPedido/:idPedido", pedidosController.asignarPedidoACadeteById)
// Esto actualiza el pedido marcandolo como asignado a un Cadete, por el idPedido

//  --> /api/pedidos/entregaPed/idPedido/:idPedido
router.put("/entregaPed/idPedido/:idPedido", pedidosController.entregaDePedidoById)
// Esto actualiza el pedido marcandolo como asignado a un Cadete, por el idPedido


// otras rutas de pedidos ..


module.exports = router;