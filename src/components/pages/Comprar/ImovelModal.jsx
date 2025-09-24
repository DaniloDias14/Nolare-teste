import React, { useState } from "react";
import "./ImovelModal.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const ImovelModal = ({ imovel, onClose, usuario, curtidas, setCurtidas }) => {
  const [fotoIndex, setFotoIndex] = useState(0);

  if (!imovel) return null;

  const fotos = imovel.fotos || [];
  const curtido = !!curtidas[imovel.id];

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

  const toggleCurtida = async () => {
    if (!usuario) {
      alert("Você precisa fazer login para curtir os imóveis!");
      return;
    }

    // Bloquear ADM
    if (usuario.tipo_usuario === "adm") {
      alert("Administradores não podem curtir imóveis.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/curtidas/${usuario.id}/${imovel.id}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      setCurtidas((prev) => ({
        ...prev,
        [imovel.id]: !prev[imovel.id],
      }));
    } catch (err) {
      console.error(err);
      alert("Não foi possível curtir/descurtir o imóvel.");
    }
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

          <button className="like-btn-modal" onClick={toggleCurtida}>
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
