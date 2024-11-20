import { useEffect, useState } from "react";
import axios from "axios";


const AdminAjustesUsuarios = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/usuarios")
            .then(response => setData(response.data))
            .catch(error => console.error("Error al obtener datos:", error));
    }, []);

    // console.table(data)

    const usuarios = () => {
        return (Object.values(data).map(usuario =>
            <li key={usuario.IDUsuario}>
                {usuario.NombreUsuario} <button>bruh</button>
            </li>
        ))
    }

    return (
        <div className="mainContent">
            {usuarios()}
        </div>
    )
}

export default AdminAjustesUsuarios;