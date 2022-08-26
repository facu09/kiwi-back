const jwt = require("jsonwebtoken");

//midleware DE Authorization 


//Autoriza y deja avanzar solo a los User with role ADMIN.
const authorizationForAdmin = async ( req, res, next) => {
    // me fijo si se autoriza o no
    console.log (req.headers.authorization)
    if (!req.headers.authorization) {
        // res.send(401, "User not authenticated, must provide a token") --deprecated
        // res.status(401).send("User not authenticated, must provide a token.");
        res.status(401).json({ message: "User not authenticated, must provide a token." });
        
        return;
    }
    const token = req.headers.authorization.split(" ")[1]
    console.log (token)
    try{
    
        //ahora valido el token
        const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        console.log("token recuperado en verify", data)
        if (data.role !== "ADMIN") {
            //No deja pasar ni avanzar sino es ADMIN
            res.status(403).json({ message: "Not authorized: must be 'ADMIN'" });
            return;
        }
        // si es ADMIN
        // agrego al req. un objeto user para que quede y pueda ser usado en las consultas y controllers y o models para filtrar en la consulta o lo que sea
        //   VC: en token ya esta el idUser de PostgreSQL que es el que necesito para las consultas y alta de gastos
        req.user = {
            userId: data.id,
            email: data.email,
            role: data.role,
            domicilio: data.domicilio,
            mobbile: data.mobbile,
        };
        console.log("Pasó la autorizacion for Admin: ==> el token es de ADMIN User role")
        return next(); // autoriza

    } catch (error) {
        res.status(403).json({ message: "Error while validation token", error: error });
        return;
    }
};

//Autoriza a todos los usuario que aporte toquen valido y verificado: Deja avanzar y suma al objeto req un objeto user: de no tener Token valido no deja avanzar
//  con los datos del usuario:  id, email, role.
const authorizationForAllUser = async ( req, res, next) => {
    // me fijo si se autoriza o no
    console.log (req.headers.authorization)
    //Sino viene con el Authorization = "Bearer Token "" 
    if (!req.headers.authorization) {
        // res.send(401, "User not authenticated, must provide a token.");
        // res.status(401).send("User not authenticated, must provide a token.")
        res.status(401).json({ message: "User not authenticated, must provide a token." });
        return;
    }
    const token = req.headers.authorization.split(" ")[1]
    console.log (token)
    try{
        //ahora valido el token
        const data = await jwt.verify(token,  process.env.ACCESS_TOKEN_SECRET_KEY);
        console.log("token recuperado en verify:", data)
        if (data.role !== "ADMIN" && data.role !== "USER" && data.role !== "CADETE") {
            //No deja pasar ni avanzar sino es ADMIN
            console.log ("Not authorized: must be 'ADMIN' or 'USER'")
            res.status(403).json({ message: "Not authorized: must be 'ADMIN' or 'USER'" });
            return;
        }
        // si es ADMIN o USER o CADETE
        //     -> agrego al req. un objeto user para que quede y pueda filtrar en la consulta y demas contollers como gastos
        req.user = {
            userId: data.id,
            email: data.email,
            role: data.role,
            domicilio: data.domicilio,
            mobbile: data.mobbile,
        };
        console.log("Pasó la autorizacion for All User (USER or ADMIN) ==> el token es de rol ADMIN or USER, sus datos viajan ahora en req.user: email: ", req.user.email, " userId:", req.user.userId, " userRole: ", req.user.role )
        return next() // autoriza

    } catch (error) {
        res.status(403).json({ message: "Error while validation token", error: error });
        return;
    }
};

//Autoriza y deja avanzar solo a los User with role ADMIN.
const authorizationForCadeteOrAdmin = async ( req, res, next) => {
    // me fijo si se autoriza o no
    console.log (req.headers.authorization)
    if (!req.headers.authorization) {
        // res.send(401, "User not authenticated, must provide a token") --deprecated
        // res.status(401).send("User not authenticated, must provide a token.");
        res.status(401).json({ message: "User not authenticated, must provide a token." });
        
        return;
    }
    const token = req.headers.authorization.split(" ")[1]
    console.log (token)
    try{
    
        //ahora valido el token
        const data = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
        console.log("token recuperado en verify", data)
        if (data.role !== "ADMIN" && data.role !== "CADETE") {
            //No deja pasar ni avanzar sino es ADMIN
            res.status(403).json({ message: "Not authorized: must be 'ADMIN' or 'CADETE'" });
            return;
        }
        // si es ADMIN o CADETE
        // agrego al req. un objeto user para que quede y pueda ser usado en las consultas y controllers y o models para filtrar en la consulta o lo que sea
        //   VC: en token ya esta el idUser de PostgreSQL que es el que necesito para las consultas y alta de gastos
        req.user = {
            userId: data.id,
            email: data.email,
            role: data.role,
            domicilio: data.domicilio,
            mobbile: data.mobbile,
        };
        console.log("Pasó la autorizacion for Admin OR Cadete: ==> el token es de User role:  " , req.user.role)
        return next(); // autoriza

    } catch (error) {
        res.status(403).json({ message: "Error while validation token", error: error });
        return;
    }
};

module.exports = { authorizationForAdmin, authorizationForAllUser, authorizationForCadeteOrAdmin };