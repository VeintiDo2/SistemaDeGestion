import { useEffect, useState } from "react";
import axios from "axios";
import { PiUserFill } from "react-icons/pi";
import { PiIdentificationBadgeFill } from "react-icons/pi";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";

import Swal from 'sweetalert2'

const AdminModificarUsuario = ({ selectedUser }) => {
    const [updateFormData, setUpdateDataForm] = useState({
        IDUsuario: selectedUser.IDUsuario || "",
        NombreUsuario: selectedUser.NombreUsuario || "",
        Nombre: selectedUser.Nombre || "",
        Contraseña: selectedUser.Contraseña || "",
        Correo: selectedUser.Correo || "",
        Rol: selectedUser.Rol || "",
        Estado: selectedUser.Estado || "",
    });

    useEffect(() => {
        setUpdateDataForm({
            IDUsuario: selectedUser.IDUsuario || "",
            NombreUsuario: selectedUser.NombreUsuario || "",
            Nombre: selectedUser.Nombre || "",
            Contraseña: selectedUser.Contraseña || "",
            Correo: selectedUser.Correo || "",
            Rol: selectedUser.Rol || "",
            Estado: selectedUser.Estado || "",
        });
    }, [selectedUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdateDataForm({ ...updateFormData, [name]: value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        console.table(updateFormData);

        try {
            const respuesta = await axios.put("http://localhost:5000/api/ActualizarUsuario",
                updateFormData,
                {
                    headers: { "Content-Type": "application/json" }
                });

            Swal.fire({
                title: "Actualizado",
                text: "El usuario ha sido actualizado",
                icon: "success"
            });

        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alert("Error en el servidor");
        }
    };

    return (
        <div className="formContainer">
            <h2>Actualizar Usuario</h2>
            <form onSubmit={handleUpdateSubmit} className="formInsertContainer">
                <label>
                    <PiUserFill />
                    <input
                        type="text"
                        name="NombreUsuario"
                        value={updateFormData.NombreUsuario}
                        onChange={handleChange}
                        placeholder="Nombre de usuario"
                        required
                    />
                </label>
                <label>
                    <PiIdentificationBadgeFill />
                    <input
                        title="Su nombre real"
                        type="text"
                        name="Nombre"
                        value={updateFormData.Nombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                        required
                    />
                </label>
                <label>
                    <RiLockPasswordFill />
                    <input
                        type="text"
                        name="Contraseña"
                        value={updateFormData.Contraseña}
                        onChange={handleChange}
                        placeholder="Contraseña"
                        required
                    />
                </label>
                <label>
                    <MdEmail />
                    <input
                        type="text"
                        name="Correo"
                        value={updateFormData.Correo}
                        onChange={handleChange}
                        placeholder="Correo electrónico"
                        required
                    />
                </label>
                <label>
                    <select
                        name="Rol"
                        value={updateFormData.Rol}
                        onChange={handleChange}
                        required
                    >
                        <option value="Administrador">Administrador</option>
                        <option value="Vendedor">Vendedor</option>
                        <option value="Cajero">Cajero</option>
                    </select>
                </label>
                <label>
                    <select
                        name="Estado"
                        value={updateFormData.Estado}
                        onChange={handleChange}
                        required
                    >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Bloqueado">Bloqueado</option>
                    </select>
                </label>
                <button type="submit">Actualizar Usuario</button>
            </form>
        </div>
    );
};

export default AdminModificarUsuario;
