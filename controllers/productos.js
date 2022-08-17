//Controlador Productos - Independiente de con que DB esté hecho
const Producto = require("../models/producto");  // este es el que impacta y conoce la DB

//para que compile
const Gusto = require("../models/gusto");  // este es el que impacta y conoce la DB


const createProducto = async (req, res, next) => {
    prodBody = req.body
 
    //Validation of fields of Post---------------
    const messageValid = await MessageNotPassValidationCreate(prodBody)
    console.log ("mensaje devuelvo x validation:",  messageValid)
    if (messageValid) {
        res.status(400).json({ message: messageValid})
        return
    }

    console.log("paso por aca antes de crear newinstance de Producto.")
   
    // Creo la entidad
    let newProduct = new Producto(
        req.body.codProd,
        req.body.nomProd,
        req.body.dscProd,
        req.body.unidad,
        req.body.precioUnitFinal, 
        req.body.foto,
    );
    console.log("paso por aca despues de crear new instance")
    try {
        // Salvando la nueva entidad
        newProd2 = await newProduct.save();
        res.send(newProd2);
      } catch (err) {
        res.statusCode = 500;
        res.send(err);
      }
};

const getAllProductos = async (req, res, next) => {
    const allProducts  = await Producto.getAllProductos();
    // console.log("Response user", users);
    res.send(allProducts)
};

const getByCod = async (req, res, next) => {
   console.log ("Va a buscar por CodProd -------> " + req.params.codProd)
    const prodFinded  = await Producto.findByCod(req.params.codProd);
   
    res.send(prodFinded)
};

const updateByCod = async (req, res, next) => {
    const nomProd = req.body.nomProd;
    const dscProd = req.body.dscProd;
    const unidad = req.body.unidad;
    const precioUnitFinal =req.body.precioUnitFinal;
    const foto = req.body.foto;

    console.log("---> entro al updataByCod");
    console.log("CodProd: " + req.params.codProd + ", nomProd: ", nomProd, ", dscProd: ", dscProd)

    if (req.params.codProd === "") {
        res.statusCode = 400;
        res.send("codProd no puede estar vacío.");
    }
    if (!await codProdDoseExist(req.params.codProd)) { 
        res.statusCode = 400;
        res.send("No existe un Producto con este codProd.");
        return;
    };
    if (!campoIsNotEmpty(nomProd)) {
        res.statusCode = 400;
        res.send("El Nombre del Producto no puede estar vacío.");
        return;
    };

    const productoUpdated = await Producto.uptadeByCod(req.params.codProd, nomProd, dscProd, unidad, precioUnitFinal, foto );

    res.send(productoUpdated);  
}

const deleteByCod = async (req, res, next) => {
    const gustos  = await Gusto.getAllGustos();
    // console.log("Response user", users);
    res.send(gustos)
};

// Validaciones -------------------------------------------------------------

const codProdDoseExist = async (codProd) => {
    const prodByCod = await Producto.findByCod(codProd);
    console.log ("Encontrado ", prodByCod)
    if (prodByCod) {
        return true
    }else {
        return false
    }    
}

const campoIsNotEmpty = (campo) => {
    return campo !== "";
};

const MessageNotPassValidationCreate = async (ProdBody) => {
    //return Message of Error of validacion
    //If pass validation --> return null 
    
    if (!campoIsNotEmpty(ProdBody.codProducto)) {   
        return "El Código del Producto no puede estar vacío.";  
    }
    if (!campoIsNotEmpty(ProdBody.nomProd)) {
        return "El Nombre del Producto no puede estar vacío.";
    }
    if (!campoIsNotEmpty(ProdBody.unidad)) {
        return "La Unidad no puede estar vacía.";
    }
    //Si ya existe ese codigo de producto
    if (await codProdDoseExist(ProdBody.codProd)) { 
        return "Ya existe un Producto con este codProd.";
    };

    //Si llego acá no hay mensajes de validación de Registro
    return null
};


module.exports = {
    createProducto,
    getAllProductos,
    getByCod,
    updateByCod,
    deleteByCod, 
};