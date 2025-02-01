import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css"

import Login from "./Components/Login";
import Administrador from "./Components/Administrador";
import Vendedor from "./Components/Vendedor";
import Cajero from "./Components/Cajero";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rol, setRol] = useState("")
  const [nombreBienvenida, setnombreBienvenida] = useState("")

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!isLoggedIn ? <Login setnombreBienvenida={setnombreBienvenida} onLoginSuccess={() => setIsLoggedIn(true)} setRol={setRol} /> : <Navigate to="/Administrador" />}
        />
        <Route
          path="/Administrador"
          element={rol == "Administrador" ? <Administrador rol="Administrador" nombreBienvenida={nombreBienvenida} onLoginSuccess={() => setIsLoggedIn(true)} /> : <Navigate to="/Vendedor" />}
        />
        <Route
          path="/Vendedor"
          element={rol == "Vendedor" ? <Vendedor rol="Vendedor" nombreBienvenida={nombreBienvenida} onLoginSuccess={() => setIsLoggedIn(true)} /> : <Navigate to="/Cajero" />}
        />
        <Route
          path="/Cajero"
          element={rol == "Cajero" ? <Cajero rol="Comprador" nombreBienvenida={nombreBienvenida} onLoginSuccess={() => setIsLoggedIn(true)} /> : <Navigate to="/" />}
        />
      </Routes >
    </Router >
  );
}

export default App;
