import React from "react";
import { FaHeart } from "react-icons/fa";
import "./FloatingButton.css";

const UserFloatingButton = ({ user }) => {
  // Só aparece se o nível do usuário for "user"
  if (!user || user.tipo_usuario !== "user") return null;

  return (
    <div className="floating-container-user">
      <button className="floating-btn-user">
        <FaHeart size={22} />
      </button>
    </div>
  );
};

export default UserFloatingButton;
