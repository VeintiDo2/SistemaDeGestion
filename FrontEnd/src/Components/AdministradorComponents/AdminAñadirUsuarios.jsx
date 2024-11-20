import axios from "axios";
import { useState } from "react";

const AdminAñadirUsuarios = () => {
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
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            alert("Error en el servidor");
        }
    }

    return (
        <div className="mainContent">
            <h2>Insertar Usuario</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Nombre de Usuario:
                    <input
                        type="text"
                        name="nombreUsuario"
                        value={formData.nombreUsuario}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Nombre:
                    <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Contraseña:
                    <input
                        type="text"
                        name="contraseña"
                        value={formData.contraseña}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Correo:
                    <input
                        type="text"
                        name="correo"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                    />
                </label>
                <br />
                <label>
                    Rol:
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
                <br />
                <label>
                    Estado:
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
                <br />
                <button type="submit">Insertar Usuario</button>
            </form>
        </div>
    )
}

export default AdminAñadirUsuarios;