"use client";
import { FiSettings } from "react-icons/fi";
import "./FloatingButtonAdmin.css";

const FloatingButtonAdmin = ({
  showConfigOptions,
  setShowConfigOptions,
  onAdicionarImovelClick,
  onDashboardClick,
}) => {
  return (
    <div className="floating-container">
      {/* Botão principal */}
      <button
        className="floating-btn"
        onClick={() => setShowConfigOptions(!showConfigOptions)}
      >
        <FiSettings size={24} />
      </button>

      {/* Opções administrativas */}
      <div className={`config-options ${showConfigOptions ? "show" : ""}`}>
        <button onClick={onDashboardClick} className="config-link">
          Dashboard
        </button>
        <button onClick={onAdicionarImovelClick} className="config-link">
          Adicionar Imóvel
        </button>
      </div>
    </div>
  );
};

export default FloatingButtonAdmin;
