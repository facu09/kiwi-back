# kiwi-back:
Planificación iNTEGRADOR FINAL FINAL
1. Armar App en Heroku KiwiCarriBackEnd
	. Armar DB PostgreSQL (tProductos, tUsuarios, tUsuarioCarrito, )
		DB Access que migra tProductos → a → Heroku.PostreSql.tProductos
		tProductosRubros, tGustos, tViajes (para el traking y hora estimada de arribo) 
	. Armar ODBC para conectar a DB nueva Access _bs (que luego se vinculará a 
		FrontEnd MrSkot.v743)
2. Armar Repo en GitHub  Backend KiwiCarri
    2.1. Armar API Res: 
	2.1.1. Armar Rutas Necesarias (simil BackEnd Juli)
     . Alta de Usuarios (email, psw, domicilio, celular )
 	     . Login Usuario (Token + Refresh Token)
	     . Consulta de Gustos (no se para que, me para que no opcional)
	     . Consulta de Productos 
	     . Alta Producto a Carrito {idProctuo, {gustos, , }, idProdcuto, {gustos, , },  }
	     . Finalizar Compra (Cierre Carrito), Estimación de Tiempo de Envio.
	     . Alta de Viaje {IdViaje, HoraInicioDespacho, CantidadPedidosViaje, EstimacionArriba}
	
	     Opcionales:
		. Alta, Modificación, Baja de  Productos
		. Alta, Modificación, Baja de Gusto
    2.2 Armar un Postman para manejar y probar todas las rutas y el API Res

3. Armar Repo Nuevo para FrontEnd Versión con BackEnd Propio
	. modificar los Axios del FrontAnterior  para que apunten a las rutas nuevas de mi 
	Backend
4. Subir a Heroku → Backend
5. Subir a Vercel→ FrontEndNew
