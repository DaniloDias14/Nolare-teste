"use client";
import { useNavigate } from "react-router-dom";
import { AiOutlineHeart } from "react-icons/ai";
import "./FloatingButton.css";

const UserFloatingButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/curtidas");
  };

  return (
    <div className="user-floating-button" onClick={handleClick}>
      <AiOutlineHeart size={26} />
    </div>
  );
};

export default UserFloatingButton;
