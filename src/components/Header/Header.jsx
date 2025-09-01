"use client";

import { useState } from "react";
import { TiUserOutline } from "react-icons/ti";
import "./Header.css"; // Importa o CSS

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false); // Estado para abrir/fechar o menu no mobile

  const toggleMenu = () => setMenuOpen(!menuOpen); // Função que alterna o estado do menu

  return (
    <header className="header">
      {/* Barra de navegação */}
      <nav
        className="nav container"
        role="navigation"
        aria-label="Menu principal"
      >
        {/* Logo - Ao clicar, volta para o topo */}
        <a href="#top" className="logo" aria-label="Ir para o topo da página">
          <img
            src="/nolare-real-estate-logo-elegant.png"
            alt="NOLARE"
            className="logo-img"
          />
        </a>

        {/* Botão do menu hamburguer (aparece no mobile) */}
        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Menu de navegação */}
        <ul className={`menu ${menuOpen ? "menu-open" : ""}`}>
          <li>
            <a href="/comprar" onClick={() => setMenuOpen(false)}>
              Comprar
            </a>
          </li>
          <li>
            <a href="/alugar" onClick={() => setMenuOpen(false)}>
              Alugar
            </a>
          </li>
          <li>
            <a href="/anunciar" onClick={() => setMenuOpen(false)}>
              Anunciar
            </a>
          </li>
          <li>
            <a href="/sobre" onClick={() => setMenuOpen(false)}>
              Sobre Nós
            </a>
          </li>
        </ul>

        {/* Ícone de perfil */}
        <a
          href="/perfil"
          className="perfil-icon"
          aria-label="Perfil do usuário"
        >
          <TiUserOutline size={28} />
        </a>
      </nav>
    </header>
  );
};

export default Header;
