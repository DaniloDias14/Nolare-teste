import React, { useState } from "react";
import "./ImovelModal.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const ImovelModal = ({ imovel, onClose, usuario }) => {
  const [fotoIndex, setFotoIndex] = useState(0);
  const [curtido, setCurtido] = useState(false);

  if (!imovel) return null;

  const fotos = imovel.fotos || [];

  const handlePrev = () => {
    setFotoIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setFotoIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  const toggleCurtida = () => {
    if (!usuario) {
      alert("Você precisa fazer login para curtir os imóveis!");
      return;
    }
    if (usuario.tipo_usuario === "adm") {
      alert("Você é adm, não pode curtir!");
      return;
    }
    setCurtido((prev) => !prev);
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        {fotos.length > 0 && (
          <div className="modal-foto-container">
            <button className="nav-btn prev" onClick={handlePrev}>
              ◀
            </button>
            <img
              src={fotos[fotoIndex].caminho_foto}
              alt={`Foto ${fotoIndex + 1}`}
              className="modal-foto"
            />
            <button className="nav-btn next" onClick={handleNext}>
              ▶
            </button>
          </div>
        )}

        <div className="modal-content">
          <h2>{imovel.titulo}</h2>
          <div className="property-detail">
            <strong>Descrição:</strong> {imovel.descricao || "-"}
          </div>
          <div className="property-detail">
            <strong>Preço:</strong> R$ {imovel.preco || "-"}
          </div>
          <div className="property-detail">
            <strong>Endereço:</strong> {imovel.endereco || "-"}
          </div>
          {imovel.tipo_imovel && (
            <div className="property-detail">
              <strong>Tipo:</strong> {imovel.tipo_imovel}
            </div>
          )}

          <button
            className="like-btn-modal"
            onClick={toggleCurtida}
            style={{ marginTop: "12px" }}
          >
            {curtido ? (
              <AiFillHeart size={24} color="red" />
            ) : (
              <AiOutlineHeart size={24} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImovelModal;
