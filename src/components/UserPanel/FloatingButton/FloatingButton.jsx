import React from "react";
import { useNavigate } from "react-router-dom";
import { AiFillHeart } from "react-icons/ai";
import "./FloatingButton.css";

const UserFloatingButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/curtidas");
  };

  return (
    <div className="user-floating-button" onClick={handleClick}>
      <AiFillHeart size={24} color="red" />
    </div>
  );
};

export default UserFloatingButton;
