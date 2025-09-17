import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import FloatingButton from "./components/AdminPanel/FloatingButton/FloatingButton.jsx";

import Comprar from "./components/Pages/Comprar/Comprar.jsx";
import Alugar from "./components/Pages/Alugar/Alugar.jsx";
import Anunciar from "./components/Pages/Anunciar/Anunciar.jsx";
import SobreNos from "./components/Pages/SobreNos/SobreNos.jsx";

import Dashboard from "./components/AdminPanel/Config/Dashboard/Dashboard.jsx";
import CRUD from "./components/AdminPanel/Config/CRUD/CRUD.jsx";

import "./index.css";

function App() {
  const [admLogged, setAdmLogged] = useState(false); // controla adm
  const [showConfigOptions, setShowConfigOptions] = useState(false); // animação do botão ⚙️

  return (
    <>
      <Header setAdmLogged={setAdmLogged} />

      {/* FloatingButton apenas para admins */}
      {admLogged && (
        <FloatingButton
          showConfigOptions={showConfigOptions}
          setShowConfigOptions={setShowConfigOptions}
        />
      )}

      {/* Rotas da aplicação */}
      <Routes>
        <Route path="/" element={<Comprar />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="/alugar" element={<Alugar />} />
        <Route path="/anunciar" element={<Anunciar />} />
        <Route path="/sobre-nos" element={<SobreNos />} />

        {/* Rotas admin */}
        <Route path="/config/dashboard" element={<Dashboard />} />
        <Route path="/config/crud" element={<CRUD />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
