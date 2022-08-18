//Controlador Gustos - Independiente de con que DB esté hecho
const Gusto = require("../models/gusto");  // este es el que impacta y conoce la DB

const createGusto = async (req, res, next) => {
    const codGusto = req.body.codGusto;
    const nombreGusto = req.body.nombreGusto;
    const dscGusto = req.body.dscGusto;

    if (!campoIsNotEmpty(codGusto)) {
        res.statusCode = 400;
        res.send("El Código del Gusto no puede estar vacío.");
        return;
    }
    if (!campoIsNotEmpty(nombreGusto)) {
        res.statusCode = 400;
        res.send("El Nombre del Gusto no puede estar vacío.");
        return;
    }
    if (!await idDosentExist(codGusto)) { 
        res.statusCode = 400;
        res.send("Ya existe un Gusto con este codGusto.");
        return;
    };

    // falta otras validarciones
    console.log("paso por aca antes de crear newinstance de Gusto")
   
    // Creo la entidad
    let newGusto = new Gusto(
        req.body.codGusto,
        req.body.nombreGusto,
        req.body.dscGusto,
    );
    console.log("paso por aca despues de crear new instance")
    try {
        // Salvando la nueva entidad
        newGusto2 = await newGusto.save();
        res.send(newGusto2);
      } catch (err) {
        res.statusCode = 500;
        res.send(err);
      }

};

const getAllGustos = async (req, res, next) => {
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
    console.log("CodGusto: " + req.params.CodGusto + ".")
    //Validación previas -------------------
    if (req.params.codGusto === "") {
        res.statusCode = 400;
        res.send("codGusto no puede estar vacío.");
    }
    if (await idDosentExist(req.params.codGusto)) { 
        res.statusCode = 400;
        res.send("No existe un Gusto con este codGusto.");
        return;
    };
    //Fin Validaciones previas --------------

    const gustoDeleted  = await Gusto.deleteByCod(req.params.codGusto );
    console.log("gustoDeleted: ", gustoDeleted);
    res.send(gustoDeleted)
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
    createGusto,
    getAllGustos,
    updateByCod, 
    deleteByCod,
};