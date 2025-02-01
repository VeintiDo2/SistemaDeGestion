import { useState, useEffect } from "react"
import axios from "axios";
import Swal from "sweetalert2";

const VendedorFacturacion = () => {
    const [provData, setProvData] = useState([]);
    const [productData, setProductData] = useState([])
    const [forma, setForma] = useState("")

    const initialPedidoData = {
        IDProveedor: 0,
        IDProducto: 0,
        FechaVenta: "",
        Total: 0,
        FormaPago: "",
        IVA: 0,
        TipoCambio: 509.27,
        Colones: 0,
        Dolares: 0,
        Tarjeta: 0,
        Cantidad: 0,
        Precio: 0,
        SubTotal: 0,
        Vuelto: 0,
        NombreProducto: "",
    };

    const [pedidoData, setPedidoData] = useState(initialPedidoData)

    // useEffect(() => {
    //     axios.get("http://localhost:5000/api/InventarioProductos")
    //         .then(response => setInventarioData(response.data))
    //         .catch(error => console.error("Error al obtener datos:", error));
    // }, []);

    const resetForm = () => {
        setPedidoData(initialPedidoData);
        setForma("");
    };


    const obtenerFechaHoraActual = () => {
        const fechaActual = new Date();

        const anio = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const fechaFormateada = `${anio}-${mes}-${dia}`; //NOTA: Es mejor enviar la fecha como 'YYYY-MM-DD', ya que es el formato que recibe el SQL SERVER.
        setPedidoData((pedidoData) => ({ ...pedidoData, FechaVenta: fechaFormateada }))
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
            .then((response) => { setProductData(response.data) })
            .catch(error => console.error("Error al obtener datos:", error.message));
    };

    const requestVenta = async () => {
        try {
            const respuesta = await axios.post("http://localhost:5000/api/Venta", pedidoData, {
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            console.error("Error al procesar la venta:", error.response || error.message);
            Swal.fire({
                title: "Error",
                text: "Ocurrió un problema al procesar la venta",
                icon: "error"
            });
        }
    }

    const handlePedido = (e) => {
        const { value, selectedOptions } = e.target;
        const values = value.split(",");
        if (values.length === 2) {
            const [IDProducto, Precio] = values;
            const NombreProducto = selectedOptions[0].text;
            setPedidoData({
                ...pedidoData,
                IDProducto,
                Precio,
                NombreProducto,
            });
        } else {
            console.error("El valor del select no es válido:", value);
        }
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
            setPedidoData((pedidoData) => ({ ...pedidoData, IDProveedor: idProveedor, IDProducto: 0, Precio: 0 }))
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

    const formaDePago = () => {

        const obtenerForma = () => {
            if (forma) {
                if (forma == "Efectivo") {
                    return (
                        <div className="ventaContainer">
                            <input required onChange={(e) => setPedidoData(pedidoData => ({ ...pedidoData, Colones: e.target.value }))}
                                type="number" min={0} step="any" placeholder="Colones"></input>
                            <input required onChange={(e) => setPedidoData(pedidoData => ({ ...pedidoData, Dolares: e.target.value }))}
                                type="number" min={0} step="any" placeholder="Dolares"></input>
                        </div>
                    )
                } else if (forma == "Tarjeta") {
                    return <input required onChange={(e) => setPedidoData(pedidoData => ({ ...pedidoData, Tarjeta: e.target.value }))} type="number" min={0} step="any" placeholder="Tarjeta"></input>
                } else {
                    return (
                        <div className="ventaContainer">
                            <input required onChange={(e) => setPedidoData(pedidoData => ({ ...pedidoData, Colones: e.target.value }))}
                                type="number" min={0} step="any" placeholder="Colones"></input>
                            <input required onChange={(e) => setPedidoData(pedidoData => ({ ...pedidoData, Dolares: e.target.value }))}
                                type="number" min={0} step="any" placeholder="Dolares"></input>
                            <input required onChange={(e) => setPedidoData(pedidoData => ({ ...pedidoData, Tarjeta: e.target.value }))} type="number" min={0} step="any" placeholder="Tarjeta"></input>
                        </div>
                    )
                }
            } else {
                return null
            }

        }

        return (<section className="ventaContainer">
            <select onChange={(e) => {
                setForma(e.target.value || "")
                setPedidoData((pedidoData) => ({
                    ...pedidoData,
                    FormaPago: e.target.value
                }))
            }} defaultValue="">
                <option value="" disabled>
                    Forma de pago
                </option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo y Tarjeta">Efectivo y Tarjeta</option>
            </select>
            {obtenerForma()}
        </section>)
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!pedidoData.IDProducto || !pedidoData.Precio || !pedidoData.Cantidad || !pedidoData.NombreProducto || !pedidoData.FormaPago) {
            console.table(pedidoData);
            Swal.fire({
                title: "Error",
                text: "Hay campos sin rellenar",
                icon: "info"
            });
        } else {
            console.table(pedidoData);
            requestVenta()

            Swal.fire({
                title: "Exito",
                text: "Pedido exitoso",
                icon: "success"
            });
            resetForm();
        }
    };

    const ObtenerSubtotal = async (TotalDiario) => {
        const respuesta = await axios.put("http://localhost:5000/api/SumarTotalDiario", {
            TotalDiario
        });
    }

    const calculos = () => {
        const cantidad = parseFloat(pedidoData.Cantidad) || 0;
        const precio = parseFloat(pedidoData.Precio) || 0;
        const colones = parseFloat(pedidoData.Colones) || 0;
        const dolares = parseFloat(pedidoData.Dolares) || 0;
        const tarjeta = parseFloat(pedidoData.Tarjeta) || 0;

        const total = cantidad * precio;
        const subTotal = total * 1.21;
        const iva = subTotal - total;
        const conversionDolar = dolares * pedidoData.TipoCambio;
        const dineroCliente = colones + tarjeta + conversionDolar;
        const vuelto = dineroCliente - subTotal;

        ObtenerSubtotal(subTotal);
        setPedidoData((pedidoData) => ({
            ...pedidoData,
            Total: total,
            IVA: iva,
            SubTotal: subTotal,
            Vuelto: vuelto,
        }))
    }

    return (
        <div className="formContainer">
            <h2>Factura</h2>
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
                <label >
                    {formaDePago()}
                </label>
                <button type="submit" onClick={
                    () => {
                        obtenerFechaHoraActual(),
                            calculos()
                    }}>Solicitar</button>
            </form>
        </div>
    )
}

export default VendedorFacturacion