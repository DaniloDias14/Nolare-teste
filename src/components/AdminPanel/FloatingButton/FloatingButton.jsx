import React from "react";
import { Link } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import "./FloatingButton.css";

const FloatingButton = ({ showConfigOptions, setShowConfigOptions }) => {
  return (
    <div className="floating-container">
      {/* Botão principal ⚙️ */}
      <button
        className="floating-btn"
        onClick={() => setShowConfigOptions(!showConfigOptions)}
      >
        <FiSettings size={24} />
      </button>

      {/* Opções administrativas */}
      <div className={`config-options ${showConfigOptions ? "show" : ""}`}>
        <Link to="/config/dashboard" className="config-link">
          Dashboard
        </Link>
        <Link to="/config/crud" className="config-link">
          Gerenciar Imóveis
        </Link>
      </div>
    </div>
  );
};

export default FloatingButton;
