const express = require("express");
const pedidosController = require("../controllers/pedidos");
const router = express.Router();
const auth = require("../middlewares/authorization");

console.log("antes de entrar al route /api/pedidos");

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/pedidos") 
//   -->  /api/pedidos
//Para un Usuario Logueado
router.post("/", auth.authorizationForAllUser, pedidosController.createPedido);
// Esto genera un alta en DB.PostgreSQL en entidad/Tabla ttPedidos

//   -->  /api/pedido
//Para el Usuario Logueado solo podrá consutar su pedido "actual" o alguno viejo 
//Para el Usuario con Role ADMIN podra consultar cualquier pedido
router.get("/idPedido/:idPedido", auth.authorizationForAllUser ,pedidosController.getById);
// Esto trae un json {} el pedido disponibles en la tabla ttPedidos de ese idPedido pasado por param en la url
//Comprobación Final de Permisos a hacer en Controller

//# 24/09/2022 Agregado 
//   -->  /api/pedidos/lastPedido
//Para el Usuario Logueado solo podrá consutar su Ultimo Pedido si lo tuviese 
//Para el Usuario con Role ADMIN podra consultar el último pedido que se acaba dar de alta en la DB (para control x backend)
router.get("/lastPedido", auth.authorizationForAllUser ,pedidosController.getLastPedido);
// Esto trae un json {} el pedido disponibles en la tabla ttPedidos con el detalle de los productos + el detalle de las lineas + los gustos de cada producto/linea.
//Comprobación Final de Permisos a hacer en Controller

//   -->  /api/pedidos/xAsignar
// Para ADMIN
router.get("/xAsignar",  auth.authorizationForAdmin, pedidosController.getAllPedidosPorAsignar);
// Esto trae un json {} con todos los pedidos disponibles a ser Asignados a Cadete de la tabla ttPedidos

//  --> /api/pedidos/xEntregar
// Para ADMIN
router.get("/xEntregar", auth.authorizationForAdmin, pedidosController.getAllPedidosAsignadosPorEntregar) ;
// Esto treae todos los Pedidos por Entregar

//  --> /api/pedidos/cancelByUs/idPedido/:idPedido
//Para el Usuario Logueado solo podrá Cancelar su pedido "actual" o alguno otro pedido no entregado aun 
router.put("/cancelByUs/idPedido/:idPedido", auth.authorizationForAllUser , pedidosController.cancelPedidoByIdByUs);
// Esto Cancela el Pedido por el idPedido por el Usuario
//Comprobación Final de Permisos a hacer en Controller

//  --> /api/pedidos/cancelByHel/idPedido/:idPedido
// Para ADMIN
router.put("/cancelByHel/idPedido/:idPedido", auth.authorizationForAdmin , pedidosController.cancelPedidoByIdByHel);
// Esto Cancela el Pedido por el idPedido por la Heladería.

//  --> /api/pedidos/asignCadete/idPedido/:idPedido
// Para ADMIN
router.put("/asignCadete/idPedido/:idPedido", auth.authorizationForAdmin ,pedidosController.asignarPedidoACadeteById);
// Esto actualiza el pedido marcandolo como asignado a un Cadete, por el idPedido

//  --> /api/pedidos/entregaPed/idPedido/:idPedido
//// Para ADMIN o Para CADETE
router.put("/entregaPed/idPedido/:idPedido", auth.authorizationForCadeteOrAdmin, pedidosController.entregaDePedidoById);
// Esto actualiza el pedido marcandolo como ENTREGADO, por el idPedido
//Comprobación Final de Permisos a hacer en Controller si hubiera diferencais ente Cadete y ADMIN

// otras rutas de pedidos ..


module.exports = router;