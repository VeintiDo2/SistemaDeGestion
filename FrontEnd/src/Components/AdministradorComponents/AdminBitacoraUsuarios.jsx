import axios from "axios";
import { useState, useEffect } from "react";

const AdminBitacoraUsuarios = () => {
    const [bitacoraData, setBitacoraData] = useState([])

    useEffect(() => {
        axios.get("http://localhost:5000/api/Bitacora")
            .then(response => setBitacoraData(response.data))
            .catch(error => console.error("Error al obtener datos:", error.message));
    }, []);

    const bitacora = () => {
        return (
            <table className="tableBitacora">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre Usuario</th>
                        <th>Nombre</th>
                        <th>Rol</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Evento</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(bitacoraData).map((bitacora) => (
                        <tr key={bitacora.IDUsuario}>
                            <td>{bitacora.IDUsuario}</td>
                            <td>{bitacora.NombreUsuario || "Sin nombre"}</td>
                            <td>{bitacora.Nombre}</td>
                            <td>{bitacora.Rol}</td>
                            <td>{bitacora.Fecha || "-"}</td>
                            <td>{bitacora.Hora || "-"}</td>
                            <td>{bitacora.Evento || "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    return bitacora()
}

export default AdminBitacoraUsuarios;