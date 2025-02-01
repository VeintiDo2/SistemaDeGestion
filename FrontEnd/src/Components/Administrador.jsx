import React, { useState, useEffect } from "react";
import Header from "./Header";
import AdminAñadirUsuarios from "./AdministradorComponents/AdminAñadirUsuarios"
import AdminAjustesUsuarios from "./AdministradorComponents/AdminAjustesUsuarios"
import AdminBitacoraUsuarios from "./AdministradorComponents/AdminBitacoraUsuarios"
import AdminPedidos from "./AdministradorComponents/AdminPedidos"
import CartelBienvenida from "./CartelBienvenida";

const Administrador = ({ nombreBienvenida, rol }) => {
  const [modo, setModo] = useState(<CartelBienvenida nombreBienvenida={nombreBienvenida}></CartelBienvenida>);
  const [userOption, setUserOption] = useState(false);
  const [optionsHeader, setOptionsHeader] = useState([
    { id: 1, text: "Añadir Usuario", component: <AdminAñadirUsuarios /> },
    { id: 2, text: "Ajustes de Usuarios", component: <AdminAjustesUsuarios /> },
    { id: 3, text: "Bitacora", component: <AdminBitacoraUsuarios /> },
    { id: 4, text: "Pedidos", component: <AdminPedidos /> },
  ]);

  return (
    <main className="page">
      <Header optionsHeader={optionsHeader} setModo={setModo} setUserOption={setUserOption} rol={rol} />
      <section className="mainContent">
        {modo && React.cloneElement(modo, { userOption, setUserOption, nombreBienvenida })}
      </section>
    </main>
  );
};

export default Administrador;

//React.cloneElement() Es muy útil para pasar props a componentes.