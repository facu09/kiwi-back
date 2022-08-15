const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");  // este es el que impacta y conoce la DB Horoku.PostgreSQL

//# desactivo el MongoDB
// const userMongo = require("../models/auth"); // este es el que impacta y conoce la DB MongoDB en ATLAS.
const { connectionString } = require("pg/lib/defaults");

// El registerUser de route es otra ruta para la creación de usuario de los usuario
//  publicos
//Armo el CRUD de Registro y Login de Usuarios 

//# Testeado el 15/08/22
//Da de  Alta el usuario solo en PostgreSQL, hashea el Password
const registerUser = async (req, res, next) => {
    //Tomo el body del request
    const userBody = req.body;

    try {
        //Validation of fields of Post---------------
        const messageValid = await MessageNotPassValidationRegister(userBody)
        console.log ("mensaje devuelvo x validation:",  messageValid)
        if (messageValid) {
            res.status(400).json({ message: messageValid})
            return
        }

        // Si llego acá: --> Hashe Password y Guardo ---------
        const hash = await bcrypt.hash(userBody.password, 10);
        
        //1º Guardo en Prisma Heroku PostgreSQL (Redundancy Model) ----
        //Creo 1 nueva instancia de la clase User del /models/user.js
        let newUser = new User(
            userBody.email,
            userBody.name,
            hash,
            "USER",
            userBody.domicilio,
            userBody.mobbile,
        );
        try {
            // Salvando la nueva entidad in -> Heroku.PostgreSQL
            newUser2 = await newUser.save();
            res.send(newUser2);  //devuelvo el usuario creado
            console.log ("Si llego acá:--> grabo bien en DB.Heroku.PostgreSQL")

        } catch (error) {
            console.log("entro al Catch del Controllers.auth.registerUser().InsertPostgreSQL")
            // res.statusCode = 500;
            // res.send(err);
            res.status(500).json({ message: error.message + ". Error en Insert de Heroku.PostgreSQL --> aborta Inserts" });
            return; //..para que no siga con lo de abajo
        }
        //Fin 1ºGuardo en Prisma Heroku PostgreSQL -------

    } catch (error) {
        console.log("entro al Catch del Controllers.auth.registerUser.general. Enla validación antes del insert")
        res.status(500).json({ message: error.message });
        return;
    } 
}

const loginUser = async (req, res, next) => {
    try {
        //Authenticate -------------------
        const userBody = req.body;

        //Validaciones Previas --------
        if (userBody.email === "") {
            res.statusCode = 400;
            res.send("Eamil cannot be empty");
            return;
        };
        if (userBody.password === "" ) {
            res.statusCode = 400;
            res.send("Password cannot be empty");
            return;
        };
        //Fin validaciones previas -------------
        
        //Busco en Usuario x Email en orden: 1ero Mongo, y luego backup redundante Heroku.PostgreSQL
        const { user, porMongo, IdUserPostgre } = await searchUserByEmail(userBody.email);
        console.log("Loguin: -> Usuario encontrado: ",   user,  " porMongo = ", porMongo );
        if (user) {
            console.log("Logueando Usuario: --> Usuario Existenteen en MongoDB: ", porMongo)
            // comparao contra password Heroku.PostgreSQL
            const resultC = await bcrypt.compare(userBody.password, user.password)
            // Faltaria 1er servidor de autenticación

            if (resultC && porMongo) {
                //Armo token con datos de Mongo 
                const accessToken = jwt.sign(
                    {
                        id: IdUserPostgre,  //Calve tener el PostgreSQL.User.id para las consultas de este usuario
                        fistName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                    },
                    process.env.ACCESS_TOKEN_SECRET_KEY,
                    { expiresIn: 6000 } //expira en 1 hora
                );
                res.json({ accessToken: accessToken });
                return;
            } else if (resultC && !porMongo ) {
                //Armo token con datos de PostreSQL
                const accessToken = jwt.sign(
                    {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                    },
                    process.env.ACCESS_TOKEN_SECRET_KEY,
                    { expiresIn: 60*10 } //expira en tantos segundo
                );
                // Devuevlo el Token para que lo tenga el usuario y el front
                res.json({ accessToken: accessToken });
                return;
            }
        }
        res.status(403).json({ message: "Email and password not valid" });

    } catch (error) {
        console.log (error);
        res.status(500).json({ message: error.message + ". Problemas en el Login" });
    }

    //     // FALTA MODIFICAR
    //     // Una vez Autentidado: --> genero el Token y se lo doy como respuesta
    //     const accessToken = jwt.sign(
    //         {name:"fcigliuti@gmail.com", role: "admin"}, 
    //         process.env.ACCESS_TOKEN_SECRET_KEY,
    //         { expiresIn: 900 })
    //     res.json({ accessToken: accessToken})
    // } catch (error) {
    //     console.log (error);
    //     res.status(500).json({ message: error.message + ". Problemas en el Login" });
    // }
}

const logoutUser = async (req, res, next) => {
    //Logout: 
    //  habrá que matar el token y o el de refresh
   
}

// Validaciones --------------------------------------
const thereIsEmail = (email) => {
    return email;
};
const thereIsPassword = (password) => {
  return password;
};

const validLengthPassword = (password) => {
    console.log(password.length)
    return  !(password.length < 6) 
};


//# Testeado el 15/08/22
//Busca el Usuario en DB.PostgreSQL para obtener el user.id para tenerlo para todas las consultas
const searchUserByEmail = async (email) => {
try{
    console.log ("Va a ir a buscar a Heroku 2do")
    const userPostg = await User.findByEmail(email);
    console.log("User.id PostgreSQL: " + userPostg.id)
    const idUserPostgreSQL2 = userPostg.id
    if (idUserPostgreSQL2) {
        console.log ("Mail Encontrado en DB.PostgreSQL");
        return { user: userPostg, IdUserPostgre: idUserPostgreSQL2 };
    }
} catch {
    //Si esta caido Herolku.DB 
    console.log("Del catch de searchUserByEmail")
    return {user: null  };
}
    //si llego acá no encontro nada
    return {user: null  };
};

//# Testeado el 15/08/22
const MessageNotPassValidationRegister = async (userBody) => {
    //return Message of Error of validacion
    //If pass validation --> return null 
    
    if (!userBody.name) {
        return "El Nombre no puede estar vacío."
    };
    if (!userBody.email) {
        return "Email no puede estar vacío.";
    };
    if (!thereIsPassword(userBody.password)) {
        return "La contraseña no puede estar vacía.";
    };
    if (!validLengthPassword(userBody.password)) {
        return "Password debe tener al menos 6 caracters."
        ;
    };
    //Valido que no exista un usuario con el mismo email ya.
    const { user } = await searchUserByEmail(userBody.email);
    console.log("Loguin: -> Usuario encontrado: ",   user );
    if  (user) {
        console.log ("Email ya existe.")
        return "Email already exist.";
    };

    //Si llego acá no hay mensajes de validación de Registro
    return null
};

// Fin Validaciones ----------------------------------------

//EXPORTO EL CRUD (Create, Read, Update, Delete )
module.exports = {
    registerUser,
    loginUser,
    logoutUser,
};

