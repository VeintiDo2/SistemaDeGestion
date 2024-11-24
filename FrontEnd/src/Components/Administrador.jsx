import React, { useState } from "react";
import Header from "./Header";

const Administrador = () => {
  const [modo, setModo] = useState(null);
  const [userOption, setUserOption] = useState(false);

  return (
    <main className="page">
      <Header setModo={setModo} setUserOption={setUserOption} />
      <section className="mainContent">
        {modo && React.cloneElement(modo, { userOption, setUserOption })} 
      </section>
    </main>
  );
};

export default Administrador;

//React.cloneElement() Es muy útil para pasar props a componentes.