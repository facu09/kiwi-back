// No voy a estar usando Mongo por ahora. comento
// const mongodb = require("mongodb");

// const MongoClient = mongodb.MongoClient;

// let db;

// const connectMongoDB = async () => {
//     try{
//         //conectamos a la DB
//         const connection = await MongoClient.connect(process.env.MONGO_URL);
//         db = connection.db("GastosAuth") //Sino Existe la va a crear cuando cree la 1er colección
//         console.log ("Conecto a la Mongo DB 'GatosAuth' --> ok: ")
//     } catch (error){
//         throw new Error("Error conecting to Mongo DB: " + error);
//     }
// }

// const getDb = () => {
//     if (db) {
//         return db;
//     }
//     throw new Error ("MongoDB not initialized")
// };

// module.exports = { connectMongoDB , getDb} 
