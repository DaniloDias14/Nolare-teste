"use client";

import { useState, useEffect } from "react";
import "./ImovelModal.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const ImovelModal = ({
  imovel,
  onClose,
  usuario,
  curtidas,
  setCurtidas,
  onDescurtir,
  onCurtir,
}) => {
  const [fotoIndex, setFotoIndex] = useState(0);
  const [caracteristicas, setCaracteristicas] = useState({});

  useEffect(() => {
    if (!imovel) return;

    const camposCaracteristicas = [
      "quarto",
      "suite",
      "banheiro",
      "vaga",
      "andar",
      "andar_total",
      "mobiliado",
      "piscina",
      "churrasqueira",
      "salao_de_festa",
      "academia",
      "playground",
      "jardim",
      "varanda",
      "interfone",
      "acessibilidade_pcd",
      "ar_condicionado",
      "energia_solar",
      "quadra",
      "lavanderia",
      "closet",
      "escritorio",
      "lareira",
      "alarme",
      "camera_vigilancia",
      "bicicletario",
      "sala_jogos",
      "brinquedoteca",
      "elevador",
      "pomar",
      "lago",
      "aceita_animais",
      "construtora",
    ];

    const obj = {};
    camposCaracteristicas.forEach((campo) => {
      if (imovel[campo] !== undefined && imovel[campo] !== null) {
        obj[campo] = imovel[campo];
      }
    });

    setCaracteristicas(obj);
  }, [imovel]);

  if (!imovel) return null;

  const fotos = imovel.fotos || [];
  const curtido = !!curtidas[imovel.id ?? imovel.imovel_id];

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

    if (usuario.tipo_usuario === "adm") {
      alert("Administradores não podem curtir imóveis.");
      return;
    }

    try {
      // Corrigido: ordem correta usuario.id / imovel.id
      const res = await fetch(
        `http://localhost:5000/api/curtidas/${usuario.id}/${
          imovel.id ?? imovel.imovel_id
        }`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      setCurtidas((prev) => {
        const atualizado = {
          ...prev,
          [imovel.id ?? imovel.imovel_id]: !prev[imovel.id ?? imovel.imovel_id],
        };

        if (
          prev[imovel.id ?? imovel.imovel_id] &&
          !atualizado[imovel.id ?? imovel.imovel_id] &&
          onDescurtir
        ) {
          onDescurtir(imovel.id ?? imovel.imovel_id);
        }

        if (
          !prev[imovel.id ?? imovel.imovel_id] &&
          atualizado[imovel.id ?? imovel.imovel_id] &&
          onCurtir
        ) {
          onCurtir(imovel.id ?? imovel.imovel_id);
        }

        return atualizado;
      });
    } catch (err) {
      console.error(err);
      alert("Não foi possível curtir/descurtir o imóvel.");
    }
  };

  const renderCaracteristicas = () => {
    if (!caracteristicas || Object.keys(caracteristicas).length === 0)
      return null;

    return (
      <div className="features-container">
        {Object.entries(caracteristicas).map(([key, value]) => {
          if (value === true) {
            return (
              <span key={key} className="feature-item">
                {key.replace(/_/g, " ")} ✅
              </span>
            );
          } else if (value || value === 0) {
            return (
              <span key={key} className="feature-item">
                {key.replace(/_/g, " ").charAt(0).toUpperCase() +
                  key.replace(/_/g, " ").slice(1)}
                : {value}
              </span>
            );
          }
          return null;
        })}
      </div>
    );
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
              src={fotos[fotoIndex]?.caminho_foto}
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
            <strong>Status:</strong> {imovel.status || "-"}
          </div>
          <div className="property-detail">
            <strong>Finalidade:</strong> {imovel.finalidade || "-"}
          </div>
          <div className="property-detail">
            <strong>CEP:</strong> {imovel.cep || "-"}
          </div>
          <div className="property-detail">
            <strong>Estado:</strong> {imovel.estado || "-"}
          </div>
          <div className="property-detail">
            <strong>Cidade:</strong> {imovel.cidade || "-"}
          </div>
          <div className="property-detail">
            <strong>Bairro:</strong> {imovel.bairro || "-"}
          </div>
          <div className="property-detail">
            <strong>Área Total:</strong> {imovel.area_total || "-"} m²
          </div>
          <div className="property-detail">
            <strong>Área Construída:</strong> {imovel.area_construida || "-"} m²
          </div>

          {renderCaracteristicas()}

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
