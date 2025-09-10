import { useState } from "react";
import { TiUserOutline } from "react-icons/ti";
import LoginModal from "./LoginModal";
import "./Header.css";

const Header = ({ setAdmLogged }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <header className="header">
      <nav className="nav container">
        <a href="#top" className="logo">
          <img
            src="/nolare-real-estate-logo-elegant.png"
            alt="NOLARE"
            className="logo-img"
          />
        </a>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <ul className={`menu ${menuOpen ? "menu-open" : ""}`}>
          <li>
            <a href="/comprar">Comprar</a>
          </li>
          <li>
            <a href="/alugar">Alugar</a>
          </li>
          <li>
            <a href="/anunciar">Anunciar</a>
          </li>
          <li>
            <a href="/sobre">Sobre Nós</a>
          </li>
        </ul>

        <a href="#" className="perfil-icon" onClick={() => setModalOpen(true)}>
          <TiUserOutline size={28} />
        </a>
      </nav>

      {modalOpen && (
        <LoginModal
          onClose={() => setModalOpen(false)}
          setAdmLogged={setAdmLogged} // Passa função para LoginModal
        />
      )}
    </header>
  );
};

export default Header;
