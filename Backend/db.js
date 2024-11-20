const sql = require("mssql");

//String de conexion
//Llama variables de entorno para obtener los datos necesarios
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function getConnection() {
  try {
    return await sql.connect(dbConfig);
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    throw error;
  }
}

module.exports = { sql, getConnection };
