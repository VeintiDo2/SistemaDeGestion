import { useState, useEffect } from "react"
import axios from "axios"
import Swal from "sweetalert2";

const AdminPedidos = () => {
    const [provData, setProvData] = useState([]);
    const [productData, setProductData] = useState([])
    const [inventarioData, setInventarioData] = useState([])

    const [pedidoData, setPedidoData] = useState({
        IDProveedor: "",
        IDProducto: "",
        Precio: "",
        Cantidad: "",
        FechaPedido: "",
        SubTotal: 0,
        NombreProducto: "",
    })

    useEffect(() => {
        axios.get("http://localhost:5000/api/InventarioProductos")
            .then(response => setInventarioData(response.data))
            .catch(error => console.error("Error al obtener datos:", error));
    }, []);

    const obtenerFechaHoraActual = () => {
        const fechaActual = new Date();

        const anio = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const fechaFormateada = `${anio}-${mes}-${dia}`; //NOTA: Es mejor enviar la fecha como 'YYYY-MM-DD', ya que es el formato que recibe el SQL SERVER.
        setPedidoData((pedidoData) => ({ ...pedidoData, FechaPedido: fechaFormateada }))
    }

    useEffect(() => {
        axios.get("http://localhost:5000/api/Proveedores")
            .then(response => {
                setProvData(response.data);
                if (response.data.length > 0) {
                    const firstProveedorID = response.data[0].IDProveedor;
                    fetchProductos(firstProveedorID);

                }
            })
            .catch(error => console.error("Error al obtener datos:", error.message));
    }, []);

    const fetchProductos = (idProveedor) => {
        axios.get("http://localhost:5000/api/Productos", {
            params: { idProveedor }
        })
            .then(response => { setProductData(response.data) })
            .catch(error => console.error("Error al obtener datos:", error.message));
    };


    const requestPedido = async () => {
        try {
            console.log("Enviando solicitud POST...");
            const respuesta = await axios.post("http://localhost:5000/api/Pedido", pedidoData, {
                headers: { "Content-Type": "application/json" }
            });
            console.log("Respuesta recibida:", respuesta);

            // Re-fetch the inventory data after submitting the order
            console.log("Entrando en la actualización del inventario");
            axios.get("http://localhost:5000/api/InventarioProductos")
                .then(response => {
                    console.log("Inventario actualizado:", response);
                    setInventarioData(response.data);  // Actualiza el estado
                    console.log("Nuevo estado de inventario:", response.data);  // Asegúrate de que los datos sean correctos
                })
                .catch(error => console.error("Error al obtener datos de inventario:", error));

        } catch (error) {
            console.error("Error al procesar el pedido:", error.response || error.message);
            Swal.fire({
                title: "Error",
                text: "Ocurrió un problema al procesar el pedido",
                icon: "error"
            });
        }
    };


    const actualizarInventario = (idProducto, nuevaCantidad) => {
        setInventarioData(prevInventario => {
            return prevInventario.map(item =>
                item.IDProducto === idProducto
                    ? { ...item, Cantidad: item.Cantidad + nuevaCantidad }
                    : item
            );
        });
    }


    const handlePedido = (e) => {
        const { value, selectedOptions } = e.target;
        const [IDProducto, Precio] = value.split(",");
        const NombreProducto = selectedOptions[0].text;
        setPedidoData({
            ...pedidoData,
            IDProducto,
            Precio,
            NombreProducto,
        });
    };

    //Obtener multiples values...
    const productList = () => {
        return (
            <select
                name="product"
                onChange={handlePedido}
                value={pedidoData.IDProducto ? `${pedidoData.IDProducto},${pedidoData.Precio}` : ""}
                disabled={!pedidoData.IDProveedor}
            >
                <option value="" disabled>
                    {pedidoData.IDProveedor ? "Selecciona un producto" : "Selecciona un proveedor primero"}
                </option>
                {productData.length > 0 &&
                    Object.values(productData).map((producto) => (
                        <option
                            key={producto.IDProducto}
                            value={`${producto.IDProducto},${producto.Precio}`}
                        >
                            {producto.NombreProducto}
                        </option>
                    ))}
            </select>
        );
    };

    const provList = () => {
        return <select onChange={(e) => {
            const idProveedor = e.target.value
            setPedidoData((pedidoData) => ({ ...pedidoData, IDProveedor: idProveedor, IDProducto: "", Precio: "" }))
            setProductData([])
            fetchProductos(idProveedor);
        }} defaultValue="">
            <option value="" disabled>
                Selecciona un proveedor
            </option>
            {Object.values(provData).map((proveedor) => (
                <option key={proveedor.IDProveedor} value={proveedor.IDProveedor}>
                    {proveedor.NombreProveedor}
                </option>
            ))}
        </select>
    }

    const handleSubmit = (e) => {


        e.preventDefault();
        if (!pedidoData.IDProducto || !pedidoData.Precio || !pedidoData.Cantidad) {
            Swal.fire({
                title: "Error",
                text: "Hay campos sin rellenar",
                icon: "info"
            });
        } else {
            console.table(pedidoData);
            requestPedido()

            Swal.fire({
                title: "Exito",
                text: "Pedido exitoso",
                icon: "success"
            });
        }
    };

    const calculoSubtotal = () => {
        const subtotal = pedidoData.Cantidad * pedidoData.Precio
        setPedidoData((pedidoData) => ({ ...pedidoData, SubTotal: subtotal }))
        actualizarInventario(pedidoData.IDProducto, pedidoData.Cantidad);
    }

    return (
        <div className="formContainer">
            <h2>Pedido</h2>
            <form onSubmit={handleSubmit} className="formInsertContainer">
                <label>
                    {provList()}
                </label>
                <label>
                    {productList()}
                </label>
                <label>
                    <input type="number" name="Cantidad" placeholder="Cantidad" min={1} onChange={(e) =>
                        setPedidoData((pedidoData) => ({
                            ...pedidoData, Cantidad: e.target.value
                        }))} />
                </label>
                <button type="submit" onClick={
                    () => {
                        obtenerFechaHoraActual(),
                            calculoSubtotal()
                    }}>Solicitar</button>
            </form>
            <table className="table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Producto</th>
                        <th>Descripción</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(inventarioData).map((inventario) => (
                        <tr key={inventario.IDProducto}>
                            <td>{inventario.IDProducto}</td>
                            <td>{inventario.NombreProducto}</td>
                            <td>{inventario.Descripcion}</td>
                            <td>{inventario.Precio}</td>
                            <td>{inventario.Cantidad}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default AdminPedidos