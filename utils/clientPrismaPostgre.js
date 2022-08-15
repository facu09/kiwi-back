//esto estaba asi del repo de Salva
// const Prisma = require("./prisma");
// const prisma = new Prisma();
// module.exports = prisma;


//Del repo de Roberto Baca (https://github.com/roberbaca/ExpensesApp/blob/main/utils/clientPrismaPosgre.js)

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = prisma;