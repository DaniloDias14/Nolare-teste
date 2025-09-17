import React from "react";
import { Link } from "react-router-dom";
import "./Config.css";

const Config = () => {
  return (
    <div className="config-container">
      <h1>Painel Administrativo</h1>
      <div className="config-options">
        <Link to="/config/dashboard" className="config-button">
          Dashboard
        </Link>
        <Link to="/config/crud" className="config-button">
          Gerenciar Imóveis (CRUD)
        </Link>
      </div>
    </div>
  );
};

export default Config;
