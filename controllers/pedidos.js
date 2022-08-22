//Controlador Pedidos - Independiente de con que DB esté hecho
const Pedido = require("../models/pedido");  // este es el que impacta y conoce la DB
const User = require("../models/user");

const XDate = require("XDate");

let moMensajeRes = {};  // creo variable global tipo objeto a nivel de modulo para pasar los mensajes de Res
let msNomCadete = "" //variable a nivel de modulo para pasar entre funciones
let mdFecHsEstimArr = "" //variable de Modulo para calcular FecHsEstimada de Arribo de Pedido


const createPedido = async (req, res, next) => {
//Permisos: Para todos los Usuarios Loguedos
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
        //req.body.userId, dejo pedirlo en Body ==> lo tomo del token --> solo este, el resto los volvio a ingresar el frontEnd
        req.user.userId,  
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
//Permiso USER: solo sus pedidos  ADMIN y CADETES: todos
    console.log ("Va a buscar por idPedido -------> " + req.params.idPedido)
   // Validaciones previas
   if (req.params.idPedido === "") {
    res.statusCode = 400;
    res.send("idPedido no puede estar vacío.");
    return;
    }
    
    //Voy a Buscar el Pedido paraya tenerlo, para saber si existe y si tiene permiso para consultarlo de acuerdo a userId pertenece
    const pedidoFinded  = await Pedido.getById(req.params.idPedido);
    if (!pedidoFinded) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };

    //Veo de Permisos si puedo o no: ADMIN puede siempre, USER solo su Pedidos: ------------------------------
    if (!usuarioTienePermisoConsultarPP(req.user.role, req.user.userId, pedidoFinded)) {
        //Salgo El mensaje send ya salio en la funcion de arriba
        res.status(401).json(moMensajeRes)
        return
    }
    //Fin Evaluación de Permisos -------------------------------------

    if (!await idPedidoDoseExist(req.params.idPedido)) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };
//    const pedidoFinded  = await Pedido.getById(req.params.idPedido);
   
    res.send(pedidoFinded)
};

const getAllPedidosPorAsignar = async (req, res, next) => {
//Los permisos solo en el Controler: Solo ADMIN
    console.log ("Va a buscar los Pedidos Por Asignar solo para ADMIN---> ")
    const allPedidosXAsign  = await Pedido.getAllPedidosPorAsignar();
    // console.log("Response user", users);
    res.send(allPedidosXAsign)
};

const getAllPedidosAsignadosPorEntregar = async (req, res, next) => {
//Los permisos solo en el Controler: Solo ADMIN
    console.log ("Va a buscar los Pedidos Por Asigndos Por Entrear solo para ADMIN---> ")
    const allPedidosXAsign  = await Pedido.getAllPedidosAsignadosPorEntregar();
    // console.log("Response user", users);
    res.send(allPedidosXAsign)
};

const cancelPedidoByIdByUs = async (req, res, next) => {
//Permisos: Solo puede Cancelar x este controller el Usuario del Pedido, ni ADMIN ni CADETE. ADMIN: tiene otro controlador para cancelar.
    console.log("---> entro al cancelPedidoByIdByUs");
    console.log("idPedido: " + req.params.idPedido + ".")
    console.log ("idUser Canceló: " + req.body.userId)
    console.log("motivo: " + req.body.motivoCancelUs + ".")

    if (req.params.idPedido === "") {
        res.statusCode = 400;
        res.send("idPedido no puede estar vacío.");
        return;
    }

    //Voy a Buscar el Pedido paraya tenerlo, para saber si existe y si tiene permiso para consultarlo de acuerdo a userId pertenece
    const pedidoFinded  = await Pedido.getById(req.params.idPedido);
    if (!pedidoFinded) { 
        res.statusCode = 400;
        res.send("No existe un Pedido con este idPedido.");
        return;
    };

    //Veo de Permisos si puedo o no: ADMIN puede siempre, USER solo su Pedidos: ------------------------------
    if (!usuarioTienePermisoExclusivoDeSuPedidoByUsuario(req.user.role, req.user.userId, pedidoFinded)) {
        //Salgo El mensaje send ya salio en la funcion de arriba
        res.status(401).json(moMensajeRes)
        return
    }
    //Fin Evaluación de Permisos -------------------------------------

    const pedidoCanceled = await Pedido.cancelPedidoByIdByUs(req.params.idPedido, req.body.motivoCancelUs );

    res.send(pedidoCanceled);  
}

//Testing 21/08 for 3 Roles
const cancelPedidoByIdByHel = async (req, res, next) => {
//Los permisos solo evaluados en la Ruta: Solo ADMIN
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
    //Si llego acá Canceló Exitosamente el Pedido By Heladería
    res.statusCode = 200;
    res.send(pedidoCanceled);  
}


const asignarPedidoACadeteById = async (req, res, next) => {
//Los permisos solo evaluados en la Ruta: Solo ADMIN
//VC: 
//La fecHsEstimadaArribo: puede venir "" vacia, en ese caso se toma la XDate() + 45 minutos (queda en formato GMT UTC+00: Hora Mundial Coordinada) 
//Si fecHsEstimadaArribo viene con datos: ==> tiene que venir en formato GMT: UTC+00, con "Z" al final, ej: "2022-08-20T19:37:00.333Z",

   try {
        console.log("---> entro al asignarPedidoACadeteById");
        console.log("idPedido: " + req.params.idPedido + ".")
        console.log("FecHsEstimadaArriba: " + req.body.fecHsEstimadaArribo + ", idSupuestoCadete: " + req.body.idUserCadete)
        
        //Validación previa
        if (req.params.idPedido === "") {
            res.status(401).send("idPedido no puede estar vacío.");
            return;
        }
        if (!await idPedidoDoseExist(req.params.idPedido)) { 
            res.status(401).send("No existe un Pedido con este idPedido.");
            return;
        };
        if (!req.body.idUserCadete) {
            res.status(401).send("El 'idUserCadete' al que se le asigna el pedido no puede ser vacío.");
            return;
        }
        if (!await elUserIsCadeteActivo_yTraeSuNombre(req.body.idUserCadete)) {
            res.status(401).send("El 'idUserCadete' no es un CADETE Activo" );
            return;
        }
        console.log (".VALIDANDO: Muestro El Nombre Cadete obtenido en proceso que verifica que el idUserCadete pasado en el body sea un Cadete Activo: --> ", msNomCadete)
              
        if (!IsValidFecHsArriboUtcCorrecta(req.body.fecHsEstimadaArribo)) {
            res.status(401).send("La 'fecHsEstimadaArribo': Fecha y Hora Estimada de Arribo del Pedido ingresada NO es Válida." );
            return;
        }

        const ldFecHsEstimArr = ObtengoFecHsArriboUtcCorrecta(req.body.fecHsEstimadaArribo)

        //Consologue para saber que viene pasando con las Fechas
        console.log(".Muestro del body el req.body.fecHsEstimadaArribo: --> ", req.body.fecHsEstimadaArribo)
        console.log(".Muestro ldFecHsEstimArr convertida con 'new XDate(req.body.fecHsEstimadaArribo)' para ver que pasa si viene vacía  el req.body.fecHsEstimadaArribo: --> ", ldFecHsEstimArr);
        console.log(".Muestro mdFecHsEstimArr con la función ISO XDate(req.body.fecHsEstimadaArribo)' para ver que pasa si viene vacíae el req.body.fecHsEstimadaArribo: ISO --> " );
        console.log (ldFecHsEstimArr.toISOString())

        // //CORTO PARA PROBAR y Ver Consola
        // res.status(401).send("LO CORTO PARA PROBAR" );
        // return;

        //Mando al Model a hacer el UPDADE de la Asginación del Pedido al Cadete
        const pedidoAsignCadete = await Pedido.asignarPedidoACadeteById(
            req.params.idPedido, 
            ldFecHsEstimArr.toISOString(), 
            req.body.idUserCadete, 
            msNomCadete
        );
        
        //Consologue Pedido Recien asignado a Cadete
        console.log("pedidoAsignadoCadete: ", pedidoAsignCadete);
        
        //Finalmente mando respuesta
        res.status(200).send(pedidoAsignCadete)

   } catch (error) {
        console.log(error);
        throw new Error(error);
   }
};

const entregaDePedidoById = async (req, res, next) => {
//Los permisos solo evaluados en la Ruta: Solo ADMIN o CADETE
//VC: sin importar el estado del pedido se marca como Entrega:
//       podria haberse retirado por mostrador y no asignado a Cadete x ejemplpo (enntonces no sería necesario validar si se asginó a cadete o no.==> entra pollo sale pollo)
    console.log("---> entró al entregaDePedidoById");
    console.log("idPedido: " + req.params.idPedido + ".")
    //Validación previa
    if (req.params.idPedido === "") {
        res.statusCode = 400;
        res.send("idPedido no puede estar vacío.");
        return;
    }
    //Busco el pedido para Validaciones:
    const pedidoFinded = await Pedido.getById(req.params.idPedido);
    console.log(".El Pedido Encontrado pasado por el req.params: --> " , pedidoFinded)
    if (!pedidoFinded) { 
        res.status(400).send("No Existe un Pedido con este idPedido.");
        return;
    };
    if (pedidoFinded.xEntregado) { 
        res.status(400).send("El Pedido '" + req.params.idPedido + "' ya está marcado 'X' como entregado por el cadete '" + pedidoFinded.nomCadete + "' al momento '" + pedidoFinded.fecHsEntregado + "'.");
        return;
    };
    if (pedidoFinded.canceladoXUs) { 
        res.status(400).send("El Pedido '" + req.params.idPedido + "' está marcado 'X' como Cancelado por el Usuario expresando el motivo de '" + pedidoFinded.motivoCancelUs + "'." );
        return;
    };
    if (pedidoFinded.canceladoXHel) { 
        res.status(400).send("El Pedido '" + req.params.idPedido + "' está marcado 'X' como Cancelado por la Heladería expresando el motivo de '" + pedidoFinded.motivoCancelHel + "'." );
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

const elUserIsCadeteActivo_yTraeSuNombre = async (idUser) => {
    const userFF = await User.findByIdUser(idUser);
    console.log ("Evaluando si idUser es CADETE: Usuario encontrado Encontrado ", userFF);
    if (userFF && userFF.role === "CADETE" && userFF.estadoActivo === true) {
        console.log ("Entro A:==> Es CADETE y Está ACTIVO!!")
        msNomCadete = userFF.name;  //retorno Nombre Caete en una variable de Modulo
        return true;
    }else {
        console.log ("Entro A:==> NO es CADETE o NO Está ACTIVO!!")
        msNomCadete = ""; //retorno Nombre Caete en una variable de Modulo
        return false;
    };
};


const IsValidFecHsArriboUtcCorrecta = (fecHsEstimadaArriboBody) => {
// VC: en el body Puedo o no vernir la fecHsEstimadaArribo
// En caso de que no venga ==> generar una con Now() + 45 minutos
// En el caso de que SI venga (ya valdide que sea corecta )==> solo devolverla en formato UTC
  try {  
    // Si esta completa
    if (fecHsEstimadaArriboBody) {
        console.log (".Entro al req.body.fecHsEstimadaArribo tiene algo")
        //Convierto la Fecha entreada por el Body para ver si es Valida
        ldFecHsEstimArr = new XDate(fecHsEstimadaArriboBody)
        console.log("Convertí la FecHsEstimArr: --> ", ldFecHsEstimArr )
        return ((ldFecHsEstimArr).valid())
    } else {
        //Si esta vacia la fecHsEstimadaArribo ==>  Sigue siendo correcto
        return true
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
}

const ObtengoFecHsArriboUtcCorrecta = (fecHsEstimadaArriboDelBody) => {
// VC: en el body Puedo o no vernir la fecHsEstimadaArribo
// En caso de que no venga ==> generar una con Now() + 45 minutos
// En el caso de que SI venga (ya valdide que sea corecta )==> solo devolverla en formato UTC
console.log (".En Function ObtengoFecHsArriboUtcCorrecta, Muestro el param fecHsEstimadaArriboDelBody: ", fecHsEstimadaArriboDelBody)
  try {
    if (!fecHsEstimadaArriboDelBody) {
        console.log (".ENTRÓ al fecHsEstimadaArriboDelBody es null o VACIÓ --> le sumo 45 minutos a la fecHora Actual: --> ")
        const today = new XDate();
        // mdFecHsEstimArr = today.addMinutes(45).toISOString()
        return today.addMinutes(45)  //Devuelve format UTC
    } else {
        //la vuelvo a convertir para devolverla en formato UTC
        const ldFecHsEstimArrUTC = new XDate(fecHsEstimadaArriboDelBody)
        return ldFecHsEstimArrUTC
    }
  } catch (error) {
    console.log(error);
    throw new Error(error);
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

//req.user.role, req.user.userId, pedidoFinded))
const usuarioTienePermisoConsultarPP = (userRoleToken, userIdToken, pedidoFinded ) => {
    //Aprehendizaje: los objetos pasan por Referencia
        if (userRoleToken === "ADMIN" || userRoleToken === "CADETE") {
            console.log ("usuarioTienePermisoParaCosultarPedido: TRUE; xque es ADMIN o CADETE")
            return true
        }
        if (userRoleToken === "USER" && userIdToken === pedidoFinded.userId) {
            console.log ("usuarioTienePermisoParaCosultarPedido: TRUE: xque es el Usuario que lo hizo")
            return true
        } else {
            console.log ("usuarioTienePermisoParaCosultarPedido: FALSE: xque NO es el Usuario que lo hizo")
           
            moMensajeRes = {mensaje: "'USER' role can't consult the data of an Order of other Users, only ADMIN or CADETE role can do it. "}
    
            // ahora manda el res el modulo principal
            // res.status(401).json({ message: "'USER' role can't update data User to other Users, only ADMIN role can do it. "})
            return false
        }
        console.log("usuarioTienePermisoParaCosultarPedido: No debería llegar acá. userRole distintos a los requeridos, fallo middlewares de autorization")
        return false
    }

    const usuarioTienePermisoExclusivoDeSuPedidoByUsuario = (userRoleToken, userIdToken, pedidoFinded ) => {
        //Aprehendizaje: los objetos pasan por Referencia
            
            if (userRoleToken === "USER" && userIdToken === pedidoFinded.userId) {
                console.log ("usuarioTienePermisoExclusivoDeSuPedidoByUsuario: TRUE: xque es el Usuario que lo hizo")
                return true
            } else {
                console.log ("usuarioTienePermisoExclusivoDeSuPedidoByUsuario: FALSE: xque NO es el Usuario que lo hizo")
               
                moMensajeRes = {mensaje: "This user can't Cancel the Order because he didn't creat it. "}
        
                // ahora manda el res el modulo principal
                // res.status(401).json({ message: "'USER' role can't update data User to other Users, only ADMIN role can do it. "})
                return false
            }
            console.log("usuarioTienePermisoExclusivoDeSuPedidoByUsuario: No debería llegar acá. userRole distintos a los requeridos, fallo middlewares de autorization")
            return false
        }

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