require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sql, getConnection } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

//Consulta #1 - Trae toda la información de la tabla "Usuario"
app.get("/api/usuarios", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Usuario");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

//Consulta #2 - Verifica si existe un usuario.
app.post("/api/login", async (req, res) => {
  const { nombreUsuario, contraseña } = req.body;

  try {
    const pool = await getConnection();

    const resultBlock = await pool
      .request()
      .query(`SELECT Estado FROM Usuario WHERE NombreUsuario = '${nombreUsuario}'`);

    const resultadoEstado = resultBlock.recordset[0];
    if (resultadoEstado && resultadoEstado.Estado === 'Bloqueado') {
      return res.json({ message: "Bloqueado" });
    }

    const result = await pool
      .request()
      .query(`SELECT * FROM Usuario WHERE NombreUsuario = '${nombreUsuario}' AND Contraseña = '${contraseña}'`);

    const user = result.recordset[0];
    if (user) {
      res.json({ success: true, message: "Inicio de sesión exitoso" });
    } else {
      res.json({ success: false, message: "Credenciales incorrectas" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});


//Consulta #3 - Obtener los DATOS de un usuario
app.get("/api/ObtenerDatos", async (req, res) => {
  const { nombreUsuario } = req.query
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .query("SELECT * FROM Usuario WHERE NombreUsuario = @nombreUsuario");

    if (result.recordset.length === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send("Error al obtener el usuario");
  }
});

//Consulta #4 - Actualizar el estado de la bitácora
app.put("/api/ActualizarBitacora", async (req, res) => {
  const { id, fecha, hora, evento } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, id)
      .input("hora", sql.VarChar, hora)
      .input("fecha", sql.VarChar, fecha)
      .input("evento", sql.VarChar, evento)
      .query("UPDATE Bitacora SET Evento = @evento, Fecha = @fecha, Hora = @hora WHERE IDUsuario = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    if (evento === "Bloqueado") {
      const usuarioResult = await pool.request()
        .input("id", sql.Int, id)
        .query("UPDATE Usuario SET Estado = 'Bloqueado' WHERE IDUsuario = @id");

      if (usuarioResult.rowsAffected[0] === 0) {
        return res.status(404).send("Usuario no encontrado en Usuario");
      }
    }

    res.status(200).send("Bitácora actualizada exitosamente");
  } catch (error) {
    res.status(500).send("Error al actualizar la bitácora");
  }
});

//CRUD del Administrador
//Consulta #5 - Añadir un usuario a la base de datos

app.post("/api/InsertarUsuario", async (req, res) => {
  const { nombreUsuario, nombre, contraseña, correo, rol, estado } = req.body;

  if (!nombreUsuario || !nombre || !contraseña || !correo || !rol || !estado) {
    return res.status(400).send("Todos los campos son requeridos.");
  }

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input('nombreUsuario', nombreUsuario)
      .input('nombre', nombre)
      .input('contraseña', contraseña)
      .input('correo', correo)
      .input('rol', rol)
      .input('estado', estado)
      .query('INSERT INTO Usuario (NombreUsuario, Nombre, Contraseña, Correo, Rol, Estado) VALUES (@nombreUsuario, @nombre, @contraseña, @correo, @rol, @estado)');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("No fue posible ingresar al usuario");
    }
    //Obtener ID para crear un registro en la bitacora.
    const getID = await pool
      .request()
      .input('nombreUsuario', nombreUsuario)
      .query('SELECT IDUsuario FROM Usuario WHERE NombreUsuario = @nombreUsuario')

    const resultadoID = getID.recordset[0];
    //Insertamos los datos en la bitacora con la id anteriormente obtenida.
    const InsertBitacora = await pool
      .request()
      .input('idUsuario', resultadoID.IDUsuario)
      .query('INSERT INTO Bitacora (IDUsuario) VALUES (@idUsuario)')

    if (InsertBitacora.rowsAffected[0] === 0) {
      return res.status(500).send("No fue posible ingresar los datos de la bitacora");
    }

    res.status(200).send("Usuario añadido exitosamente");
  } catch (error) {
    console.error("Error al insertar usuario:", error.message);
    return res.status(500).json({ message: "Error al ingresar al usuario" });
  }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT} 🗿`));