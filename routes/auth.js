const express = require("express");
const AuthController = require("../controllers/auth");
const router = express.Router();

//  /api/auth  --> registra usuario en MongoDB + Posgre (hashea password)
router.post("/register", AuthController.registerUser);

//  /api/auth --> verifica password hasheada + Devuevle Token
router.post("/login", AuthController.loginUser);

//  /api/auth --> tira logout
router.post("/logout", AuthController.logoutUser);

module.exports = router;
