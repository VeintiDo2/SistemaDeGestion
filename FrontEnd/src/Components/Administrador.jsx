import React, { useState } from "react";
import Header from "./Header";

const Administrador = () => {
  const [modo, setModo] = useState(null)


  return <main className="page">
    <Header setModo={setModo}></Header>
    <section>
      {modo}
    </section>
  </main>;
};

export default Administrador;
