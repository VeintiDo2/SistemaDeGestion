import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const CajeroCajaDinero = () => {
    const [dineroData, setDineroData] = useState(null);
    const [totalDiario, setTotalDiario] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/ObtenerCaja")
            .then((response) => setDineroData(response.data))
            .catch((error) => {
                console.log("Error al obtener datos de la caja:", error);
                setError("Error al cargar datos de la caja.");
            });
    }, []);

    useEffect(() => {
        axios
            .get("http://localhost:5000/api/ObtenerTotalDiario")
            .then((response) => setTotalDiario(response.data))
            .catch((error) => {
                console.log("Error al obtener datos del total diario:", error);
                setError("Error al cargar el total diario.");
            });
    }, []);

    if (error) {
        return <div>{error}</div>;
    }

    if (!dineroData || !totalDiario) {
        return <div>Cargando datos...</div>;
    }

    return (
        <main className="containerInformes">
            <h1>Informes</h1>

            <article className="containerCaja">
                <h2>Caja</h2>
                <div>
                    <section>
                        Colones
                        <span>₡{dineroData[0]?.Colones || 0}</span>
                    </section>
                    <section>
                        Dólares
                        <span>${dineroData[0]?.Dolares || 0}</span>
                    </section>
                </div>
            </article>

            <article className="containerCaja">
                <h2>Venta Diaria Total</h2>
                <div>
                    <section>
                        <span>{totalDiario[0]?.TotalDiario || 0}</span>
                    </section>
                    <section>
                        <button onClick={async () => {
                            const reiniciar = await axios.put("http://localhost:5000/api/ResetTotalDiario")
                            Swal.fire({
                                title: "Exito",
                                text: "Total reiniciado",
                                icon: "success"
                            });
                        }}>Finalizar dia</button>
                    </section>
                </div>
            </article>
        </main>
    );
};

export default CajeroCajaDinero;
