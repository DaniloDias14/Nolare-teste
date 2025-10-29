"use client";

import { useState, useEffect, useRef } from "react";
import "./ImovelModal.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import compartilhar from "../../assets/img/compartilhar.jpg";

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
  const [showCopyMessage, setShowCopyMessage] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslate, setCurrentTranslate] = useState(0);
  const [prevTranslate, setPrevTranslate] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const galleryRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 968);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  useEffect(() => {
    setImageError(false);
  }, [fotoIndex]);

  useEffect(() => {
    if (!imovel || !imovel.fotos || imovel.fotos.length === 0) return;

    const fotos = imovel.fotos;

    // Pré-carregar todas as imagens
    fotos.forEach((foto) => {
      const img = new Image();
      img.src = `http://localhost:5000${foto.caminho_foto}`;
    });
  }, [imovel]);

  useEffect(() => {
    if (!imovel || !imovel.fotos || imovel.fotos.length === 0) return;

    const fotos = imovel.fotos;

    // Pré-carregar imagem atual
    const currentImg = new Image();
    currentImg.src = `http://localhost:5000${fotos[fotoIndex]?.caminho_foto}`;

    // Pré-carregar imagem anterior
    const prevIndex = fotoIndex - 1 >= 0 ? fotoIndex - 1 : fotos.length - 1;
    const prevImg = new Image();
    prevImg.src = `http://localhost:5000${fotos[prevIndex]?.caminho_foto}`;

    // Pré-carregar próxima imagem
    const nextIndex = fotoIndex + 1 < fotos.length ? fotoIndex + 1 : 0;
    const nextImg = new Image();
    nextImg.src = `http://localhost:5000${fotos[nextIndex]?.caminho_foto}`;

    // Pré-carregar também a segunda próxima imagem para scroll mais rápido
    const nextNextIndex =
      fotoIndex + 2 < fotos.length
        ? fotoIndex + 2
        : (fotoIndex + 2) % fotos.length;
    const nextNextImg = new Image();
    nextNextImg.src = `http://localhost:5000${fotos[nextNextIndex]?.caminho_foto}`;
  }, [fotoIndex, imovel]);

  useEffect(() => {
    setPositionByIndex();
  }, [fotoIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (galleryRef.current) {
        setPositionByIndex();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fotoIndex]);

  if (!imovel) return null;

  const fotos = imovel.fotos || [];
  const curtido = !!curtidas[imovel.id ?? imovel.imovel_id];

  const formatPrice = (value) => {
    if (!value || value === 0) return "0,00";

    const numValue =
      typeof value === "string" ? Number.parseFloat(value) : value;

    // Convert to cents
    const cents = Math.round(numValue * 100);

    // Separate integer and decimal parts
    const intPart = Math.floor(cents / 100);
    const decPart = (cents % 100).toString().padStart(2, "0");

    // Format integer part with dots
    const formattedInt = intPart
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedInt},${decPart}`;
  };

  const extractCoordinates = (input) => {
    if (!input) return null;
    const cleaned = input.trim();
    const pattern = /(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/;
    const match = cleaned.match(pattern);

    if (match) {
      return {
        lat: Number.parseFloat(match[1]),
        lng: Number.parseFloat(match[2]),
      };
    }

    return null;
  };

  const getMapEmbedUrl = () => {
    if (!imovel.coordenadas) return null;

    const coords = extractCoordinates(imovel.coordenadas);
    if (!coords) return null;

    if (coords.lat < -90 || coords.lat > 90) return null;
    if (coords.lng < -180 || coords.lng > 180) return null;

    return `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;
  };

  const setPositionByIndex = () => {
    if (!galleryRef.current) return;
    const width = galleryRef.current.clientWidth;
    const newTranslate = -fotoIndex * width;
    setCurrentTranslate(newTranslate);
    setPrevTranslate(newTranslate);
  };

  const handlePrev = () => {
    if (fotoIndex > 0) {
      setFotoIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (fotoIndex < fotos.length - 1) {
      setFotoIndex((prev) => prev + 1);
    }
  };

  const handleStart = (clientX) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(clientX);
    setPrevTranslate(currentTranslate);
  };

  const handleMove = (clientX) => {
    if (!isDragging || !isMobile || !galleryRef.current) return;

    const diff = clientX - startX;
    const width = galleryRef.current.clientWidth;

    // Apply resistance at edges
    const isAtFirst = fotoIndex === 0 && diff > 0;
    const isAtLast = fotoIndex === fotos.length - 1 && diff < 0;

    if (isAtFirst || isAtLast) {
      setCurrentTranslate(prevTranslate + diff * 0.15);
    } else {
      setCurrentTranslate(prevTranslate + diff);
    }
  };

  const handleEnd = () => {
    if (!isDragging || !isMobile || !galleryRef.current) return;
    setIsDragging(false);

    const width = galleryRef.current.clientWidth;
    const movedBy = currentTranslate - -fotoIndex * width;

    // Check if should change slide
    if (movedBy < -50 && fotoIndex < fotos.length - 1) {
      setFotoIndex(fotoIndex + 1);
    } else if (movedBy > 50 && fotoIndex > 0) {
      setFotoIndex(fotoIndex - 1);
    } else {
      // Elastic bounce effect at edges
      const isAtFirst = fotoIndex === 0 && movedBy > 50;
      const isAtLast = fotoIndex === fotos.length - 1 && movedBy < -50;

      if (isAtFirst || isAtLast) {
        const offset = isAtFirst ? 35 : -35;
        setCurrentTranslate(-fotoIndex * width + offset);
        setTimeout(() => {
          setCurrentTranslate(-fotoIndex * width);
          setPrevTranslate(-fotoIndex * width);
        }, 200);
      } else {
        setPositionByIndex();
      }
    }
  };

  const handleTouchStart = (e) => {
    handleStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    handleEnd();
  };

  const handleMouseDown = (e) => {
    handleStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    handleEnd();
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      handleEnd();
    }
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
      const estaCurtido = curtidas[imovel.id ?? imovel.imovel_id];

      const res = await fetch(
        `http://localhost:5000/api/curtidas/${usuario.id}/${
          imovel.id ?? imovel.imovel_id
        }`,
        {
          method: "POST",
        }
      );
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      if (!estaCurtido) {
        setIsHeartAnimating(true);
        setTimeout(() => setIsHeartAnimating(false), 600);
      }

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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShowCopyMessage(true);
      setTimeout(() => setShowCopyMessage(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar link:", err);
      alert("Não foi possível copiar o link");
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
  const mapEmbedUrl = getMapEmbedUrl();

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content-wrapper">
        <button className="close-popup-btn" onClick={onClose}>
          ×
        </button>

        <button
          className="share-btn"
          onClick={handleShare}
          title="Compartilhar imóvel"
        >
          <img src={compartilhar || "/placeholder.svg"} alt="Compartilhar" />
        </button>

        {showCopyMessage && <div className="copy-message">Link copiado!</div>}

        <div
          className="modal-gallery"
          ref={galleryRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          {fotos.length > 0 ? (
            <>
              <button
                className={`modal-carousel-btn prev ${
                  fotoIndex === 0 ? "disabled" : ""
                }`}
                onClick={handlePrev}
                disabled={fotoIndex === 0}
                aria-label="Foto anterior"
              >
                🡰
              </button>
              <div
                className="modal-image-track"
                ref={trackRef}
                style={{
                  transform: `translateX(${currentTranslate}px)`,
                  transition: isDragging
                    ? "none"
                    : currentTranslate !==
                      -fotoIndex * (galleryRef.current?.clientWidth || 0)
                    ? "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)"
                    : "transform 0.32s cubic-bezier(0.22, 0.9, 0.2, 1)",
                }}
              >
                {fotos.map((foto, index) => (
                  <div key={index} className="modal-image-container">
                    <img
                      src={`http://localhost:5000${foto.caminho_foto}`}
                      alt={`Foto ${index + 1}`}
                      className="modal-image"
                      onError={() => index === fotoIndex && setImageError(true)}
                      style={{
                        display:
                          imageError && index === fotoIndex ? "none" : "block",
                      }}
                      draggable="false"
                    />
                    {imageError && index === fotoIndex && (
                      <div className="image-error">Erro ao carregar imagem</div>
                    )}
                  </div>
                ))}
              </div>
              <button
                className={`modal-carousel-btn next ${
                  fotoIndex === fotos.length - 1 ? "disabled" : ""
                }`}
                onClick={handleNext}
                disabled={fotoIndex === fotos.length - 1}
                aria-label="Próxima foto"
              >
                🡲
              </button>
              <div className="dots-container">
                {fotos.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === fotoIndex ? "active" : ""}`}
                    onClick={() => setFotoIndex(index)}
                    aria-label={`Ir para foto ${index + 1}`}
                  />
                ))}
              </div>
              <div className="thumbnails-container">
                {fotos.map((foto, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${
                      index === fotoIndex ? "active" : ""
                    }`}
                    onClick={() => setFotoIndex(index)}
                    aria-label={`Ver foto ${index + 1}`}
                  >
                    <img
                      src={`http://localhost:5000${foto.caminho_foto}`}
                      alt={`Miniatura ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="no-image">Sem imagens disponíveis</div>
          )}
        </div>

        <div className="modal-info">
          <div className="modal-info-content">
            <div className="header-section">
              <h2 className="title">
                {imovel.titulo} <span className="id-badge">#{imovelId}</span>
              </h2>
            </div>

            <div className="price-section">R$ {formatPrice(imovel.preco)}</div>

            {imovel.descricao && (
              <div className="content-section">
                <h3>Descrição</h3>
                <p>{imovel.descricao}</p>
              </div>
            )}

            <div className="content-section">
              <h3>Informações Gerais</h3>
              <div className="info-grid">
                {imovel.tipo && (
                  <div className="info-item">
                    <strong>Tipo:</strong> {imovel.tipo}
                  </div>
                )}
                {imovel.finalidade && (
                  <div className="info-item">
                    <strong>Finalidade:</strong> {imovel.finalidade}
                  </div>
                )}
                {imovel.status && (
                  <div className="info-item">
                    <strong>Status:</strong> {imovel.status}
                  </div>
                )}
                {imovel.area_total && (
                  <div className="info-item">
                    <strong>Área Total:</strong> {imovel.area_total} m²
                  </div>
                )}
                {imovel.area_construida && (
                  <div className="info-item">
                    <strong>Área Construída:</strong> {imovel.area_construida}{" "}
                    m²
                  </div>
                )}
              </div>
            </div>

            <div className="content-section">
              <h3>Localização</h3>
              <div className="info-grid">
                {imovel.cep && (
                  <div className="info-item">
                    <strong>CEP:</strong> {imovel.cep}
                  </div>
                )}
                {imovel.estado && (
                  <div className="info-item">
                    <strong>Estado:</strong> {imovel.estado}
                  </div>
                )}
                {imovel.cidade && (
                  <div className="info-item">
                    <strong>Cidade:</strong> {imovel.cidade}
                  </div>
                )}
                {imovel.bairro && (
                  <div className="info-item">
                    <strong>Bairro:</strong> {imovel.bairro}
                  </div>
                )}
              </div>
              {mapEmbedUrl && (
                <div className="map-container">
                  <iframe
                    src={mapEmbedUrl}
                    className="map-iframe"
                    allowFullScreen
                    loading="lazy"
                    title="Localização do imóvel"
                  />
                </div>
              )}
            </div>

            {caracteristicas && Object.keys(caracteristicas).length > 0 && (
              <div className="content-section">
                <h3>Características</h3>
                <div className="features-container">
                  {Object.entries(caracteristicas).map(([key, value]) => {
                    if (key === "id" || key === "imovel_id") return null;
                    if (
                      (key === "condominio" || key === "iptu") &&
                      (!value || value === 0)
                    ) {
                      return null;
                    }
                    if (key === "mobiliado" && value === false) {
                      return (
                        <span key={key} className="feature-tag">
                          Não Mobiliado
                        </span>
                      );
                    }
                    if (
                      value === null ||
                      value === undefined ||
                      value === false
                    )
                      return null;

                    const label = formatLabel(key);
                    if (!label) return null;

                    if (typeof value === "boolean" && value === true) {
                      return (
                        <span key={key} className="feature-tag">
                          {label}
                        </span>
                      );
                    }

                    if (
                      typeof value === "number" ||
                      (typeof value === "string" && value.trim() !== "")
                    ) {
                      return (
                        <span key={key} className="feature-tag">
                          {label}: {value}
                        </span>
                      );
                    }

                    return null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="actions-section">
            <button
              className="modal-contact-btn"
              onClick={() => window.open("https://www.youtube.com", "_blank")}
            >
              Entrar em Contato
            </button>
            <button
              className={`modal-like-btn ${
                isHeartAnimating ? "heart-burst" : ""
              }`}
              onClick={toggleCurtida}
            >
              {curtido ? (
                <AiFillHeart size={26} color="#191970" />
              ) : (
                <AiOutlineHeart size={26} color="#191970" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImovelModal;
