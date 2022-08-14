const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");  // este es el que impacta y conoce la DB Horoku.PostgreSQL

const userMongo = require("../models/auth"); // este es el que impacta y conoce la DB MongoDB en ATLAS.
const { connectionString } = require("pg/lib/defaults");

// El registerUser de route es otra ruta para la creación de usuario de los usuario
//  publicos
//Armo el CRUD de Registro y Login de Usuarios 

//Da de  Alta el usuario en MongoDB + PostgreSQL, hashea el Password
const registerUser = async (req, res, next) => {
    console.log("ARRANCA DE NUEVO ===========> ")
    // asum not insert into DB PostgreSQL and MongoDB
    let lbInsertOKinPostgre = false
    let lbInsertOKinMongo = false
    //"firstName": "Roberto Siete",
    //"lastName": "García",
    //"email": "robero8gmail.com",
    //"password": "pass12345"
    const userBody = req.body;

    try {
        //Validation of fields of Post
        const messageValid = await MessageNotPassValidationRegister(userBody)
        console.log ("mensaje devuelvo x validation:",  messageValid)
        if (messageValid) {
            res.status(400).json({ message: messageValid})
            return
        }

        // Si llego acá: --> Hashe Password y Guardo ---------
        const hash = await bcrypt.hash(userBody.password, 10);
        
        //1º Guardo en Prisma Heroku PostgreSQL (Redundancy Model) ----
        let newUser = new User(
            userBody.email,
            userBody.lastName + ", " + userBody.firstName,
            hash,
            "USER", 
        );
        try {
            // Salvando la nueva entidad in -> Heroku.PostgreSQL
            newUser2 = await newUser.save();
            // res.send(newUser2);  // lo comento para que siga creando en Mongo
            console.log ("Si llego acá:--> grabo bien en DB.Heroku.PostgreSQL")
            lbInsertOKinPostgre = true
        } catch (error) {
            console.log("entro al Catch del Controllers.auth.registerUser().InsertPostgreSQL")
            // res.statusCode = 500;
            // res.send(err);
            res.status(500).json({ message: error.message + ". Error en Insert de Heroku.PostgreSQL --> aborta Inserts" });
            return; //..para que no siga con lo de abajo
        }
        //Fin 1ºGuardo en Prisma Heroku PostgreSQL -------

        //2º Guardo en MongoDB Entidad Login (Principal) 
        newUser = {
            firstName: userBody.firstName,
            lastName: userBody.lastName,
            email: userBody.email,
            password: hash,
            role: "USER",
        };
        // creo el usuario en las 2 bases
        await userMongo.createUser(newUser);
        res.json("Created user OK en Heroku.PostgreSQL and in Atlas.MongoDB. User email:" + userBody.email + "." )

        console.log("Si llegó acá: -->  Grabó bien en las 2 DB")
        lbInsertOKinMongo = true

    } catch (error) {
        console.log("entro al Catch del Controllers.auth.registerUser.DelInsertDelMongo()")
        res.status(500).json({ message: error.message + ". Proced with RollBack LAST INSERT into Heroku.PostgreSQL.User" });
        //Si se insertó bien en Heroku y no en Atlas
        // console.log("despues del msj erro de que no mongueó" +  lbInsertOKinPostgre + " " + lbInsertOKinMongo )
        if (lbInsertOKinPostgre && !lbInsertOKinMongo) {
            //Borro en Heroku.PostgreSQL
            console.log("Entro al if del Rollback manual.")
            User.deleteByEmail(userBody.email)
            console.log("RollBackeo y Borro el usuario de Heroku.PostgreSQL.Users")
        }
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
const thereIsFirstName = (firstName) => {
    return firstName;
};
const thereIsEmail = (email) => {
    return email;
};
const thereIsPassword = (password) => {
  return password;
};

const validLengthPassword = (password) => {
    console.log(password.length)
    return  !(password.length < 8) 
};

//Busca el Usuario 1ero en Mongo y luego en PostgreSQL para obtener el user.id para tenerlo para todas las consultas
const searchUserByEmail = async (email) => {
try{
    console.log ("Va a ir a buscar a Mongo 1ero")
    const user1 = await userMongo.findUserByEmail(email)
    
    //Falta buscar en Mongo, deberia buscar en Atlas.Mongo 
    // Si falla deberia ir al Servicio Redundante de Loguin que Heroku ==> armar try cacth
    if (user1) {
        console.log ("Encontró por Mongo");
        
       
        // Va buscar el Id de Usuario al PostgreSQL.User.id para tenerlo en todas las consultas.
        //Busco en Heroku.PostgreSQL
        const user2 = await User.findByEmail(email);
        const idUserPostgreSQL = user2.id
        return { user: user1, porMongo: true, IdUserPostgre: idUserPostgreSQL};
        
    } else{
        //Si esta caido mongo busco en Herou
        //Busco en Heroku.PostgreSQL
        console.log ("Va a ir a buscar a Heroku 2do")
        const userPostg = await User.findByEmail(email);
        console.log("User.id PostgreSQL: " + userPostg.id)
        const idUserPostgreSQL2 = userPostg.id
        if (userPostg) {
            console.log ("Encontró por PostgreSQL");
            return { user: user2, porMongo: false, IdUserPostgre: idUserPostgreSQL2 };
        }
    }
} catch {
    //Si esta caido mongo busco en Herou
    //Busco en Heroku.PostgreSQL
    console.log("Del catch de searchUserByEmail")
    const userPostg2 = await User.findByEmail(email);
    const idUserPostgreSQL22 = userPostg2.id
    if (user2) {
        return { user: user2, porMongo: false, IdUserPostgre: idUserPostgreSQL22};
    }
}
    return {user: null , porMongo: null, };
};


const MessageNotPassValidationRegister = async (userBody) => {
    //return Message of Error of validacion
    //If pass validation --> return null 
    
    if (!userBody.firstName) {
        return "First Name can't be empty."
    };
    if (!userBody.lastName) {
        return "Last Name can't be empty.";
    };
    if (!userBody.email) {
        return "Email can't be empty.";
    };
    if (!thereIsPassword(userBody.password)) {
        return "Password can't be empty.";
    };
    if (!validLengthPassword(userBody.password)) {
        return "Password must have at least 8 caracters."
        ;
    };
    const { user, porMongo } = await searchUserByEmail(userBody.email);
    console.log("Loguin: -> Usuario encontrado: ",   user,  " porMongo = ", porMongo );
    if  (user) {
        console.log ("Email repido cheeeee")
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

