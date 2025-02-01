import React from "react";
import { useState } from "react"
import CajeroCancelar from "./CajeroComponents/CajeroCancelar";
import CajeroCajaDinero from "./CajeroComponents/CajeroCajaDinero";
import CartelBienvenida from "./CartelBienvenida";
import Header from "./Header";

const Cajero = ({ nombreBienvenida, rol }) => {

  const [modo, setModo] = useState(<CartelBienvenida nombreBienvenida={nombreBienvenida}></CartelBienvenida>);
  const [userOption, setUserOption] = useState(false);
  const [optionsHeader, setOptionsHeader] = useState([
    { id: 1, text: "Cancelar", component: <CajeroCancelar /> },
    { id: 2, text: "Caja", component: <CajeroCajaDinero /> }
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

export default Cajero;
