// //Controlador Users - Independiente de con que DB esté hecho
// const Cns = require("../models/consulta");  // este es el que impacta y conoce la DB
// const User = require("../models/user"); // para buscar si existe el email para algunas consultas

// //El role ADMIN puede consultar todos los gastos de todo o puedo consultar un usuario por req.query.email.
// //El role USER solo puede consutlar sus gastos, y se desestima el req.query.email
// const getAllGastos = async (req, res, next) => {
//     console.log ("Del consultas.controllers, y el req.query.email: ", req.query.email)
//     //Si es el ADMIN consultando los gastos de 1 usuario
//     if (req.query.email && req.user.role === "ADMIN" ) {
//         if (await userDosentExist(req.query.email)) { 
//             res.statusCode = 400;
//             res.send("User with this eamil dosen't exist.");
//             return;
//         // Si el mail existe    
//         } else {
//             //Es el ADMIN que quiere consutlar los gastos de un usuario, le paso parametro del mail para que filtre por ese email 
//             const gastosDelUs = await Cns.getAllGastos(req.user, req.query.email);
//             res.send(gastosDelUs)
//         }
//     //sino tiene mail como parametro req.query --> trae todos los gastos s/ el role del token
//     } else{
//         //Aca puede ser el ADMIN o un USER
//         //Si es role ADMIN: -> Tree todos los gastos de todos lo usars.
//         //Si es role USER: -> Trae solo los gastos de ese usuario.
//         const allGastos = await Cns.getAllGastos(req.user);
//         res.send(allGastos)
//     }
// }
    
// const getAllGastosOrderAscByImpote = async (req, res, next) => {
//     const allGastosOrdered = await Cns.getAllGastosOrderAscByImpote(req.user);
   
//     res.send(allGastosOrdered)
// }

// const getAllGastosOrderAscByFecha = async (req, res, next) => {
//     const allGastosOrdered = await Cns.getAllGastosOrderAscByFecha(req.user);
   
//     res.send(allGastosOrdered)
// }
// const getPromedioDeAllGastos = async (req, res, next) => {
//     const PromedioOfAll = await Cns.getPromedioDeAllGastos(req.user);
//     res.status(200).send(PromedioOfAll)
// }
// const getSumaDeAllGastos = async (req, res, next) => {
//     const SumaGastos = await Cns.getSumaDeAllGastos(req.user);
//     res.status(200).send(SumaGastos)
// }
// const getSumaDeGastosPorUsuario = async (req, res, next) => {
//     const SumaGastosProUs = await Cns.getSumaDeGastosPorUsuario(req.user);
//     res.status(200).send(SumaGastosProUs)
// }
// const getSumaDeGastosPorTipoGasto = async (req, res, next) => {
//     const SumaGastosProT = await Cns.getSumaDeGastosPorTipoGasto(req.user);
//     res.status(200).send(SumaGastosProT)
// }
// const sumaDeGastosPorTipoGastoSql = async (req, res, next) => {
//     const SumaGastosProT = await Cns.getSumaDeGastosPorTipoGastoSql(req.user);
//     res.status(200).send(SumaGastosProT)
// }


// const getMayorDeAllGastos = async (req, res, next) => {
//     const mayorOfAll = await Cns.getMayorDeAllGastos(req.user);
//     res.send(mayorOfAll)
// }
// const getMenorDeAllGastos = async (req, res, next) => {
//     const menorOfAll = await Cns.getMenorDeAllGastos(req.user);
//     res.send(menorOfAll)
// }



// // Validaciones ----------------------------------------
// const idTipoGastoExists = async (id) => {
//     const tipoGastoById = await TipoGasto.findById(id);
//     console.log ("Encontrado  tipo gasto", tipoGastoById)
//     if (tipoGastoById) {
//         console.log ("Sale por true")
//         return true
//     }else {
//         console.log ("Sale por false")
//         return false
//     } 
// }
// const userAlreadyExists = async (idUser) => {
//     const userFinded = await User.findByIdUser(idUser);
//     console.log("user encontrado idUser:", userFinded)
//     if (userFinded) {
//         console.log("Sale x encontrado idUser: true")
//         return true
//     }else {
//         console.log("Sale x encontrado idUser: false")
//         return false
//     }
// };
// const nomGastoIsValid = (nomGasto) => {
//     return nomGasto !== "";
// };
// const importeIsValid = (importe) => {
//     return( importe && importe>0)
// }
// const IdTipoGastoNotValid = async (idTipoGasto) => {
//     const lbExisteTipoGasto = await idTipoGastoExists(idTipoGasto)
//     console.log ("Saleeeee por ----> " + ( !idTipoGasto || !lbExisteTipoGasto) )
//     // console.log ("lbExisteTipoGasto: __>" + ( lbExisteTipoGasto) )
//     return( !idTipoGasto || !lbExisteTipoGasto )
// }
// const IdUserIsValid = async (idUser) => {
//     return( idUser && (await userAlreadyExists(idUser)))
// }


// // Validaciones
// const userDosentExist = async (email) => {
//     console.log ("---> Entro al userDosentExist")
//     const userByEmail = await User.findByEmail(email);
//     console.log(userByEmail) ;
//     if (userByEmail) {
//         return false
//     }else {
//         return true
//     } 
// }


// module.exports = {
//     getAllGastos,
//     getAllGastosOrderAscByImpote,
//     getAllGastosOrderAscByFecha,
//     getPromedioDeAllGastos,
//     getSumaDeAllGastos,
//     getSumaDeGastosPorUsuario,
//     getSumaDeGastosPorTipoGasto,
//     sumaDeGastosPorTipoGastoSql,
//     getMayorDeAllGastos,
//     getMenorDeAllGastos,
// }