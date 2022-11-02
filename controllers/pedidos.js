//Controlador Pedidos - Independiente de con que DB esté hecho
const Pedido = require("../models/pedido");  // este es el que impacta y conoce la DB
const User = require("../models/user");
const Producto = require("../models/producto");
const Gusto = require("../models/gusto");

const XDate = require("xdate");

let moMensajeRes = {};  // creo variable global tipo objeto a nivel de modulo para pasar los mensajes de Res
let msNomCadete = "" //variable a nivel de modulo para pasar entre funciones
let mdFecHsEstimArr = "" //variable de Modulo para calcular FecHsEstimada de Arribo de Pedido


const createPedido = async (req, res, next) => {
//Permisos: Para todos los Usuarios Loguedos
    pedBody = req.body
 
    //Validation of fields of Post---------------
    const messageValid = await MessageNotPassValidationCreate(pedBody)
    console.log (".Mensaje devuelvo x validation (Si es null => no hubo error):",  messageValid)
    if (messageValid) {
        res.status(400).json({ message: messageValid})
        return
    }

    console.log(".Paso por aca antes de crear newinstance de Pedido.")
   
    // Creo la entidad
    let newPedido = new Pedido.Pedido( 
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
        // Salvando la nueva entidad de Pedido
        newPed2 = await newPedido.save();
        // res.send(newPed2); //todavia no respondo al request lo hago al final
    } catch (err) {
        res.statusCode = 500;
        res.send(err);
    }
      
    console.log (".Se guardó el Encabezado del Pedido en ttPedidos", newPed2)
    console.log (".Procedo a Guardar Lineas Pedidos para el idPedido ----> " , newPed2.idPedido, " <----")
    try {
        // Salvando la nueva entidad Liena Pedido
        // pedBody.lineasPedido.forEach(lineaPed => { //forEach no funca con await
        i = 0;
        do {
             //construyo lineaPedido
             console.log (".ATENCION Estoy construyendo newLinea de Pedido");
             
             console.log(".ATENCION MUESTROOOO los datos agregados al Body: Precio Unitario -->",   
             pedBody.lineasPedido[i].PrecioUnit, " Importe: -> ", 
             pedBody.lineasPedido[i].importe, " cantidad ya del body: -> ", 
             pedBody.lineasPedido[i].cantidad, ", e importe con IVA: -> ", 
             pedBody.lineasPedido[i].importeConIVA  )

             let newLinea = new Pedido.LineaPedido(
                 newPed2.idPedido, 
                 pedBody.lineasPedido[i].codProd, 
                 pedBody.lineasPedido[i].cantidad, 
                 pedBody.lineasPedido[i].PrecioUnit, 
                 pedBody.lineasPedido[i].importe, 
                 pedBody.lineasPedido[i].importeConIVA,
                "")
             //salvo Linea del Pedido
             newLinea2 = await newLinea.save();
             console.log (".Se guardo LineaPedido en la DB --> ", newLinea2)
            
             //Itero los detalles (gustos) de la linea del peido y doy de Alta
             j= 0 ;
             do {
                //Invariante Alta por cada Gusto de la linea del pedidos en ttPedidosLineasDetalle
                let newDetalle = new Pedido.LineaPedidoDetalle( 
                    newLinea2.idLinea, 
                    pedBody.lineasPedido[i].detalles[j].codGusto,
                    pedBody.lineasPedido[i].detalles[j].cantGusto
                )
                //salvo Detalle de la Linea del Pedido
                newDetalle2 = await newDetalle.save()
                console.log("Se guardó el Detalle en la Línae del Pedido en la DB --> ",  newDetalle2) 

                //Avanzo próximo gusto de la linea
                j++
             } while (j < pedBody.lineasPedido[i].detalles.length);

            //Fin de Inveriante del fin del fin de la iteración
             console.log(`Fin Iteración Numero: ${(i +1)}`);

            //avanzo próxima linea de Pedido
            i++;

        } while (i < pedBody.lineasPedido.length);

        //Si llego acá ==> Alta de Pedido Exitosa
        console.log (". SE TERMINÓ DE GUARDAR TODO EL PEDIDO EN LA DB")

        res.status(200).json({"message": "Operación Exitosa: Alta de Pedido en DB"})

        // //CORTO PARA PROBAR y Ver Consola
        // res.status(401).send("LO CORTO PARA PROBAR ==================" );
        // return;
    
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
    const pedidoFinded  = await Pedido.Pedido.getById(req.params.idPedido);
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
//    const pedidoFinded  = await Pedido.Pedido.getById(req.params.idPedido);
   
    res.send(pedidoFinded)
};

const getLastPedidoRaws = async(req, res, next) => {
    //Permiso: USER: solo su último pedido si tuviese 1.
    //         ADMIN y CADETES: el último pedido cargado en la DB de todos los pedidos
    console.log ("Va a buscar por último Pedido .-------> Tipo Usuario: '" + req.user.role +  "', Usuario: '" + req.user.userId +"'." );
    let pedidoLastFind = {}
     
    if (req.user.role === 'ADMIN' || req.user.role === 'CADETE') {
        //Traigo el último pedido de la DB
        pedidoLastFind  = await Pedido.Pedido.getLastPedidoRows();
        if (!pedidoLastFind) { 
            res.statusCode = 400;
            res.send({
                code: 401,
                mensaje: "No existe un úlitmo Pedido aún en la DB."});
            return;
        }

    } else {
    // Si es un usuario comun (No ADMIN Ni CADETE)
        //Busco el ultimo pedido de ese Usuario si lo hubiera
        pedidoLastFind  = await Pedido.Pedido.getLasPedidDeUnUsuarioInRaws(req.user.userId);
        if (!pedidoLastFind) { 
            res.statusCode = 400;
            res.send({
                code: 401,
                mensaje: "No existe un úlitmo Pedido aún en la DB."});
            return;
        };
    } 
    
    if (pedidoLastFind) {
        res.send(pedidoLastFind)  
    }else {
        res.send("No existe un úlitmo Pedido aún en la DB.");
    }
}    

const getLastPedidoJson = async(req, res, next) => {
    //Permiso: USER: solo su último pedido si tuviese 1.
    //         ADMIN y CADETES: el último pedido cargado en la DB de todos los pedidos
    console.log (".Va a buscar por último Pedido .-------> Tipo Usuario: '" + req.user.role +  "', Id Usuario: '" + req.user.userId +"'." );
    let pedidoLastFind = {}
     
    if (req.user.role === 'ADMIN' || req.user.role === 'CADETE') {
        //Traigo el último pedido de la DB
        pedidoLastFind  = await Pedido.Pedido.getLastPedidoInJson();
        if (!pedidoLastFind) { 
            res.statusCode = 400;
            res.send({
                code: 401,
                mensaje: "No existe un úlitmo Pedido aún en la DB."});
            return;
        }

    } else {
    // Si es un usuario comun (No ADMIN Ni CADETE)
        //Busco el ultimo pedido de ese Usuario si lo hubiera
        pedidoLastFind  = await Pedido.Pedido.getLasPedidDeUnUsuarioInJson(req.user.userId);
        if (!pedidoLastFind) { 
            res.statusCode = 400;
            res.send({
                code: 401,
                mensaje: "No existe un úlitmo Pedido aún en la DB."});
            return;
        };
    } 
    
    if (pedidoLastFind) {
        res.send(pedidoLastFind)  
    }else {
        res.statusCode = 400;
        res.send({
            code: 401,
            message: "No existe un úlitmo Pedido aún en la DB."});
    }
}    

const getAllPedidosPorAsignar = async (req, res, next) => {
//Los permisos solo en el Router: Solo ADMIN
    console.log ("Va a buscar los Pedidos Por Asignar solo para ADMIN---> ")
    const allPedidosXAsign  = await Pedido.Pedido.getAllPedidosPorAsignar();
    // console.log("Response user", users);
    res.send(allPedidosXAsign)
};

const getAllPedidosAsignadosPorEntregar = async (req, res, next) => {
//Los permisos solo en el Router: Solo ADMIN
    console.log ("Va a buscar los Pedidos Por Asigndos Por Entrear solo para ADMIN---> ")
    const allPedidosXAsign  = await Pedido.Pedido.getAllPedidosAsignadosPorEntregar();
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
    const pedidoFinded  = await Pedido.Pedido.getById(req.params.idPedido);
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

    const pedidoCanceled = await Pedido.Pedido.cancelPedidoByIdByUs(req.params.idPedido, req.body.motivoCancelUs );

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
    const pedidoCanceled = await Pedido.Pedido.cancelPedidoByIdByHel(req.params.idPedido, req.body.motivoCancelHel );
    //Si llego acá Canceló Exitosamente el Pedido By Heladería
    res.statusCode = 200;
    res.send(pedidoCanceled);  
}


const asignarPedidoACadeteById = async (req, res, next) => {
//Los permisos solo evaluados en la Ruta: Solo ADMIN
//VC: La fecHsEstimadaArribo: puede venir "" vacia, en ese caso se toma la XDate() + 45 minutos (queda en formato GMT UTC+00: Hora Mundial Coordinada) 
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
        //Busco el pedido para validar que exista y sus estados para ver si es momento de Asignar a cadete
        const elPedido = await Pedido.Pedido.getById(req.params.idPedido)
        console.log (".El Pedido es este: --> ", elPedido)
        if (!elPedido) {
            res.status(401).send("No existe un Pedido con este idPedido.");
            return;
        };
        if (elPedido.xAsingadoCadete==="X"){
            res.status(401).send("El Pedido ya está asignado a un cadete, no puede volver asignarse.");
            return;
        }
        if (elPedido.xEntregado==="X"){
            res.status(401).send("El Pedido ya esta marcado como 'Entregado' no pude asignarse a un cadete.");
            return;
        }
        if (elPedido.canceladoXUs || elPedido.canceladoXHel){
            res.status(401).send("El Pedido figura como 'Cancelado', no puede asignarse a un Cadete.");
            return;
        }
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
        const pedidoAsignCadete = await Pedido.Pedido.asignarPedidoACadeteById(
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
//VC: sin importar el estado del pedido se marca como Entregado:
//       podria haberse retirado por mostrador y no asignado a Cadete x ejemplpo (entonces no sería necesario validar si se asginó a cadete o no.==> entra pollo sale pollo)
//    Si valido que no esté cancelado el pedido
//    Y valido que si lo cancela un Cadete que sea el cadete que lo tenía asignado.
    console.log("---> entró al entregaDePedidoById");
    console.log("idPedido: " + req.params.idPedido + ".")
    //Validación previa
    if (req.params.idPedido === "") {
        res.statusCode = 400;
        res.send("idPedido no puede estar vacío.");
        return;
    }
    //Busco el pedido para Validaciones:
    const pedidoFinded = await Pedido.Pedido.getById(req.params.idPedido);
    console.log(".El Pedido Encontrado pasado por el req.params: --> " , pedidoFinded)
    if (!pedidoFinded) { 
        res.status(400).send("No Existe un Pedido con este 'idPedido'.");
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
    //si el pedido está asignado a un cadete <> del que se logueó
    if (pedidoFinded.idUserCadete !== req.user.userId) {
        res.status(400).send("El Pedido '" + req.params.idPedido + "' está asignado al cadete '" + pedidoFinded.nomCadete + "', él o algún usuario con Role de ADMIN podrán marca este pedio como Entregado.  El cadete '" + req.user. email+ "' no está autorizado a marcarlo como Entregado a este Pedido." );
        return;
    }

    const pedidoEntregado = await Pedido.Pedido.entregaDePedidoById(req.params.idPedido );
    console.log("pedidoEntregado : ", pedidoEntregado);
    res.send(pedidoEntregado)
};


// Validaciones -------------------------------------------------------------

const idPedidoDoseExist = async (idPedido) => {
    const pedidoById = await Pedido.Pedido.getById(idPedido);
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

    console.log (".Muestra LINEAS_Pedido del Body: 'pedBody.lineasPedido':-->  " , pedBody.lineasPedido)
    // console.log (pedBody.lineasPedido)
    let liNroLinea = 0
    //Valido integridad de Lineas --------------------
    //Recorro las lineas del Pedido del Body:  el  //El forEach no funca con await
    do {    
        //valido Linea
        //Busco producto para ver si existe
        let prodFinded = await Producto.findByCod(pedBody.lineasPedido[liNroLinea].codProd);
        if (!prodFinded) {
            return "El codProducto '" +  pedBody.lineasPedido[liNroLinea].codProd + "' de la línea de Pedido Nro. '" + (liNroLinea + 1) + "' no Existe.";
        } else {
            //agrego datos a la linea del Pedido
            //el PrecioUnit de la linea  = prodFinded.precioUnitFinal
            pedBody.lineasPedido[liNroLinea].PrecioUnit = prodFinded.precioUnitFinal
            pedBody.lineasPedido[liNroLinea].importe = pedBody.lineasPedido[liNroLinea].cantidad * pedBody.lineasPedido[liNroLinea].PrecioUnit
            pedBody.lineasPedido[liNroLinea].importeConIVA =  pedBody.lineasPedido[liNroLinea].importe

            console.log(".MUESTROOOO los datos agregados al Body: Precio Unitario -->",   pedBody.lineasPedido[liNroLinea].PrecioUnit, " Importe: -> ", pedBody.lineasPedido[liNroLinea].importe, " cantidad ya del body: -> ", pedBody.lineasPedido[liNroLinea].cantidad, ", e importe con IVA: -> ", pedBody.lineasPedido[liNroLinea].importeConIVA  )
        // }
        //Falta ver si lo quiero validar para evitar hacking
        //valido DetalleLinea Recorro y valido el detalle
        // linea.detalles.forEach(gusto => {
        //     const gustoFinded = await Gusto.findByCod(gusto.codGusto);
        //     if (!gustoFinded) {
        //         return "El codGusto '" + gusto.codGusto + "'  no Existe.";
        //     } else {
        //         //no hago nada: no hay que agrear datos.
        //     }
        // }); //Fin Recorrido de Detalles Linea
        }
        console.log(".Muestro LINEA del PEDIDO QUE SE VA CONFORMANDO: --> ", pedBody.lineasPedido[liNroLinea].detalles )
       
        //Avanzo
        liNroLinea++
    } while (liNroLinea < pedBody.lineasPedido.length)
    //Fin Recorrido de Lineas
    
    // Se acuercada el Front Sabe como mandarlos y el front lo validará

    //Si llego acá no hay mensajes de validación de Registro
    return null
}

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
    getLastPedidoRaws,
    getLastPedidoJson, 
    getAllPedidosPorAsignar,
    getAllPedidosAsignadosPorEntregar,
    cancelPedidoByIdByUs,
    cancelPedidoByIdByHel, 
    asignarPedidoACadeteById,
    entregaDePedidoById,
};