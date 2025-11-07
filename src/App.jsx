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

// Páginas públicas
import Comprar from "./components/Pages/Comprar/Comprar";
import Alugar from "./components/Pages/Alugar/Alugar";
import Anunciar from "./components/Pages/Anunciar/Anunciar";
import SobreNos from "./components/Pages/SobreNos/SobreNos";
import ImovelPage from "./components/Pages/ImovelPage/ImovelPage";

// Painel administrativo
import Dashboard from "./components/AdminPanel/Dashboard/Dashboard";
import AdicionarImovel from "./components/AdminPanel/AdicionarImovel/AdicionarImovel";
import EditarImovel from "./components/AdminPanel/EditarImovel/EditarImovel";

// Botões flutuantes e painel do usuário
import AdminFloatingButton from "./components/AdminPanel/FloatingButtonAdmin/FloatingButtonAdmin";
import UserFloatingButton from "./components/UserPanel/FloatingButtonUser/FloatingButtonUser";
import Curtidas from "./components/UserPanel/Curtidas/Curtidas.jsx";

const App = () => {
  // Estados de autenticação e controle de usuário
  const [admLogged, setAdmLogged] = useState(false); // Controla se o usuário é administrador
  const [user, setUser] = useState(null); // Armazena dados do usuário logado
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Controla se há usuário logado

  // Estados de controle de interface
  const [showConfigOptions, setShowConfigOptions] = useState(false); // Controla menu de opções do admin
  const [showAdicionarImovelPopup, setShowAdicionarImovelPopup] =
    useState(false); // Controla popup de adicionar imóvel
  const [showEditarImovelPopup, setShowEditarImovelPopup] = useState(false);
  const [imovelIdToEdit, setImovelIdToEdit] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Verifica se está na rota do dashboard para ocultar Header/Footer
  const isDashboardRoute = location.pathname === "/config/dashboard";

  // Recupera dados do usuário do localStorage ao carregar a aplicação
  useEffect(() => {
    const savedUser = localStorage.getItem("nolare_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setAdmLogged(parsedUser.tipo_usuario === "adm");
      setIsLoggedIn(true);
    }
  }, []);

  // Abre popup de adicionar imóvel (apenas para admin)
  const handleAdicionarImovelClick = () => {
    setShowAdicionarImovelPopup(true);
    setShowConfigOptions(false);
  };

  // Navega para o dashboard (apenas para admin)
  const handleDashboardClick = () => {
    navigate("/config/dashboard");
    setShowConfigOptions(false);
  };

  // Atualiza estado de login quando usuário faz login via Header
  const handleUserLogin = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    setAdmLogged(userData.tipo_usuario === "adm");
  };

  // Abre popup de editar imóvel com imóvel data (apenas para admin)
  const handleEditarImovelClick = (imovelId) => {
    setImovelIdToEdit(imovelId);
    setShowEditarImovelPopup(true);
    setShowConfigOptions(false);
  };

  return (
    <div className="app-container">
      {/* Header é ocultado apenas na rota do dashboard */}
      {!isDashboardRoute && (
        <Header setAdmLogged={setAdmLogged} setUser={handleUserLogin} />
      )}

      {/* Rotas principais da aplicação */}
      <main>
        <Routes>
          {/* Redireciona raiz para /comprar */}
          <Route path="/" element={<Navigate to="/comprar" replace />} />

          {/* Páginas públicas */}
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

          {/* Rota para visualização de imóvel individual (compartilhamento) */}
          <Route
            path="/imovel/:id"
            element={<ImovelPage usuario={isLoggedIn ? user : null} />}
          />

          {/* Painel administrativo */}
          <Route path="/config/dashboard" element={<Dashboard />} />

          {/* Página de curtidas (requer login) */}
          <Route
            path="/curtidas"
            element={<Curtidas usuario={isLoggedIn ? user : null} />}
          />
        </Routes>
      </main>

      {/* Footer é ocultado apenas na rota do dashboard */}
      {!isDashboardRoute && <Footer />}

      {/* Botão flutuante e popup de adicionar imóvel (apenas para admin) */}
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
          {/* Popup de editar imóvel */}
          <EditarImovel
            showPopup={showEditarImovelPopup}
            setShowPopup={setShowEditarImovelPopup}
            imovelId={imovelIdToEdit}
          />
        </>
      )}

      {/* Botão flutuante para usuários comuns (apenas quando logado) */}
      {isLoggedIn && user && user.tipo_usuario === "user" && (
        <UserFloatingButton user={user} />
      )}
    </div>
  );
};

export default App;
