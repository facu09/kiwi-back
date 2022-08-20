//Controlador Pedidos - Independiente de con que DB esté hecho
const Pedido = require("../models/pedido");  // este es el que impacta y conoce la DB
const User = require("../models/user");

//para que compile
const Gusto = require("../models/gusto");  // este es el que impacta y conoce la DB

const createPedido = async (req, res, next) => {
    pedBody = req.body
 
    //Validation of fields of Post---------------
    const messageValid = await MessageNotPassValidationCreate(pedBody)
    console.log ("mensaje devuelvo x validation:",  messageValid)
    if (messageValid) {
        res.status(400).json({ message: messageValid})
        return
    }

    console.log("paso por aca antes de crear newinstance de Pedido.")
   
    // Creo la entidad
    let newPedido = new Pedido(
        // req.body.idPedido,  // se genera solo autoincremental integer
        req.body.userId,
        req.body.domicilio,
        req.body.mobbile,
        req.body.dscPedido, 
        req.body.totalPedido,
        req.body.totalPaga,
        req.body.totalVuelto,
        req.body.pedidoDiferido,
    );
    console.log("paso por la creación de instancia newPedido.")
    try {
        // Salvando la nueva entidad
        newPed2 = await newPedido.save();
        res.send(newPed2);
      } catch (err) {
        res.statusCode = 500;
        res.send(err);
      }
};


const getById = async (req, res, next) => {
   console.log ("Va a buscar por idPedido -------> " + req.params.idPedido)
   // Validaciones necesarias
   if (req.params.idPedido === "") {
    res.statusCode = 400;
    res.send("idPedido no puede estar vacío.");
    return;
    }
    if (!await idPedidoDoseExist(req.params.idPedido)) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };
   const pedidoFinded  = await Pedido.getById(req.params.idPedido);
   
    res.send(pedidoFinded)
};

const getAllPedidosPorAsignar = async (req, res, next) => {
    const allPedidosXAsign  = await Pedido.getAllPedidosPorAsignar();
    // console.log("Response user", users);
    res.send(allPedidosXAsign)
};

const getAllPedidosAsignadosPorEntregar = async (req, res, next) => {
    const allPedidosXAsign  = await Pedido.getAllPedidosAsignadosPorEntregar();
    // console.log("Response user", users);
    res.send(allPedidosXAsign)
};

const cancelPedidoByIdByUs = async (req, res, next) => {
    console.log("---> entro al cancelPedidoByIdByUs");
    console.log("idPedido: " + req.params.idPedido + ".")
    console.log ("idUser Canceló: " + req.body.userId)
    console.log("motivo: " + req.body.motivoCancelUs + ".")

    if (req.params.idPedido === "") {
        res.statusCode = 400;
        res.send("idPedido no puede estar vacío.");
    }
    if (req.body.userId === "") {
        res.statusCode = 400;
        res.send("userId no puede estar vacío.");
    }
    if (!await idPedidoDoseExist(req.params.idPedido)) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };
    //Valido que exista ese Usuario
    if (!await User.findByIdUser(req.body.userId)){
        res.statusCode = 400;
        res.send("No existe el Usuario con ese 'userId'.");
        return;
    }
    //Falta validar que ese usuario es el del pedido --> proximo sprint.

    const pedidoCanceled = await Pedido.cancelPedidoByIdByUs(req.params.idPedido, req.body.userId, req.body.motivoCancelUs );


    res.send(pedidoCanceled);  
}

const cancelPedidoByIdByHel = async (req, res, next) => {
    console.log("---> entro al cancelPedidoByIdByHel");
    console.log("idPedido: " + req.params.idPedido + ".")
    console.log("motivo: " + req.body.motivoCancelHel + ".")

    // Validaciones necesarias
    if (req.params.idPedido === "") {
        res.statusCode = 400;
        res.send("idPedido no puede estar vacío.");
        return;
    }
    if (!await idPedidoDoseExist(req.params.idPedido)) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };
    const pedidoCanceled = await Pedido.cancelPedidoByIdByHel(req.params.idPedido, req.body.motivoCancelHel );

    res.send(pedidoCanceled);  
}

const asignarPedidoACadeteById = async (req, res, next) => {
    console.log("---> entro al asignarPedidoACadeteById");
    console.log("idPedido: " + req.params.idPedido + ".")
    console.log("FecHsEstimadaArriba: " + req.body.fecHsEstiamdaArribo + ", NomCadete: " + req.body.nomCadete)
    
    //Validación previa
    if (req.params.idPedido === "") {
        res.statusCode = 400;
        res.send("idPedido no puede estar vacío.");
        return;
    }
    if (!await idPedidoDoseExist(req.params.idPedido)) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };
    if (req.body.fecHsEstimadaArribo === "") {
        res.statusCode = 400;
        res.send("La Fecha y Hora estimada de arribo del pedido no puede estar vacío.");
        return;
    }
    if (req.body.nomCadete === "") {
        res.statusCode = 400;
        res.send("El Nombre del Cadete no puede estar vacío.");
        return;
    }

    const pedidoAsignCadete = await Pedido.asignarPedidoACadeteById(req.params.idPedido, req.body.fecHsEstimadaArribo, req.body.nomCadete );
    console.log("pedidoAsignadoCadete : ", pedidoAsignCadete);
    res.send(pedidoAsignCadete)
};

const entregaDePedidoById = async (req, res, next) => {
    console.log("---> entro al entregaDePedidoById");
    console.log("idPedido: " + req.params.idPedido + ".")
    //Validación previa
    if (req.params.idPedido === "") {
        res.statusCode = 400;
        res.send("idPedido no puede estar vacío.");
        return;
    }
    if (!await idPedidoDoseExist(req.params.idPedido)) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };

    const pedidoEntregado = await Pedido.entregaDePedidoById(req.params.idPedido );
    console.log("pedidoEntregado : ", pedidoEntregado);
    res.send(pedidoEntregado)
};


// Validaciones -------------------------------------------------------------

const idPedidoDoseExist = async (idPedido) => {
    const pedidoById = await Pedido.getById(idPedido);
    console.log ("Encontrado ", pedidoById)
    if (pedidoById) {
        return true
    }else {
        return false
    }    
}

const campoIsNotEmpty = (campo) => {
    return campo !== "";
};

const MessageNotPassValidationCreate = async (pedBody) => {
    //return Message of Error of validacion
    //If pass validation --> return null 
    
    if (!campoIsNotEmpty(pedBody.userId)) {   
        return "El userId del Pedido no puede estar vacío.";  
    }
    if (!campoIsNotEmpty(pedBody.domicilio)) {
        return "El Domicilio del Pedido no puede estar vacío.";
    }
    if (!campoIsNotEmpty(pedBody.mobbile)) {
        return "El Celular del Usuario no puede estar vacía.";
    }
    if (!campoIsNotEmpty(pedBody.totalPedido)) {
        return "El Total del Pedido no puede estar vacío.";
    }

    //Si llego acá no hay mensajes de validación de Registro
    return null
};


module.exports = {
    createPedido,
    getById,
    getAllPedidosPorAsignar,
    getAllPedidosAsignadosPorEntregar,
    cancelPedidoByIdByUs,
    cancelPedidoByIdByHel, 
    asignarPedidoACadeteById,
    entregaDePedidoById,
};