import React from "react";
import { useState } from "react";
import Header from "./Header";
import VendedorFacturacion from "./VendedorComponents/VendedorFacturacion";
import CartelBienvenida from "./CartelBienvenida";

const Vendedor = ({ nombreBienvenida, rol }) => {
  const [modo, setModo] = useState(<CartelBienvenida nombreBienvenida={nombreBienvenida}></CartelBienvenida>);
  const [userOption, setUserOption] = useState(false);
  const [optionsHeader, setOptionsHeader] = useState([
    { id: 1, text: "Crear factura", component: <VendedorFacturacion /> },
  ]);

  return (
    <main className="page">
      <Header optionsHeader={optionsHeader} setModo={setModo} setUserOption={setUserOption} rol={rol} />
      <section className="mainContent">
        {modo && React.cloneElement(modo, { userOption, setUserOption })}
      </section>
    </main>
  );
};

export default Vendedor;
