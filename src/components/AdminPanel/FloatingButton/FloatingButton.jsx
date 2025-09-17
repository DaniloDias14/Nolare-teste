import React from "react";
import { Link } from "react-router-dom";
import "./FloatingButton.css";

const FloatingButton = ({ showConfigOptions, setShowConfigOptions }) => {
  return (
    <div className="floating-container">
      <button
        className="floating-button"
        onClick={() => setShowConfigOptions(!showConfigOptions)}
      >
        ⚙️
      </button>

      <div className={`config-options ${showConfigOptions ? "show" : ""}`}>
        <Link to="/config/dashboard" className="config-link">
          Dashboard
        </Link>
        <Link to="/config/crud" className="config-link">
          CRUD
        </Link>
      </div>
    </div>
  );
};

export default FloatingButton;
