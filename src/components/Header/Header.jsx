// Header.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { TiUserOutline } from "react-icons/ti";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = ({ setAdmLogged, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogoClick = (e) => {
    e.preventDefault(); // previne comportamento padrão do Link
    window.scrollTo({ top: 0, behavior: "smooth" }); // volta para o topo
  };

  return (
    <header className="header">
      <nav className="nav">
        {/* Logo */}
        <a href="/" className="logo" onClick={handleLogoClick}>
          <img
            src="/nolare-real-estate-logo-elegant.png"
            alt="Nolare"
            className="logo-img"
          />
        </a>

        {/* Hamburger para mobile */}
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Links do menu */}
        <ul className={`menu ${menuOpen ? "menu-open" : ""}`}>
          <li>
            <Link to="/comprar">Comprar</Link>
          </li>
          <li>
            <Link to="/alugar">Alugar</Link>
          </li>
          <li>
            <Link to="/anunciar">Anunciar</Link>
          </li>
          <li>
            <Link to="/sobre-nos">Sobre Nós</Link>
          </li>
        </ul>

        {/* Ícone de perfil para abrir login modal */}
        <button className="perfil-icon" onClick={() => setModalOpen(true)}>
          <TiUserOutline size={28} />
        </button>
      </nav>

      {/* Modal de login */}
      {modalOpen && (
        <LoginModal
          onClose={() => setModalOpen(false)}
          setAdmLogged={setAdmLogged}
          setUser={setUser}
        />
      )}
    </header>
  );
};

export default Header;
