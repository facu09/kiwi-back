//Controlador Productos - Independiente de con que DB esté hecho
const Producto = require("../models/producto");  // este es el que impacta y conoce la DB

//para que compile
const Gusto = require("../models/gusto");  // este es el que impacta y conoce la DB


const createProducto = async (req, res, next) => {
    const codProd = req.body.codProd;
    const nomProd = req.body.nomProd;
    const dscProd = req.body.dscProd;
    const unidad = req.body.unidad;
    const precioUnitFinal = req.body.precioUnitFinal;
    const foto = req.body.foto;
    
// por ACA VOY RETOCANDO ----------////
// anduvo el insert
// tengo que probar todo esto
// tengo que volve a migrar del excel del mdb

    if (!campoIsNotEmpty(codProd)) {
        res.statusCode = 400;
        res.send("El Código del Producto no puede estar vacío.");
        return;
    }
    if (!campoIsNotEmpty(nomProd)) {
        res.statusCode = 400;
        res.send("El Nombre del Producto no puede estar vacío.");
        return;
    }
    if (!campoIsNotEmpty(unidad)) {
        res.statusCode = 400;
        res.send("La Unidad no puede estar vacía.");
        return;
    }
    //Si ya existe ese codigo de producto
    if (!await idDosentExist(codProd)) { 
        res.statusCode = 400;
        res.send("Ya existe un Producto con este codProd.");
        return;
    };

    // falta otras validarciones
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
    const gustos  = await Gusto.getAllGustos();
    // console.log("Response user", users);
    res.send(gustos)
};

const getByCod = async (req, res, next) => {
    const gustos  = await Gusto.getAllGustos();
    // console.log("Response user", users);
    res.send(gustos)
};

const updateByCod = async (req, res, next) => {
    const nombreGusto = req.body.nombreGusto;
    const dscGusto = req.body.dscGusto;

    console.log("---> entro al updataByCod");
    console.log("Cod: " , req.params.codGusto, ", nombreGusto: ", nombreGusto, ", dscGusto: ", dscGusto)

    if (req.params.codGusto === "") {
        res.statusCode = 400;
        res.send("codGusto no puede estar vacío");
    }
    if (await idDosentExist(req.params.codGusto)) { 
        res.statusCode = 400;
        res.send("No existe un Gusto con este codGusto.");
        return;
    };
    if (!campoIsNotEmpty(nombreGusto)) {
        res.statusCode = 400;
        res.send("El Nombre del Gusto no puede estar vacío.");
        return;
    };

    const gustoUpdated = await Gusto.uptadeByCod(req.params.codGusto, nombreGusto, dscGusto );

    res.send(gustoUpdated);  
}

const deleteByCod = async (req, res, next) => {
    const gustos  = await Gusto.getAllGustos();
    // console.log("Response user", users);
    res.send(gustos)
};

// Validaciones

const idDosentExist = async (codGusto) => {
    const gustoByCod = await Gusto.findByCod(codGusto);
    console.log ("Encontrado ", gustoByCod)
    if (gustoByCod) {
        return false
    }else {
        return true
    } 
}

const campoIsNotEmpty = (campo) => {
    return campo !== "";
};

module.exports = {
    createProducto,
    getAllProductos,
    getByCod,
    updateByCod,
    deleteByCod, 
};