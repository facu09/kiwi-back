const { Pool } = require("pg")

// Coloca aquí tus credenciales
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASS,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});


module.exports = pool;