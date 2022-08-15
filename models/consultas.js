const prisma = require("../utils/client");
const pool = require("../utils/clientPostgreSQL")


const { v4: uuidv4 } = require("uuid");

const getAllGastos = async (psEmail) => {
    try {
        //-->  con prisma --> andando ok PERO sin filtro por mail
        // const allGastos = await prisma.Gastos.findMany()
        // return allGastos

        //con SQL DIRECTO  FALTA VER COMO SE ARMA LA CONEXION
        const resultados = await pool.query('SELECT * FROM Public."Gastos" as G ');
        // const resultados = await pool.query('SELECT Public."Gastos".id FROM Public."Gastos" ');
        // const resultados = await pool.query('SELECT GT.id,  GT.*  FROM Public."Gastos" as GT ');

        lsWhere = '';
        console.log("Del getAllGastos", psEmail);
        if (psEmail) {
            console.log("Del getAllGastos. if --> ", psEmail)
            lsWhere = ' WHERE U."email" = ' + "'" + psEmail + "'" 
            
            const resultados = await pool.query('SELECT ' + 
                    ' GT."id", U."email", GT."importe",  GT."tipoGastoId", ' +
                    ' Tipo."nomTipoGasto",  ' + 
                    ' GT."fechaGasto", GT."userId" ' + 
                ' FROM "Gastos" AS GT ' + 
                ' JOIN "User" AS  U ON GT."userId" = U."id" ' +
                ' JOIN "TipoGasto" AS Tipo ON GT."tipoGastoId" = Tipo."id" ' +
                lsWhere + 
                ' ORDER BY gt."fechaGasto" ' );
        
            // console.log( resultados.rows);
            return resultados.rows
        }else {
            //-->  con prisma --> andando ok PERO sin filtro por mail
            const allGastos = await prisma.Gastos.findMany()
            return allGastos
        }


    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getAllGastosOrderAscByImpote = async () => {
    try {
        const allGastos = await prisma.Gastos.findMany({
            orderBy: {
                importe: "asc"
            }
        })
        return allGastos
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getAllGastosOrderAscByFecha= async () => {
    try {
        const allGastos = await prisma.Gastos.findMany({
            orderBy: {
                fechaGasto: "asc"
              }
        })
        return allGastos
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getPromedioDeAllGastos = async () => {
    try {
        const aggregations = await prisma.Gastos.aggregate({
            _avg: {
              importe: true,
            },
        })
        lsTotConFormato = Intl.NumberFormat('en-EN', { style: 'currency', currency: 'ARG' }).format(aggregations._avg.importe)
        console.log('Average age:' + lsTotConFormato)
        return {"El Gasto Promedio del período es: ": lsTotConFormato}
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getSumaDeAllGastos = async () => {
    try {
        const aggregations = await prisma.Gastos.aggregate({
            _sum: {
              importe: true,
            },
        })
        console.log('Suma de Gastos: ' + aggregations._sum.importe)
        // const liSumTotGastos= parseInt(aggregations._sum.importe);
        lsTotConFormato = Intl.NumberFormat('en-EN', { style: 'currency', currency: 'ARG' }).format(aggregations._sum.importe)
        console.log('Suma de Gastos: ' + lsTotConFormato)
        return {"La Sumar Total de Gastos del período es: ":    lsTotConFormato}
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getSumaDeGastosPorUsuario = async () => {
    try {
        const fd = await prisma.Gastos.groupBy({
            by: ['userId'],
            _sum: {
              importe: true,
            },
        })
        console.log(fd)
        return {"Suma de Gastos del Período por Usuario: ": fd  }

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getSumaDeGastosPorTipoGasto = async () => {
    try {
        const fd = await prisma.Gastos.groupBy({
            by: ['tipoGastoId'],
            _sum: {
              importe: true,
            },
        })
        console.log(fd)
        return {"Suma de Gastos del Período por Tipo de Gasto: ": fd  }
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getSumaDeGastosPorTipoGastoSql = async () => {
    try {

        //DERECHO CON SQL
        //Pruebas de acercamiento que funcionan:
        // const resultados = await pool.query('SELECT * FROM Public."Gastos" as G ');
        // const resultados = await pool.query('SELECT G.id  FROM Public."Gastos" as G ');
        // const resultados = await pool.query('SELECT Public."Gastos".id FROM Public."Gastos" ');
        // const resultados = await pool.query('SELECT GT.id,  GT.*  FROM Public."Gastos" as GT ');
        
        //Finalmente tiro sql necesario
        const resultados = await pool.query(
            'SELECT max(TG."id") AS IdTipoGasto, max(TG."nomTipoGasto") AS TipoGasto, Sum(G."importe") AS SumOfimporte ' +
            'FROM Public."Gastos" AS G,  Public."TipoGasto" AS TG ' +
            'WHERE G."tipoGastoId" = TG."id" ' +
            'GROUP BY G."tipoGastoId", TG."id" ' +
            'ORDER BY TG."id" ')

         // console.log( resultados.rows);
        return resultados.rows
    
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}


const getMayorDeAllGastos = async () => {
    try {
        const aggregations = await prisma.Gastos.aggregate({
            _max: {
              importe: true,
            },
        })

        lsTotConFormato = Intl.NumberFormat('en-EN', { style: 'currency', currency: 'ARG' }).format(aggregations._max.importe)
        console.log('El Mayor Gastos: ' + lsTotConFormato)
        return {"El Mayor de los Gastos del período es: ": lsTotConFormato}
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}

const getMenorDeAllGastos = async () => {
    try {
        const aggregations = await prisma.Gastos.aggregate({
            _min: {
              importe: true,
            },
           
        })
        lsTotConFormato = Intl.NumberFormat('en-EN', { style: 'currency', currency: 'ARG' }).format(aggregations._min.importe)
        console.log('El Menor de los Gastos del Período: ' +lsTotConFormato)
        return {"El Menor de los Gastos del período es: ": lsTotConFormato}
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }   
}



module.exports = {
    getAllGastos,
    getAllGastosOrderAscByImpote,
    getAllGastosOrderAscByFecha,
    getPromedioDeAllGastos,
    getSumaDeAllGastos,
    getSumaDeGastosPorUsuario,
    getSumaDeGastosPorTipoGasto,
    getSumaDeGastosPorTipoGastoSql,
    getMayorDeAllGastos,
    getMenorDeAllGastos,
}