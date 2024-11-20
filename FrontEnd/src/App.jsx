import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css"

import Login from "./Components/Login";
import Administrador from "./Components/Administrador";
import Vendedor from "./Components/Vendedor";
import Cajero from "./Components/Cajero";

function App() {
  //const [data, setData] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rol, setRol] = useState("")

  // useEffect(() => {
  //   axios.get("http://localhost:5000/api/usuario")
  //     .then(response => setData(response.data))
  //     .catch(error => console.error("Error al obtener datos:", error));
  // }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={!isLoggedIn ? <Login onLoginSuccess={() => setIsLoggedIn(true)} setRol={setRol} /> : <Navigate to="/Administrador" />}
        />
        <Route
          path="/Administrador"
          element={rol == "Administrador" ? <Administrador onLoginSuccess={() => setIsLoggedIn(true)} /> : <Navigate to="/Vendedor" />}
        />
        <Route
          path="/Vendedor"
          element={rol == "Vendedor" ? <Vendedor onLoginSuccess={() => setIsLoggedIn(true)} /> : <Navigate to="/Cajero" />}
        />
        <Route
          path="/Cajero"
          element={rol == "Cajero" ? <Cajero onLoginSuccess={() => setIsLoggedIn(true)} /> : <Navigate to="/" />}
        />
      </Routes >
    </Router >
  );
}

export default App;
