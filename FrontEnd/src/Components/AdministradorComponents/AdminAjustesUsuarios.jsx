import { useEffect, useState } from "react";
import axios from "axios";
import { FaCog } from "react-icons/fa";
import { FaTrashAlt } from "react-icons/fa";
import Swal from "sweetalert2";

import AdminModificarUsuario from "./AdminModificarUsuario";

const AdminAjustesUsuarios = ({ userOption, setUserOption }) => {
    const [data, setData] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        axios.get("http://localhost:5000/api/usuarios")
            .then(response => setData(response.data))
            .catch(error => console.error("Error al obtener datos:", error));
    }, []);

    const usuarios = () => {
        return (Object.values(data).map(usuario =>
            <div key={usuario.IDUsuario} className="containerUsers">
                <div className="containerInfoUsers">
                    <span>{usuario.IDUsuario}</span>
                    <span>{usuario.NombreUsuario}</span>
                </div>
                <aside className="containerButtonsUser">
                    <button className="buttonModifyUser" onClick={() => {
                        setUserOption(true)
                        setSelectedUser(usuario)
                    }} ><FaCog></FaCog></button>
                    <button className="buttonDeleteUser" onClick={() => deleteUser(usuario)}><FaTrashAlt></FaTrashAlt></button>
                </aside>
            </div>
        ))
    }

    //NOTA: El metodo "axios.DELETE" no tiene cuerpo, así que utilizamos "params: {something}" para enviar un dato.
    const deleteUser = async (usuario) => {
        try {
            const ID = usuario.IDUsuario;

            const result = await Swal.fire({
                title: "¿Eliminar usuario?",
                text: "Esta accion no se puede revertir",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "¡Si, eliminar!",
                cancelButtonText: "Cancelar"
            });

            if (result.isConfirmed) {
                const respuesta = await axios.delete(`http://localhost:5000/api/EliminarUsuario`, {
                    params: { ID }
                });

                Swal.fire({
                    title: "Eliminado",
                    text: "El usuario ha sido eliminado",
                    icon: "success"
                });
            }
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            Swal.fire({
                title: "Error",
                text: "Ocurrio un error al eliminar el usuario",
                icon: "error"
            });
        }
    };


    const selectUserOption = () => {
        if (!userOption) {
            return usuarios();
        } else if (selectedUser) {
            return <AdminModificarUsuario selectedUser={selectedUser} />;
        }
        return null;
    };

    return (
        <article>
            {selectUserOption()}
        </article>
    )
}

export default AdminAjustesUsuarios;