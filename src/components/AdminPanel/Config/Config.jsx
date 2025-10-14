import { Link } from "react-router-dom";
import "./Config.css";

const Config = () => {
  return (
    <div className="config-container">
      <h1 className="config-title">Painel Administrativo</h1>
      <div className="config-options">
        <Link to="/config/dashboard" className="config-button">
          <span className="config-icon">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/config/crud" className="config-button">
          <span className="config-icon">🏠</span>
          <span>Gerenciar Imóveis</span>
        </Link>
      </div>
    </div>
  );
};

export default Config;
