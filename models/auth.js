// falta borrar este archivo xque apunta a Mongo DB que no lo uso como metodo secundario de Autenticación
// # A lo sumo lo conservo si quisiera en un futuro tener replicado todo en mongo db, registración usuario y todo el modelo de datos: -> por si no anda heroku podría como metodo de contingencia tener todo replicado en MongoDB y seguiria funcioando todo, tomando pedidos.


// // # Comento todo el codigo hacia abajo 

// /// Maneja todo en MongoDB tanto Registro como Autienticación
// /// En caso de que esté caido Mongo, autenticará en Heroku PostgreSQL

// const getDb = require("../utils/clientMongo").getDb

// const USERS_COLLECTION = "Users";

// const createUser = async (newUser) => {
//   try {
//     const db = getDb();
//     await db.collection(USERS_COLLECTION).insertOne(newUser);
//     return newUser;
//   } catch (error) {
//     throw new Error(error);
//   }
// };

// // falta borrar esto xque apunta a Mongo
// const findUserByEmail = async (email) => {
//     try {
//       const db = getDb();
//       const result = await db
//         .collection(USERS_COLLECTION)
//         .findOne({ email: email });
//       return result;
//     } catch (error) {
//       throw new Error(error);
//     }
//   };
  
//   const deleteUserByEmail = async (email) => {
//     try {
//       const db = getDb();
//       const result = await db
//         .collection(USERS_COLLECTION)
//         .deleteOne({ email: email });
//       return result;
//     } catch (error) {
//       throw new Error(error);
//     }
//   };

//   const updateByEmail = async (email, firstName, lastName, hush, role) => {
//     try {
//       const db = getDb();
//       const updatedUser = await db.collection(USERS_COLLECTION).updateOne(
//         { email : email},
//         { $set: {
//           firstName: firstName,
//           lastName: lastName, 
//           password: hush,
//           role: role,
//         } },
//         { upsert: true}
//       )
//       // console.log (updatedUser)
//       return updatedUser

//     } catch (error) {
//       console.log(error);
//       throw new Error(error);
//       return;
//     }   
//   }


//   module.exports = { createUser, findUserByEmail, deleteUserByEmail, updateByEmail };
  