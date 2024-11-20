import React, { useState } from "react";
import axios from "axios";

const Login = ({ onLoginSuccess, setRol, isLoggedIn }) => {
    const [nombreUsuario, setNombreUsuario] = useState("");
    const [contraseña, setContraseña] = useState("");
    const [ultimoNombre, setUltimoNombre] = useState("");
    const [intentos, setIntentos] = useState(0);
    const [id, setId] = useState(0);

    const obtenerFechaHoraActual = () => {
        const fechaActual = new Date();

        const anio = fechaActual.getFullYear();
        const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
        const dia = String(fechaActual.getDate()).padStart(2, '0');
        const fechaFormateada = `${anio}-${mes}-${dia}`; //NOTA: Es mejor enviar la fecha como 'YYYY-MM-DD', ya que es el formato que recibe el SQL SERVER.

        const horas = String(fechaActual.getHours()).padStart(2, '0');
        const minutos = String(fechaActual.getMinutes()).padStart(2, '0');
        const segundos = String(fechaActual.getSeconds()).padStart(2, '0');
        const horaFormateada = `${horas}:${minutos}:${segundos}`;

        return { fecha: fechaFormateada, hora: horaFormateada }
    }

    const obtenerDatos = async () => {
        try {
            const respuesta = await axios.get("http://localhost:5000/api/ObtenerDatos", {
                params: { nombreUsuario }
            });
            setId(respuesta.data.IDUsuario);
            setRol(respuesta.data.Rol);
            return respuesta.data;
        } catch (error) {
            console.error("Error al obtener los datos");
            return null;
        }
    };

    const estadoBloqueado = async (id, fecha, hora, evento) => {
        try {
            const respuesta = await axios.put("http://localhost:5000/api/ActualizarBitacora", {
                id,
                fecha,
                hora,
                evento
            });
        } catch (error) {
            console.error("Error al bloquear el usuario");
        }
    };

    const bloqueado = async (usuarioId) => {
        setIntentos((prevIntentos) => {
            if (ultimoNombre === nombreUsuario && !isLoggedIn) {
                const nuevosIntentos = prevIntentos + 1;

                if (nuevosIntentos >= 3) {
                    const { fecha, hora } = obtenerFechaHoraActual();
                    estadoBloqueado(usuarioId, fecha, hora, "Bloqueado");
                    alert(`¡Usuario ${nombreUsuario} ha sido bloqueado!`);
                }

                return nuevosIntentos;
            } else {
                setUltimoNombre(nombreUsuario);
                return 1;
            }
        });
    };

    const handleLogin = async (evento) => {
        const { fecha, hora } = obtenerFechaHoraActual();

        try {
            const response = await axios.post("http://localhost:5000/api/login", {
                nombreUsuario,
                contraseña,
            });
            if (response.data.message == "Bloqueado") {
                alert(`El usuario ${nombreUsuario} esta bloqueado`)
            } else {
                if (response.data.success) {
                    const datosUsuario = await obtenerDatos();
                    const usuarioId = datosUsuario.IDUsuario;

                    if (usuarioId) {
                        await actualizarBitacora(usuarioId, fecha, hora, evento);
                        onLoginSuccess();
                        setIntentos(0);
                    } else {
                        console.error("ID no está disponible después de obtener los datos");
                    }
                } else {
                    alert(response.data.message);
                    const datosUsuario = await obtenerDatos();
                    const usuarioId = datosUsuario.IDUsuario;
                    await bloqueado(usuarioId);
                }
            }


        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión");
        }
    };

    const actualizarBitacora = async (id, fecha, hora, evento) => {
        try {
            await axios.put("http://localhost:5000/api/ActualizarBitacora", {
                id,
                fecha,
                hora,
                evento
            });
        } catch (error) {
            console.error("Error al actualizar la bitácora:", error);
        }
    }

    return (
        <div className="loginContainer">
            <h2>Login</h2>
            <input
                placeholder="Nombre de usuario"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
            />
            <input
                placeholder="Constraseña"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
            />
            <button onClick={() => handleLogin("Entrada")}>Iniciar Sesión</button>
        </div>
    );
};

export default Login;
