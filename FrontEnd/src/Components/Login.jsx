import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { PiUserFill } from "react-icons/pi";
import { RiLockPasswordFill } from "react-icons/ri";

const Login = ({ setnombreBienvenida, onLoginSuccess, setRol, isLoggedIn }) => {
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
                    Swal.fire({
                        title: "¡Bloqueado!",
                        text: `El usuario ${nombreUsuario} ha sido bloqueado`,
                        icon: "info"
                    });
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

        // Validar campos vacíos antes de enviar la solicitud
        if (!nombreUsuario || !contraseña) {
            return Swal.fire({
                title: "Error",
                text: "Por favor completa todos los campos",
                icon: "error",
                backdrop: false,
                position: "top-end",
                timer: 2000,
                allowEscapeKey: true,
                allowEnterKey: true,
                width: "20vw"
            });
        }

        try {
            const response = await axios.post("http://localhost:5000/api/login", {
                nombreUsuario,
                contraseña,
            });

            const { success, message } = response.data;

            if (message === "Bloqueado") {
                Swal.fire({
                    title: "Acceso denegado",
                    text: `El usuario ${nombreUsuario} está bloqueado`,
                    icon: "info",
                });
            } else if (success) {
                const datosUsuario = await obtenerDatos();
                const usuarioId = datosUsuario.IDUsuario;

                if (usuarioId) {
                    await actualizarBitacora(usuarioId, fecha, hora, evento);
                    setnombreBienvenida(nombreUsuario)
                    onLoginSuccess();
                    setIntentos(0);
                } else {
                    console.error("ID no está disponible después de obtener los datos");
                }
            } else if (message === "Credenciales incorrectas") {
                Swal.fire({
                    title: "Error",
                    text: "Credenciales incorrectas. Por favor verifica tus datos.",
                    icon: "warning",
                });
                
                const datosUsuario = await obtenerDatos();
                const usuarioId = datosUsuario.IDUsuario;
                if (usuarioId) {
                    await bloqueado(usuarioId);
                }

            } else if (message === "El usuario no existe en el sistema") {
                Swal.fire({
                    title: "Error",
                    text: `${message}`,
                    icon: "warning",
                });
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);
            Swal.fire({
                title: "Error del servidor",
                text: "Hubo un problema al procesar tu solicitud.",
                icon: "error",
            });
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
        <main className="loginPage">
            <div className="loginContainer">
                <span>Inicio de sesión</span>
                <div>
                    <PiUserFill></PiUserFill>
                    <input
                        placeholder="Nombre de usuario"
                        value={nombreUsuario}
                        onChange={(e) => setNombreUsuario(e.target.value)}
                    />
                </div>
                <div>
                    <RiLockPasswordFill></RiLockPasswordFill>
                    <input
                        placeholder="Constraseña"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                    />
                </div>
                <button onClick={() => handleLogin("Entrada")}>Iniciar Sesión</button>
            </div>
        </main>
    );
};

export default Login;
