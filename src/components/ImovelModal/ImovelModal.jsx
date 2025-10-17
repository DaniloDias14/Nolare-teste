"use client";

import { useState, useEffect } from "react";
import "./ImovelModal.css";
import { AiFillHeart, AiOutlineHeart, AiOutlineClose } from "react-icons/ai";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

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
  const [caracteristicas, setCaracteristicas] = useState(null);

  useEffect(() => {
    if (!imovel) return;

    const imovelId = imovel.id ?? imovel.imovel_id;

    fetch(`http://localhost:5000/api/imoveis/${imovelId}`)
      .then((res) => res.json())
      .then((data) => {
        setCaracteristicas(data.caracteristicas || {});
      })
      .catch((err) => console.error("Erro ao buscar características:", err));
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

  const formatLabel = (key) => {
    if (key === "id" || key === "imovel_id") return null;

    const labels = {
      quarto: "Quartos",
      suite: "Suíte",
      banheiro: "Banheiros",
      vaga: "Vagas",
      andar: "Andar",
      andar_total: "Total de Andares",
      condominio: "Condomínio",
      iptu: "IPTU",
      ar_condicionado: "Ar-Condicionado",
      construtora: "Construtora",
      acessibilidade_pcd: "Acessibilidade PCD",
      aceita_animais: "Aceita Animais",
      academia: "Academia",
      alarme: "Alarme",
      bicicletario: "Bicicletário",
      brinquedoteca: "Brinquedoteca",
      camera_vigilancia: "Câmera de Vigilância",
      carregador_carro_eletrico: "Carregador Carro Elétrico",
      churrasqueira: "Churrasqueira",
      closet: "Closet",
      elevador: "Elevador",
      energia_solar: "Energia Solar",
      escritorio: "Escritório",
      estudio: "Estúdio",
      gerador_energia: "Gerador de Energia",
      interfone: "Interfone",
      jardim: "Jardim",
      lago: "Lago",
      lareira: "Lareira",
      lavanderia: "Lavanderia",
      mobiliado: "Mobiliado",
      na_planta: "Na Planta",
      piscina: "Piscina",
      playground: "Playground",
      pomar: "Pomar",
      portaria_24h: "Portaria 24h",
      quadra: "Quadra",
      sala_jogos: "Sala de Jogos",
      salao_de_festa: "Salão de Festa",
      varanda: "Varanda",
    };
    return labels[key] || key.replace(/_/g, " ");
  };

  const imovelId = imovel.id ?? imovel.imovel_id;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content-wrapper">
        <button className="modal-close-btn" onClick={onClose}>
          <AiOutlineClose />
        </button>

        <div className="modal-gallery">
          {fotos.length > 0 ? (
            <>
              <button className="modal-nav-btn modal-prev" onClick={handlePrev}>
                <IoChevronBack />
              </button>
              <img
                src={`http://localhost:5000${fotos[fotoIndex]?.caminho_foto}`}
                alt={`Foto ${fotoIndex + 1}`}
                className="modal-image"
              />
              <button className="modal-nav-btn modal-next" onClick={handleNext}>
                <IoChevronForward />
              </button>
              <div className="modal-dots-container">
                {fotos.map((_, index) => (
                  <button
                    key={index}
                    className={`modal-dot ${
                      index === fotoIndex ? "active" : ""
                    }`}
                    onClick={() => setFotoIndex(index)}
                    aria-label={`Ir para foto ${index + 1}`}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="modal-no-image">Sem imagens disponíveis</div>
          )}
        </div>

        <div className="modal-info">
          <div className="modal-header">
            <h2 className="modal-title">
              {imovel.titulo} <span className="modal-id">#{imovelId}</span>
            </h2>
          </div>

          <div className="modal-price">
            R${" "}
            {(imovel.preco || 0).toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>

          <div className="modal-section">
            <h3>Descrição</h3>
            <p>{imovel.descricao || "Sem descrição disponível"}</p>
          </div>

          <div className="modal-section">
            <h3>Localização</h3>
            <div className="modal-grid">
              {imovel.cep && (
                <div className="modal-item">
                  <strong>CEP:</strong> {imovel.cep}
                </div>
              )}
              {imovel.estado && (
                <div className="modal-item">
                  <strong>Estado:</strong> {imovel.estado}
                </div>
              )}
              {imovel.cidade && (
                <div className="modal-item">
                  <strong>Cidade:</strong> {imovel.cidade}
                </div>
              )}
              {imovel.bairro && (
                <div className="modal-item">
                  <strong>Bairro:</strong> {imovel.bairro}
                </div>
              )}
            </div>
          </div>

          <div className="modal-section">
            <h3>Informações Gerais</h3>
            <div className="modal-grid">
              {imovel.tipo && (
                <div className="modal-item">
                  <strong>Tipo:</strong> {imovel.tipo}
                </div>
              )}
              {imovel.finalidade && (
                <div className="modal-item">
                  <strong>Finalidade:</strong> {imovel.finalidade}
                </div>
              )}
              {imovel.status && (
                <div className="modal-item">
                  <strong>Status:</strong> {imovel.status}
                </div>
              )}
              {imovel.area_total && (
                <div className="modal-item">
                  <strong>Área Total:</strong> {imovel.area_total} m²
                </div>
              )}
              {imovel.area_construida && (
                <div className="modal-item">
                  <strong>Área Construída:</strong> {imovel.area_construida} m²
                </div>
              )}
            </div>
          </div>

          {caracteristicas && Object.keys(caracteristicas).length > 0 && (
            <div className="modal-section">
              <h3>Características</h3>
              <div className="modal-features">
                {Object.entries(caracteristicas).map(([key, value]) => {
                  if (key === "id" || key === "imovel_id") return null;
                  if (key === "mobiliado" && value === false) {
                    return (
                      <span key={key} className="modal-feature-tag">
                        Não Mobiliado
                      </span>
                    );
                  }
                  if (value === null || value === undefined || value === false)
                    return null;

                  const label = formatLabel(key);
                  if (!label) return null;

                  if (typeof value === "boolean" && value === true) {
                    return (
                      <span key={key} className="modal-feature-tag">
                        {label}
                      </span>
                    );
                  }

                  if (
                    typeof value === "number" ||
                    (typeof value === "string" && value.trim() !== "")
                  ) {
                    return (
                      <span key={key} className="modal-feature-tag">
                        {label}: {value}
                      </span>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button
              className="modal-contact-btn"
              onClick={() => window.open("https://www.youtube.com", "_blank")}
            >
              Entrar em Contato
            </button>
            <button className="modal-like-btn" onClick={toggleCurtida}>
              {curtido ? (
                <AiFillHeart size={32} color="#191970" />
              ) : (
                <AiOutlineHeart size={32} color="#191970" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImovelModal;
