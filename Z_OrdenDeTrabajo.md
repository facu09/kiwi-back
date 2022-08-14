MVP BackEnd:
.1. Definir modelo de datos (sechema.prisma) cuales entidades y cómo se relacionan
.2. Crear infra (cuentaheoku, aplicación en heroku, crear db en heroku  db shadow en heroku)
      Desde heroku client:
1 comando, crea la app en heroku (lo hice por interfaz grafica)
2do comando, crea la db (manual/)
3ro para correr la migracion de prisma, prisma se crea como una base temporal , se denfine 
	en el .env la database_shadow	

.2.1. conectar al app a las DB MOIFICAND el .env
.3. Correr migraciones (npex prisma migrate dev --name nombremigracion)
.4. crear conexion a prisma (ver como hacemo el new PrismaCliete())
.5. Hacer los models para el guardado de datos para usar la DB

MVP: ahi tenemos nuestro MVP andando en nuestra maquina local y usando la db de heroku
--------------------------------------------------------------------------------------
Crear API:
.6. Instalar expess y crear app de express
.7. armar las rutas que reemplazan los comandos por pantalla.
	Para impactarle con Postman
.8. crear los controllers para cada comando/ruta
	llamamos las funciones que usamos en el paso 5
.9. Armar las cosultas en /models/consultas.js
. --> App Version 1 con API
--------------------------------------------------------------------------------------
10. Subir la App a Heroku y que quede corriendo
11. Exportar Coleccion de Postman y probarlo
. Fin
--------------------------------------------------------------------------------------