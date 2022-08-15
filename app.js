require('dotenv').config()  //es para poder usar el Process.env
const express = require("express");
// const connectMongoDB = require("./utils/clientMongo").connectMongoDB;
const bodyParser= require("body-parser");

const usersRouter = require("./routes/users")
const authRouter = require("./routes/auth");
// const gustosRouter = require("./routes/gustos");
// const productosRouter = require("./routes/productos")
// const pedidosRouter = require("./routes/pedidos")
// const consultasRouter = require("./routes/consultas");
// const gastosRouter = require("./routes/gastos");



// const PORT = 3000;
// Para q funque en Heroku
const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

//ataja todas las rutas que arranquen con "api/auth" --> y las tira al /routes/auth.js
app.use("/api/auth", authRouter );

//ataja todas las rutas que arranquen con "api/user" --> y las tira al /routes/users.js
app.use("/api/users", usersRouter);

// //ataja todas las rutas que arranquen con "api/tiposGasto" --> y las tira al /routes/gustos.js
// app.use("/api/gustos", gustosRouter);

// //ataja todas las rutas que arranquen con "api/productos" --> y las tira al /routes/productos.js
// app.use("/api/productos", productosRouter);

// //ataja todas las rutas que arranquen con "api/pedidos" --> y las tira al /routes/pedidos.js
// app.use("/api/pedidos", pedidosRouter);


// //ataja todas las rutas que arranquen con "api/consultas" --> y las tira al /routes/consultas.js
// app.use("/api/consultas", consultasRouter);


const startServer = async () => {
    //#01: para que si ya no voy a usar mongo
    //await connectMongoDB();
    
    //Fialmente Prendo el servidor poniendolo a escuahar el puerto
    app.listen(PORT, () => {
        console.log(`Listening on ${PORT} Bro`);
    });
};

startServer();
