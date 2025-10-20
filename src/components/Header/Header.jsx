"use client";

// Header.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { TiUserOutline } from "react-icons/ti";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = ({ setAdmLogged, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <nav className="nav">
        {/* Logo */}
        <a href="/" className="logo" onClick={handleLogoClick}>
          <img src="../logo_1.jpg" alt="Nolare" className="logo-img" />
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
            <Link to="/comprar" onClick={handleMenuClick}>
              Comprar
            </Link>
          </li>
          <li>
            <Link to="/alugar" onClick={handleMenuClick}>
              Alugar
            </Link>
          </li>
          <li>
            <Link to="/anunciar" onClick={handleMenuClick}>
              Anunciar
            </Link>
          </li>
          <li>
            <Link to="/sobre-nos" onClick={handleMenuClick}>
              Sobre Nós
            </Link>
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
