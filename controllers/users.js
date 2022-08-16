//Controlador Users - Independiente de con que DB esté hecho
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");  // este es el que impacta y conoce la DB

//Armo el CRUD de Usuarios (Create, Read, Update, Delete )

//# Testeado el 15/08/22
// Es para que el Usuario cree su propio Usuario
const createUser = async (req, res, next) => {

    const userBody = req.body
    const msgValidComunesAltaUser = await MsgNotPasaValidatinCommonNewUser(userBody)
    console.log ("mensaje devuelvo x validation de Alta de Usuario comun a all roles:",  msgValidComunesAltaUser)

    if (msgValidComunesAltaUser) {
        res.status(400).json({ message: msgValidComunesAltaUser})
        return
    };

    console.log("Entrando al CreateUser, ya paso validaciones, por aca va el req.body", userBody, "y el req.user: ", req.user )
  
    // Si llego acá es que valido bien ==> Creo la entidad
    let newUser = new User(
        req.body.email,
        req.body.name,
        req.body.password,
        req.body.role, 
        req.body.domicilio,
        req.body.mobbile
    );

    try {
        // Salvando la nueva entidad
        newUser2 = await newUser.save();
        res.send(newUser2);
      } catch (err) {
        res.statusCode = 500;
        res.send(err);
      }
};

//# Testeado el 15/08/22
const getAllUsers = async (req, res, next) => {
    const users = await User.getAllUsers();
    // console.log("Response user", users);
    res.send(users)
}

//# Testeado el 15/08/22
// /api/users/search?email=roberto5@gmail.com&name=Roberto
const findUserByEmail = async (req, res, next) => {
    // console.log("----> entrando a findUserByEmail")
    if (req.query.email === "") {
        res.statusCode = 400;
        res.send("Eamil cannot be empty")
    }
    if (await userDosentExist(req.query.email)) { 
        res.statusCode = 400;
        res.send("User with this eamil dosen't exist.");
        return;
    };
    
    // console.log("Email ingresado por req.query.email", req.query.email)
    // console.log("Name por req.query.name", req.query.name)

    const users = await User.findByEmail(req.query.email);
   
    console.log("Response user", users);
    res.send(users)
}

//# Testeado el 15/08/22 --> ok
// ... su ruta fue:  "// /api/users/email/roberto5@gmail.com"
const updateByEmail = async (req, res, next) => {
    //PATH PARAM id es parte de la ruta lo puedo acceder como parte del req
    const name = req.body.name;
    const password = req.body.password;
    const domicilio = req.body.domicilio;
    const mobbile = req.body.mobbile;

    console.log("---> entro al updataByEmail");
    console.log("email: " , req.params.email, ", nombre: ", name, ", password: " , password, " , domicilio: " , domicilio, ", mobbile; " , mobbile)

    if (req.params.email === "") {
        res.statusCode = 400;
        res.send("El Eamil no puede estar vacío.");
    }
    if (await userDosentExist(req.params.email)) { 
        res.statusCode = 400;
        res.send("No existe usuario regisrado con este email.");
        return;
    };
    if (!nameIsValid(name)) {
        res.statusCode = 400;
        res.send("El Nombre no puede estar vacío.");
        return;
    };
    if (!passwordIsValid(password)) {
        res.statusCode = 400;
        res.send("La Contraseña no es valida")
        return
    }
    if (!domicilio) {
        res.statusCode = 400;
        res.send("El domicilio no puede estar vacío");
        return;
    };
    if (!mobbile) {
        res.statusCode = 400;
        res.send("El celular no puede estar vacío.");
        return;
    };

    //Antes de Apdatear hasheo la password
    // Si llego acá: --> Hashe Password y Guardo ---------
    const hash = await bcrypt.hash(password, 10);
    console.log ("Haseó la password: " + hash)

    try {
        const userUpdated1 = await User.uptadeByEmail(req.params.email, name, hash, domicilio, mobbile );

        if (userUpdated1) {
            console.log ("Si llego acá Updateó bien User over PostgreSQL.User: email: '" + req.params.email + "'" , userUpdated1);
            
            res.json("Updated user OK in Heroku.PostgreSQL.User by email: '" + req.params.email + "'.");

            return;

        } else {
            res.status(500).json({ message: error.message + ". Call and tell the Admin Rol that Update has not done properly for email '" + req.params.email + "'." });  
        }

    } catch (error) {
        res.status(500).json({ message: error.message + ". Call and tell the Admin Rol that Update has not done properly for email '" + req.params.email + "'." });
    }
}


//# Testeado el 15/08/22 --> ok
const deleteByEmail = async(req, res, next) => {
//1ero Borro en Heroku.PostgreSQL y 2do en Atalas.Mongo.
   
    // console.log("--------> ", req.params.email )
    //Validaciones Previas 
    if (req.params.email === "") {
        res.statusCode = 400;
        res.send("Eamil no puede estar vacío.");
        return;
    }
    //Sino existe el usuario
    if (await userDosentExist(req.params.email)) { 
        console.log("--> Entrando a buscar si existe el email a borrar")
        res.statusCode = 400;
        res.send("No existe ningún usuario con este email.");
        return;
    };

    try {
        //1ero Borro sobre PostgreSQL
        const userDeleted1 = await User.deleteByEmail(req.params.email);
        if (userDeleted1) {
            console.log ("Si llego acá borró bien User over PostgreSQL.User ", userDeleted1)
           
            // res.json("Deleted user OK in Heroku.PostgreSQL.User by email: '" + req.params.email + "'." );

            res.status(200).json({ message: "Deleted user OK in Heroku.PostgreSQL.User by email: '" + req.params.email + "'." , userDeleted: userDeleted1 });

            return;

        } else {
            res.status(500).json({ message: error.message + ". Call and tell the Admin Rol that Deleted has not done properly for email '" + req.params.email + "' over PostgreSQL.User"}); 
        }
    } catch (error) {
        res.status(500).json({ message: error.message + ". Call and tell the Admin Rol that Deleted has not done properly for email '" + req.params.email + "'" });    
    }            
}

//Validaciones -------------------------------------

const MsgNotPasaValidatinCommonNewUser = async (userBody) => {
    if (!emailIsValid(userBody.email)) {
        res.statusCode = 400;
        res.send("El email no puede estar vacío");
        return;
    };
    if (!nameIsValid(userBody.name)) {
        res.statusCode = 400;
        res.send("El Nombre no puede estar vacío.");
        return;
    };
    if (!passwordIsValid(userBody.password)) {
        res.statusCode = 400;
        res.send("La Contraseña no puede estar vacía.")
        return
    };
    if (!roleIsValid(userBody.role)) {
        res.statusCode = 400;
        res.send("El Role no es válido.");
        return;
    };
    if (await userAlreadyExists(userBody.email)) { 
        res.statusCode = 400;
        res.send("Ya existe este Nombre de usuario.");
        return;
    };
    //Si llega al final y no hay nigun error se devolverá vacío o null
}



const emailIsValid = (email) => {
    return email !== "";
};
const nameIsValid = (name) => {
    return name !==""; 
}
const passwordIsValid = (password) =>  {
    return password !== "";
}
const roleIsValid = (role) => {
    return ( role !== "" &&
            (role === "USER" || role === "ADMIN") )
};

const userAlreadyExists = async (email) => {
    const userByEmail = await User.findByEmail(email);
    // console.log("user encontrado:", userByEamil)
    if (userByEmail) {
        return true
    }else {
        return false
    }
};

const userDosentExist = async (email) => {
    console.log ("---> Entro al userDosentExist")
    const userByEmail = await User.findByEmail(email);
    console.log(userByEmail) ;
    if (userByEmail) {
        return false
    }else {
        return true
    } 
}

//EXPORTO EL CRUD (Create, Read, Update, Delete )
module.exports = {
    createUser,
    getAllUsers,
    findUserByEmail,
    updateByEmail,
    deleteByEmail,
};