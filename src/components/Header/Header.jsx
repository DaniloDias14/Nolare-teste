"use client";

// Header.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { TiUserOutline } from "react-icons/ti";
import LoginModal from "./LoginModal";
import "./Header.css";
import logo_1 from "../../assets/img/logo_1.jpg";

const Header = ({ setAdmLogged, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const location = useLocation();

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMenuClick = () => {
    setMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <nav className="nav">
        {/* Logo */}
        <a href="/" className="logo" onClick={handleLogoClick}>
          <img
            src={logo_1 || "/placeholder.svg"}
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
            <Link
              to="/comprar"
              onClick={handleMenuClick}
              className={isActive("/comprar") ? "active" : ""}
            >
              Comprar
            </Link>
          </li>
          <li>
            <Link
              to="/alugar"
              onClick={handleMenuClick}
              className={isActive("/alugar") ? "active" : ""}
            >
              Alugar
            </Link>
          </li>
          <li>
            <Link
              to="/anunciar"
              onClick={handleMenuClick}
              className={isActive("/anunciar") ? "active" : ""}
            >
              Anunciar
            </Link>
          </li>
          <li>
            <Link
              to="/sobre-nos"
              onClick={handleMenuClick}
              className={isActive("/sobre-nos") ? "active" : ""}
            >
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
