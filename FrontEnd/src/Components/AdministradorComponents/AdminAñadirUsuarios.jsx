import axios from "axios";
import { useState } from "react";
import { PiUserFill } from "react-icons/pi";
import { PiIdentificationBadgeFill } from "react-icons/pi";
import { RiLockPasswordFill } from "react-icons/ri";
import { MdEmail } from "react-icons/md";
import Swal from "sweetalert2";

const AdminAñadirUsuarios = ({ nombreBienvenida }) => {
    const [formData, setDataForm] = useState({
        nombreUsuario: "",
        nombre: "",
        contraseña: "",
        correo: "",
        rol: "Administrador",
        estado: "Inactivo",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDataForm({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const respuesta = await axios.post("http://localhost:5000/api/InsertarUsuario",
                formData,
                {
                    headers: { "Content-Type": "application/json" }
                });

            Swal.fire({
                title: "Añadido",
                text: "El usuario ha sido añadido",
                icon: "success"
            });

        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alert("Error en el servidor");
        }
    }

    return (
        <div className="formContainer">
            <h2>Insertar Usuario</h2>
            <form onSubmit={handleSubmit} className="formInsertContainer">
                <label>
                    <PiUserFill></PiUserFill>
                    <input
                        type="text"
                        name="nombreUsuario"
                        value={formData.nombreUsuario}
                        onChange={handleChange}
                        placeholder="Nombre de usuario"
                        required
                    />
                </label>
                <label>
                    <PiIdentificationBadgeFill></PiIdentificationBadgeFill>
                    <input
                        title="Su nombre real"
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        placeholder="Nombre"
                        required
                    />
                </label>
                <label>
                    <RiLockPasswordFill></RiLockPasswordFill>
                    <input
                        type="text"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        placeholder="Contraseña"
                        required
                    />
                </label>
                <label>
                    <MdEmail></MdEmail>
                    <input
                        type="text"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        placeholder="Correo electrónico"
                        required
                    />
                </label>
                <label>

                    <select
                        name="rol"
                        value={formData.rol}
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
                        name="estado"
                        value={formData.estado}
                        onChange={handleChange}
                        required
                    >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </label>
                <button type="submit">Insertar Usuario</button>
            </form>
        </div>
    )
}

export default AdminAñadirUsuarios;