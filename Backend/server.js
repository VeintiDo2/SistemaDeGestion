require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sql, getConnection } = require("./db");

const app = express();
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

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

    //operacion dentro de una transacción
    const result = await pool
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

    const resultDetallePedido = await pool
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

    const resultUpdateInve = await pool
      .request()
      .input("idProducto", sql.Int, IDProducto)
      .input("cantidad", sql.Int, Cantidad)
      .query("UPDATE Inventario SET Cantidad = Cantidad + @cantidad WHERE IDProducto = @idProducto");

    if (resultUpdateInve.rowsAffected[0] === 0) {
      return res.status(404).send("No fue posible ingresar el detalle del pedido");
    }

  } catch (error) {
    console.error("Error en el servidor:", error.message);


    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

//Consulta #12 - Obtener el inventario/Productos
app.get("/api/InventarioProductos", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT P.IDProducto, NombreProducto, Descripcion, Precio, Cantidad FROM Producto AS P INNER JOIN Inventario AS I ON P.IDProducto = I.IDProducto");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

//Consukta #13 - Añadir los detalles de la venta
app.post("/api/Venta", async (req, res) => {
  const { FechaVenta, Total, FormaPago, IVA, TipoCambio, Colones, Dolares, Cantidad, Precio, SubTotal, Tarjeta, Vuelto, NombreProducto, IDProducto } = req.body;

  // console.log(FechaVenta);
  // console.log(Total);
  // console.log(FormaPago);
  // console.log(IVA);
  // console.log(TipoCambio);
  // console.log(Colones);
  // console.log(Dolares);
  // console.log(Cantidad);
  // console.log(Precio);
  // console.log(SubTotal);

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("fechaVenta", sql.VarChar, FechaVenta)
      .input("total", sql.Decimal, Total)
      .input("formaPago", sql.VarChar, FormaPago)
      .input("iva", sql.Decimal, IVA)
      .input("tipoCambio", sql.Decimal, TipoCambio)
      .query("INSERT INTO Ventas (FechaVenta, Total, FormaPago, IVA, TipoCambio) OUTPUT INSERTED.IDVenta VALUES (@fechaVenta, @total, @formaPago, @iva, @tipoCambio)");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("No fue posible ingresar la venta");
    }

    const IDVenta = result.recordset[0].IDVenta;

    const resultDetalleVenta = await pool
      .request()
      .input("idVenta", sql.Int, IDVenta)
      .input("colones", sql.Decimal, Colones)
      .input("dolares", sql.Decimal, Dolares)
      .input("cantidad", sql.Decimal, Cantidad)
      .input("precio", sql.Decimal, Precio)
      .input("subTotal", sql.Decimal, SubTotal)
      .query("INSERT INTO DetalleVenta (IDVenta, Colones, Dolares, Cantidad, PrecioUnitario, SubTotal) VALUES (@idVenta, @colones, @dolares, @cantidad, @precio, @subTotal)");

    if (resultDetalleVenta.rowsAffected[0] === 0) {
      return res.status(404).send("No fue posible ingresar el detalle de la venta");
    }

    const resultFactura = await pool
      .request()
      .input("idVenta", sql.Int, IDVenta)
      .input("tarjeta", sql.Decimal, Tarjeta)
      .input("vuelto", sql.Decimal, Vuelto)
      .input("subTotal", sql.Decimal, SubTotal)
      .input("nombreProducto", sql.VarChar, NombreProducto)
      .input("idProducto", sql.Int, IDProducto)
      .query(`INSERT INTO Factura (IDDetalleVenta, IDProducto, NombreProducto, Colones, Dolares, Tarjeta, Cantidad, SubTotal, Vuelto)
        SELECT 
        dv.IDDetalleVenta,
        @idProducto AS IDProducto,
        @nombreProducto AS NombreProducto,
        dv.Colones AS Colones, 
        dv.Dolares AS Dolares, 
        @tarjeta AS Tarjeta, 
        dv.Cantidad AS Cantidad,
        @subTotal AS SubTotal, 
        @vuelto AS Vuelto 
        FROM DetalleVenta dv
        WHERE dv.IDVenta = @idVenta; `)

    if (resultFactura.rowsAffected[0] === 0) {
      return res.status(404).send("No fue posible ingresar la factura");
    }

    res.status(200).send("Venta Exitosa");
  } catch (error) {
    console.error("Error en el servidor:", error.message);


    res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

//Consulta #14 - Obtener todas las facturas
app.get("/api/ObtenerFacturas", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM Factura");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

//Consulta #15 - Eliminar una factura
app.delete("/api/CobrarFactura", async (req, res) => {
  const { idEliminar } = req.query;

  try {
    const pool = await getConnection();
    const resultBitacora = await pool.request()
      .input("id", sql.Int, idEliminar)
      .query("DELETE FROM Factura WHERE IDFactura = @id")
    if (resultBitacora.rowsAffected[0] === 0) {
      return res.status(404).send("Error al eliminar la factura");
    }

    res.status(200).send("Factura eliminada exitosamente");
  } catch (error) {
    res.status(500).send("Error al eliminar la factura");
  }
});

//Consukta #16 - Actualizar caja
app.put("/api/ActualizarCaja", async (req, res) => {
  const { Colones, Dolares, Vuelto } = req.body;

  console.log("Colones: ", Colones);
  console.log("Dolares: ", Dolares);
  console.log("Vuelto: ", Vuelto);

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("colones", sql.Decimal, parseFloat(Colones) || 0)
      .input("dolares", sql.Decimal, parseFloat(Dolares) || 0)
      .input("vuelto", sql.Decimal, parseFloat(Vuelto) || 0)
      .query("UPDATE Caja SET Colones = Colones + @colones - @vuelto, Dolares = Dolares + @dolares");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Caja no encontrada");
    }

    res.status(200).send("Caja actualizada");
  } catch (error) {
    res.status(500).send("Error al actualizar la caja");
  }
});

//Consulta #17 - Actualizar la cantidad de inventario (reducir)
app.put("/api/ReducirCantidadInventario", async (req, res) => {
  const { Cantidad, IDProducto } = req.body;

  if (!Cantidad || !IDProducto) {
    return res.status(400).send("Faltan datos requeridos");
  }

  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input("cantidad", sql.Decimal, Cantidad)
      .input("idProducto", sql.Int, IDProducto)
      .query("UPDATE Inventario SET Cantidad = Cantidad - @cantidad WHERE IDProducto = @idProducto");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).send("Caja no encontrada");
    }

    res.status(200).send("Caja actualizada");
  } catch (error) {
    res.status(500).send("Error al actualizar la caja");
  }
});

//Consulta #18 - Obtener la caja
app.get("/api/ObtenerCaja", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM Caja");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

//Consulta #19 - Sumar el total de venta diario
app.put("/api/SumarTotalDiario", async (req, res) => {
  const { TotalDiario } = req.body;

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("totalDiario", sql.Decimal, parseFloat(TotalDiario) || 0)
      .query("UPDATE TotalDiario SET TotalDiario = TotalDiario + @totalDiario")

    res.status(200).send("Total Sumado exitosamente")
  } catch (error) {
    res.status(500).send("Error al sumar al total diario");
  }
})

app.get("/api/ObtenerTotalDiario", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("SELECT * FROM TotalDiario");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).send("Error al obtener datos");
  }
});

app.put("/api/ResetTotalDiario", async (req, res) => {

  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .query("UPDATE TotalDiario SET TotalDiario = 0")

    res.status(200).send("Exito al resetear")
  } catch (error) {
    res.status(500).send("Error al resetear");
  }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT} 🗿`));