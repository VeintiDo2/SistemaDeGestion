require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sql, getConnection } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

//Consulta #1 - Traer toda la información de la tabla "Usuario"
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
//Todo esto es código espagueti...
app.post("/api/login", async (req, res) => {
  const { nombreUsuario, contraseña } = req.body;

  try {
    const pool = await getConnection();

    // Verificar si el usuario existe
    const resultUsuario = await pool
      .request()
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .query(`SELECT * FROM Usuario WHERE NombreUsuario = @nombreUsuario`);

    const usuario = resultUsuario.recordset[0];

    if (!usuario) {
      return res.json({
        success: false,
        message: "El usuario no existe en el sistema",
      });
    }

    if (usuario.Estado === "Bloqueado") {
      return res.json({ success: false, message: "Bloqueado" });
    }

    const resultLogin = await pool
      .request()
      .input("nombreUsuario", sql.VarChar, nombreUsuario)
      .input("contraseña", sql.VarChar, contraseña)
      .query(
        `SELECT * FROM Usuario WHERE NombreUsuario = @nombreUsuario AND Contraseña = @contraseña`
      );

    const user = resultLogin.recordset[0];

    if (user) {
      return res.json({ success: true, message: "Inicio de sesión exitoso" });
    } else {
      return res.json({ success: false, message: "Credenciales incorrectas" });
    }
  } catch (error) {
    console.error("Error en el servidor:", error.message);
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

//Consulta #6 - Actualizar un usuario
app.put("/api/ActualizarUsuario", async (req, res) => {
  const { IDUsuario, NombreUsuario, Nombre, Contraseña, Correo, Rol, Estado } = req.body;

  if (!NombreUsuario || !Nombre || !Contraseña || !Correo || !Rol || !Estado) {
    return res.status(400).send("Todos los campos son requeridos.");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("id", sql.Int, IDUsuario)
      .input('nombreUsuario', sql.VarChar, NombreUsuario)
      .input('nombre', sql.VarChar, Nombre)
      .input('contraseña', sql.VarChar, Contraseña)
      .input('correo', sql.VarChar, Correo)
      .input('rol', sql.VarChar, Rol)
      .input('estado', sql.VarChar, Estado)
      .query("UPDATE Usuario SET NombreUsuario = @nombreUsuario, Nombre = @nombre, Contraseña = @contraseña, Correo = @correo, Rol = @rol, Estado = @estado WHERE IDUsuario = @id");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    res.status(200).send("Usuario actualizada exitosamente");
  } catch (error) {
    res.status(500).send("Error al actualizar el usuario");
  }
});

//Consulta #7 - Eliminar usuario
app.delete("/api/EliminarUsuario", async (req, res) => {
  const { ID } = req.query;
  try {
    const pool = await getConnection();
    const resultBitacora = await pool.request()
      .input("id", sql.Int, ID)
      .query("DELETE FROM Bitacora WHERE IDUsuario = @id")
    if (resultBitacora.rowsAffected[0] === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    const result = await pool.request()
      .input("id", sql.Int, ID)
      .query("DELETE FROM Usuario WHERE IDUsuario = @id");
    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Usuario no encontrado");
    }

    res.status(200).send("Usuario eliminado exitosamente");
  } catch (error) {
    res.status(500).send("Error al eliminar el usuario");
  }
});
//Fin CRUD

//Consulta #8 - Obtener la bitacora con los nombres de los usuarios.
app.get("/api/Bitacora", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT U.IDUsuario, NombreUsuario, Nombre, Rol, IDBitacora, FORMAT(Fecha, 'dd/MM/yyyy') AS Fecha, CONVERT(VARCHAR(8), Hora, 108) AS Hora, Evento FROM Usuario AS U INNER JOIN Bitacora as B	ON U.IDUsuario = B.IDUsuario");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

//Consulta #9 - Obtener los proveedores
app.get("/api/Proveedores", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM Proveedores");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

//Consulta #10 - Obtener los productos
app.get("/api/Productos", async (req, res) => {
  const { idProveedor } = req.query;
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, idProveedor)
      .query("SELECT IDProducto, NombreProducto, Precio FROM Producto WHERE IDProveedor = @id");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

//Consulta #11 - Insertar datos en Pedidos y DetallesPedidos
app.post("/api/Pedido", async (req, res) => {
  const { IDProveedor, IDProducto, Precio, Cantidad, FechaPedido, SubTotal, NombreProducto } = req.body;

  //Prueba de transacciones
  try {

    const pool = await getConnection();

    const transaction = new sql.Transaction(pool);

    await transaction.begin(); // Inicia la transacción

    //operacion dentro de una transacción
    const result = await transaction
      .request()
      .input("idProveedor", sql.Int, IDProveedor)
      .input("fechaPedido", sql.VarChar, FechaPedido)
      .query(`
        INSERT INTO Pedidos (IDProveedor, FechaPedido)
        OUTPUT INSERTED.IDPedido
        VALUES (@idProveedor, @fechaPedido)
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("No fue posible ingresar el pedido");
    }

    const IDPedido = result.recordset[0].IDPedido;
    console.log(IDPedido)

    const resultDetallePedido = await transaction
      .request()
      .input("idPedido", sql.Int, IDPedido)
      .input("idInventario", sql.Int, IDProducto)
      .input("cantidad", sql.Int, Cantidad)
      .input("precio", sql.Decimal, Precio)
      .input("subTotal", sql.Decimal, SubTotal)
      .query("INSERT INTO DetallePedido (IDPedido, IDInventario, Cantidad, PrecioUnitario, Subtotal) VALUES (@idPedido, @idInventario, @cantidad, @precio, @subTotal)");

    if (resultDetallePedido.rowsAffected[0] === 0) {
      return res.status(404).send("No fue posible ingresar el detalle del pedido");
    }

    await transaction
      .request()
      .input("idProducto", sql.Int, IDProducto)
      .input("cantidad", sql.Int, Cantidad)
      .query("UPDATE Inventario SET Cantidad = Cantidad + @cantidad WHERE IDProducto = @idProducto");

    // Confirmar la transacción si todo está bien
    await transaction.commit();

  } catch (error) {
    console.error("Error en el servidor:", error.message);

    // Deshacer la transacción si ocurre un error
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT} 🗿`));