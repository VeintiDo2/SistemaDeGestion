import { useState, useEffect } from "react"
import axios from "axios";
import Swal from "sweetalert2";
import { FaShoppingCart } from "react-icons/fa";

const CajeroCancelar = () => {
    const [facturaData, setFacturaData] = useState([])

    useEffect(() => {
        axios.get("http://localhost:5000/api/ObtenerFacturas")
            .then(response => setFacturaData(response.data))
            .catch(error => console.log("Error al obtener datos:", error))
    }, [])

    const cancelarCompra = async (idEliminar) => {
        try {
            const result = await Swal.fire({
                title: "¿Cobrar Factura?",
                text: "Esta acción no se puede revertir",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Cobrar",
                cancelButtonText: "Cancelar",
            });

            if (result.isConfirmed) {
                const facturaSeleccionada = facturaData.find(factura => factura.IDFactura === idEliminar);

                const dinero = {
                    Colones: facturaSeleccionada.Colones,
                    Dolares: facturaSeleccionada.Dolares,
                    Vuelto: facturaSeleccionada.Vuelto,
                };

                console.table("Datos a enviar:", dinero)

                if (!facturaSeleccionada) {
                    Swal.fire("Error", "Factura no encontrada", "error");
                    return;
                }

                const respuestaCaja = await axios.put("http://localhost:5000/api/ActualizarCaja",
                    dinero,
                    {
                        headers: { "Content-Type": "application/json" }
                    })

                const respuestaInventario = await axios.put(
                    "http://localhost:5000/api/ReducirCantidadInventario",
                    {
                        Cantidad: facturaSeleccionada.Cantidad,
                        IDProducto: facturaSeleccionada.IDProducto,
                    },
                    {
                        headers: { "Content-Type": "application/json" },
                    }
                );

                if (idEliminar) {
                    const respuestaFactura = await axios.delete("http://localhost:5000/api/CobrarFactura", {
                        params: { idEliminar }
                    })
                        .catch(error => console.error("Error al obtener datos:", error.message));
                }

                Swal.fire({
                    title: "Éxito",
                    text: "Factura cobrada",
                    icon: "success",
                });
            }
        } catch (error) {
            console.error("Error al ejecutar alguna consulta:", error.message);
            Swal.fire({
                title: "Error",
                text: "Ocurrió un problema al procesar la solicitud",
                icon: "error",
            });
        }
    };



    const facturas = () => {
        return (<table className="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre del producto</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th>Vuelto</th>
                    <th>Cancelar</th>
                </tr>
            </thead>
            <tbody>
                {Object.values(facturaData).map((factura) => (
                    <tr key={factura.IDFactura}>
                        <td>{factura.IDFactura}</td>
                        <td>{factura.NombreProducto}</td>
                        <td>{factura.Cantidad}</td>
                        <td>{factura.Subtotal}</td>
                        <td>{factura.Vuelto}</td>
                        <td><button className="buttonDeleteUser" onClick={() => cancelarCompra(factura.IDFactura)} ><FaShoppingCart></FaShoppingCart></button></td>
                    </tr>
                ))}
            </tbody>
        </table>
        )
    }

    return facturas()
}

export default CajeroCancelar