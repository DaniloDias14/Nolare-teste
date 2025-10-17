"use client";

import { useState, useEffect, useRef } from "react";
import "./Destaque.css";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Destaque = ({ usuario, curtidas, setCurtidas, onImovelClick }) => {
  const [imoveisDestaque, setImoveisDestaque] = useState([]);
  const [imagemAtual, setImagemAtual] = useState({});
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/imoveis")
      .then((res) => res.json())
      .then((data) => {
        const destaques = data.filter((imovel) => imovel.destaque === true);
        setImoveisDestaque(destaques);
      })
      .catch((err) =>
        console.error("Erro ao buscar imóveis em destaque:", err)
      );
  }, []);

  const toggleCurtida = async (e, imovel) => {
    e.stopPropagation();
    const imovelId = imovel?.id ?? imovel?.imovel_id;
    if (!imovelId) {
      console.error("ID do imóvel não encontrado:", imovel);
      return;
    }

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
        `http://localhost:5000/api/curtidas/${usuario.id}/${imovelId}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      const likeBtn = document.querySelector(
        `[data-destaque-imovel-id="${imovelId}"]`
      );
      if (likeBtn && !curtidas[imovelId]) {
        likeBtn.classList.add("heart-burst");
        setTimeout(() => likeBtn.classList.remove("heart-burst"), 600);
      }

      setCurtidas((prev) => ({
        ...prev,
        [imovelId]: !prev[imovelId],
      }));
    } catch (err) {
      console.error(err);
      alert("Não foi possível curtir/descurtir o imóvel.");
    }
  };

  const proximaImagem = (e, id, total) => {
    e.stopPropagation();
    setImagemAtual((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total,
    }));
  };

  const imagemAnterior = (e, id, total) => {
    e.stopPropagation();
    setImagemAtual((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? total - 1 : (prev[id] || 0) - 1,
    }));
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 420;
      carouselRef.current.scrollBy({
        left: direction === "next" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isMobile) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !isMobile) return;
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (imoveisDestaque.length === 0) {
    return null;
  }

  return (
    <div className="destaque-section">
      <h2 className="destaque-title">Imóveis em Destaque</h2>

      <div className="destaque-carousel-wrapper">
        <div
          className="destaque-carousel"
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {imoveisDestaque.map((imovel) => (
            <div
              className="destaque-card"
              key={imovel.id ?? imovel.imovel_id}
              onClick={() => onImovelClick(imovel)}
            >
              <div className="destaque-image-container">
                {imovel.fotos?.length > 0 ? (
                  <div className="destaque-carousel-inner">
                    <button
                      className="destaque-carousel-btn prev"
                      onClick={(e) =>
                        imagemAnterior(
                          e,
                          imovel.id ?? imovel.imovel_id,
                          imovel.fotos.length
                        )
                      }
                    >
                      ◀
                    </button>
                    <img
                      src={
                        imovel.fotos[
                          imagemAtual[imovel.id ?? imovel.imovel_id] || 0
                        ]?.caminho_foto
                      }
                      alt={imovel.titulo}
                      className="destaque-image"
                    />
                    <button
                      className="destaque-carousel-btn next"
                      onClick={(e) =>
                        proximaImagem(
                          e,
                          imovel.id ?? imovel.imovel_id,
                          imovel.fotos.length
                        )
                      }
                    >
                      ▶
                    </button>
                  </div>
                ) : (
                  <div className="destaque-no-image">Sem imagem</div>
                )}
              </div>

              <div className="destaque-content">
                <div className="destaque-header">
                  <h3 className="destaque-title-card">{imovel.titulo}</h3>
                  <div className="destaque-price">
                    R$ {(imovel.preco || 0).toLocaleString("pt-BR")}
                  </div>
                </div>

                <div className="destaque-details">
                  <div>
                    📍 {imovel.cidade || "Cidade não informada"} -{" "}
                    {imovel.bairro || "Bairro não informado"}
                  </div>
                </div>

                <div className="destaque-features">
                  {imovel.caracteristicas?.quarto && (
                    <div className="destaque-feature">
                      🛏 {imovel.caracteristicas.quarto} quartos
                    </div>
                  )}
                  {imovel.caracteristicas?.banheiro && (
                    <div className="destaque-feature">
                      🛁 {imovel.caracteristicas.banheiro} banheiros
                    </div>
                  )}
                  {imovel.caracteristicas?.vaga && (
                    <div className="destaque-feature">
                      🚗 {imovel.caracteristicas.vaga} vagas
                    </div>
                  )}
                </div>

                <div className="destaque-actions">
                  <button
                    className="destaque-contact-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open("https://www.youtube.com", "_blank");
                    }}
                  >
                    Entrar em Contato
                  </button>

                  <button
                    className="destaque-like-btn"
                    data-destaque-imovel-id={imovel.id ?? imovel.imovel_id}
                    onClick={(e) => toggleCurtida(e, imovel)}
                  >
                    {curtidas[imovel.id ?? imovel.imovel_id] ? (
                      <AiFillHeart size={28} color="#191970" />
                    ) : (
                      <AiOutlineHeart size={28} color="#191970" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="destaque-nav-buttons">
          <button
            className="destaque-nav-btn"
            onClick={() => scrollCarousel("prev")}
          >
            ◀
          </button>
          <button
            className="destaque-nav-btn"
            onClick={() => scrollCarousel("next")}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default Destaque;
