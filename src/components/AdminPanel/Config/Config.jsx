import React from "react";
import "./Config.css";

const Config = ({ onClose }) => {
  return (
    <div className="config-overlay">
      <div className="config-panel">
        <h2>Painel Administrativo</h2>
        <p>Aqui você poderá gerenciar os imóveis futuramente.</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
};

export default Config;
