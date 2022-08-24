//Controlador Users - Independiente de con que DB esté hecho
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");  // este es el que impacta y conoce la DB

let moMensajeRes = {};  // creo variable global tipo objeto a nivel de modulo para pasar los mensajes de Res

//Armo el CRUD de Usuarios (Create, Read, Update, Delete )

//# Testeado el 15/08/22
// Es para que el Usuario cree su propio Usuario
const createUser = async (req, res, next) => {

    const userBody = req.body
    const msgValidComunesAltaUser = await MsgNotPasaValidatinCommonNewUser(userBody, res)
    console.log ("mensaje devuelvo x validation de Alta de Usuario comun a all roles:",  msgValidComunesAltaUser)

    if (msgValidComunesAltaUser) {
        res.status(400).json({ message: msgValidComunesAltaUser})
        return
    };

    console.log("Entrando al CreateUser, ya paso validaciones, por aca va el req.body", userBody, "y el req.user: ", req.user )
  
    // Si llego acá: --> Hashe Password y Guardo ---------
    const hash = await bcrypt.hash(userBody.password, 10);

    // Si llego acá es que valido bien ==> Creo la entidad
    let newUser = new User(
        req.body.email,
        req.body.name,
        hash,
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

    //Validaciones Previas
    if (req.params.email === "") {
        res.statusCode = 400;
        res.send("El Eamil no puede estar vacío.");
    }

    //Veo de Permisos si puedo o no: ADMIN puede siempre, USER solo su usuario: ------------------------------
    if (!usuarioTienePermisoParaUpdate(req.user.role, req.user.userId, req.user.email, req.params.email )) {
        //Salgo El mensaje send ya salio en la funcion de arriba
        res.status(401).json(moMensajeRes)
        return
    }
    //Fin Evaluación de Permisos -------------------------------------

    //Resto de las validaciones -------------------------
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
            return;
        }

    } catch (error) {
        res.status(500).json({ message: error.message + ". Call and tell the Admin Rol that Update has not done properly for email '" + req.params.email + "'." });
    }
}


//# Testeado el 15/08/22 --> ok
const bajaUserByEmail = async(req, res, next) => {
//VC: Baja Logica, no borro para no perder integridad referencial
//1ero Updateo en Heroku.PostgreSQL y 2do en Atalas.Mongo, si la hubiera
   
    console.log("Entro función bajaUserByEmail --------> ", req.params.email , "El usuario logueado tiene: ", req.user.role, " , email: ", req.user.email)

    //Validaciones Previas 
    if (req.params.email === "") {
        res.statusCode = 400;
        res.send("Eamil no puede estar vacío.");
        return;
    }
    //Veo de Permisos si puedo o no: ADMIN puede siempre, USER solo su usuario: ------------------------------
    if (!usuarioTienePermisoParaUpdate(req.user.role, req.user.userId, req.user.email, req.params.email )) {
        //Salgo El mensaje send ya salio en la funcion de arriba
        res.status(401).json(moMensajeRes)
        return
    }
    //Fin Evaluación de Permisos -------------------------------------

    //Sino existe el usuario
    if (await userDosentExist(req.params.email)) { 
        console.log("--> Entrando a buscar si existe el email a borrar")
        res.statusCode = 400;
        res.send("No existe ningún usuario con este email.");
        return;
    };

    try {
        //1ero Borro sobre PostgreSQL
        const userDeactivate1 = await User.bajaUserByEmail(req.params.email);
        if (userDeactivate1) {
            console.log ("Si llego acá desactivó bien User over PostgreSQL.User ", userDeactivate1)
           
            // res.json("Deleted user OK in Heroku.PostgreSQL.User by email: '" + req.params.email + "'." );

            res.status(200).json({ message: "User deactivated OK in Heroku.PostgreSQL.User by email: '" + req.params.email + "'." , userDeactivated: userDeactivate1 });

            return;

        } else {
            res.status(500).json({ message: error.message + ". Call and tell the Admin Role that the Deactivation has not done properly for email '" + req.params.email + "' over PostgreSQL.User"}); 
        }
    } catch (error) {
        res.status(500).json({ message: error.message + ". Call and tell the Admin Role that Deactivation has not done properly for email '" + req.params.email + "'" });    
    }            
}

//# Testeado el 15/08/22 --> ok
const activateUserByEmail = async(req, res, next) => {
    //VC: Activación Logica, no se borra para no perder integridad referencial
       
        console.log("Entro función activateUserByEmail --------> ", req.params.email , "El usuario logueado tiene: ", req.user.role, " , email: ", req.user.email)
    
        //Validaciones Previas 
        if (req.params.email === "") {
            res.statusCode = 400;
            res.send("Eamil no puede estar vacío.");
            return;
        }
        //Veo de Permisos si puedo o no: ADMIN puede siempre, USER solo su usuario: ------------------------------
        if (!usuarioTienePermisoParaUpdate(req.user.role, req.user.userId, req.user.email, req.params.email )) {
            //Salgo El mensaje send ya salio en la funcion de arriba
            res.status(401).json(moMensajeRes)
            return
        }
        //Fin Evaluación de Permisos -------------------------------------
    
        //Sino existe el usuario
        if (await userDosentExist(req.params.email)) { 
            console.log("--> Entrando a buscar si existe el email a borrar")
            res.statusCode = 400;
            res.send("No existe ningún usuario con este email.");
            return;
        };
    
        try {
            //1ero Borro sobre PostgreSQL
            const userActivated1 = await User.activateUserByEmail(req.params.email);
            if (userActivated1) {
                console.log ("Si llego acá Activó bien la cuenta del User over PostgreSQL.User ", userActivated1)
               
                // res.json("Deleted user OK in Heroku.PostgreSQL.User by email: '" + req.params.email + "'." );
    
                res.status(200).json({ message: "User Activated OK in Heroku.PostgreSQL.User by email: '" + req.params.email + "'." , userActivated: userActivated1 });
    
                return;
    
            } else {
                res.status(500).json({ message: error.message + ". Call and tell the Admin Role that the Activation has not done properly for email '" + req.params.email + "' over PostgreSQL.User"}); 
            }
        } catch (error) {
            res.status(500).json({ message: error.message + ". Call and tell the Admin Role that Activation has not done properly for email '" + req.params.email + "'" });    
        }            
    }

//Validaciones -------------------------------------

const MsgNotPasaValidatinCommonNewUser = async (userBody, res) => {
    if (!emailIsValid(userBody.email)) {
        // res.statusCode = 400;
        //res.send("El email no puede estar vacío");
        return "El email no puede estar vacío";
    };
    if (!nameIsValid(userBody.name)) {
        // res.statusCode = 400;
        // res.send("El Nombre no puede estar vacío.");
        return "El Nombre no puede estar vacío.";
    };
    if (!passwordIsValid(userBody.password)) {
        // res.statusCode = 400;
        // res.send("La Contraseña no puede estar vacía.")
        return "La Contraseña no puede estar vacía.";
    };
    if (!validLengthPassword(userBody.password)) {
        return "La Contraseña debe tener al menos 6 caracters."
        ;
    };
    if (!roleIsValid(userBody.role)) {
        // res.statusCode = 400;
        // res.send("El Role no es válido.");
        return "El Role no es válido.";
    };
    if (await userAlreadyExists(userBody.email)) { 
        // res.statusCode = 400;
        // res.send("Ya existe este Nombre de usuario.");
        return "Ya existe este Nombre de usuario.";
    };
    //Si llega al final y no hay nigun error se devolverá vacío o null
}

const usuarioTienePermisoParaUpdate = (userRole, userId, userEmailLoged, userEmailToUpdate ) => {
//Aprehendizaje: los objetos pasan por Referencia
    if (userRole === "ADMIN") {
        console.log ("usuarioTienePermisoParaUpdate: TRUE; xque es ADMIN")
        return true
    }
    if (userRole === "USER" && userEmailLoged === userEmailToUpdate) {
        console.log ("usuarioTienePermisoParaUpdate: TRUE: xque es el mismo Usuario")
        return true
    } else {
        console.log ("usuarioTienePermisoParaUpdate: FALSE: xque NO es el mismo Usuario")
       
        moMensajeRes = {mensaje: "'USER' role can't update data User to other Users, only ADMIN role can do it. "}

        // ahora manda el res el modulo principal
        // res.status(401).json({ message: "'USER' role can't update data User to other Users, only ADMIN role can do it. "})
        return false
    }
    console.log("usuarioTienePermisoParaUpdate: No debería llegar acá. userRole distintos a los requeridos, fallo middlewares de autorization")
    return false
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
const validLengthPassword = (password) => {
    console.log(password.length)
    return  !(password.length < 6) 
};
const roleIsValid = (role) => {
    return ( role !== "" &&
            (role === "USER" || role === "ADMIN" || role === "CADETE") )
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
    bajaUserByEmail,
    activateUserByEmail,
};