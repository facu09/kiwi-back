const express = require("express");
const cnsController = require("../controllers/consultas");
const router = express.Router();

// Establecido por defecto x el app.js:  
//  const usersRouter = require("./routes/gastos") 


//api/consultas
router.get("/allGastos", cnsController.getAllGastos);

router.get("/allGastosOrderAscImporte", cnsController.getAllGastosOrderAscByImpote);

router.get("/allGastosOrderAscFecha", cnsController.getAllGastosOrderAscByFecha);

router.get("/promedioDeAllGastos", cnsController.getPromedioDeAllGastos);

router.get("/sumaDeAllGastos", cnsController.getSumaDeAllGastos);

router.get("/sumaDeGastosPorUsuario", cnsController.getSumaDeGastosPorUsuario);

router.get("/sumaDeGastosPorTipoGasto", cnsController.getSumaDeGastosPorTipoGasto);

router.get("/sumaDeGastosPorTipoGastoSql", cnsController.sumaDeGastosPorTipoGastoSql
);

router.get("/mayorDeAllGastos", cnsController.getMayorDeAllGastos);

router.get("/menorDeAllGastos", cnsController.getMenorDeAllGastos);



// otras rutas ..


module.exports = router;