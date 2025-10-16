"use client";

import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import Comprar from "./components/Pages/Comprar/Comprar";
import Alugar from "./components/Pages/Alugar/Alugar";
import Anunciar from "./components/Pages/Anunciar/Anunciar";
import SobreNos from "./components/Pages/SobreNos/SobreNos";

import Dashboard from "./components/AdminPanel/Dashboard/Dashboard";
import AdicionarImovel from "./components/AdminPanel/AdicionarImovel/AdicionarImovel";

import AdminFloatingButton from "./components/AdminPanel/FloatingButtonAdmin/FloatingButtonAdmin";
import UserFloatingButton from "./components/UserPanel/FloatingButton/FloatingButton";
import Curtidas from "./components/UserPanel/Curtidas/Curtidas.jsx";

const App = () => {
  const [admLogged, setAdmLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showConfigOptions, setShowConfigOptions] = useState(false);
  const [showAdicionarImovelPopup, setShowAdicionarImovelPopup] =
    useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isDashboardRoute = location.pathname === "/config/dashboard";

  useEffect(() => {
    const savedUser = localStorage.getItem("nolare_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setAdmLogged(parsedUser.tipo_usuario === "adm");
      setIsLoggedIn(true);
    }
  }, []);

  const handleAdicionarImovelClick = () => {
    setShowAdicionarImovelPopup(true);
    setShowConfigOptions(false);
  };

  const handleDashboardClick = () => {
    navigate("/config/dashboard");
    setShowConfigOptions(false);
  };

  return (
    <div className="app-container">
      {!isDashboardRoute && (
        <Header
          setAdmLogged={setAdmLogged}
          setUser={(userData) => {
            setUser(userData);
            setIsLoggedIn(true);
          }}
        />
      )}

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/comprar" replace />} />
          <Route
            path="/comprar"
            element={<Comprar usuario={isLoggedIn ? user : null} />}
          />
          <Route
            path="/alugar"
            element={<Alugar usuario={isLoggedIn ? user : null} />}
          />
          <Route
            path="/anunciar"
            element={<Anunciar usuario={isLoggedIn ? user : null} />}
          />
          <Route path="/sobre-nos" element={<SobreNos />} />
          <Route path="/config/dashboard" element={<Dashboard />} />
          <Route
            path="/curtidas"
            element={<Curtidas usuario={isLoggedIn ? user : null} />}
          />
        </Routes>
      </main>

      {!isDashboardRoute && <Footer />}

      {admLogged && (
        <>
          <AdminFloatingButton
            showConfigOptions={showConfigOptions}
            setShowConfigOptions={setShowConfigOptions}
            onAdicionarImovelClick={handleAdicionarImovelClick}
            onDashboardClick={handleDashboardClick}
          />
          <AdicionarImovel
            showPopup={showAdicionarImovelPopup}
            setShowPopup={setShowAdicionarImovelPopup}
          />
        </>
      )}

      {isLoggedIn && user && user.tipo_usuario === "user" && (
        <UserFloatingButton user={user} />
      )}
    </div>
  );
};

export default App;
