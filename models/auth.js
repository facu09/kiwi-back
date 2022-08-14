/// Maneja todo en MongoDB tanto Registro como Autienticación
/// En caso de que esté caido Mongo, autenticará en Heroku PostgreSQL

const getDb = require("../utils/clientMongo").getDb

const USERS_COLLECTION = "Users";

const createUser = async (newUser) => {
  try {
    const db = getDb();
    await db.collection(USERS_COLLECTION).insertOne(newUser);
    return newUser;
  } catch (error) {
    throw new Error(error);
  }
};

const findUserByEmail = async (email) => {
    try {
      const db = getDb();
      const result = await db
        .collection(USERS_COLLECTION)
        .findOne({ email: email });
      return result;
    } catch (error) {
      throw new Error(error);
    }
  };
  
  const deleteUserByEmail = async (email) => {
    try {
      const db = getDb();
      const result = await db
        .collection(USERS_COLLECTION)
        .deleteOne({ email: email });
      return result;
    } catch (error) {
      throw new Error(error);
    }
  };

  const updateByEmail = async (email, firstName, lastName, hush, role) => {
    try {
      const db = getDb();
      const updatedUser = await db.collection(USERS_COLLECTION).updateOne(
        { email : email},
        { $set: {
          firstName: firstName,
          lastName: lastName, 
          password: hush,
          role: role,
        } },
        { upsert: true}
      )
      // console.log (updatedUser)
      return updatedUser

    } catch (error) {
      console.log(error);
      throw new Error(error);
      return;
    }   
  }


  module.exports = { createUser, findUserByEmail, deleteUserByEmail, updateByEmail };
  