"use client";

import { useState, useEffect } from "react";
import "./Comprar.css";
import ImovelModal from "./ImovelModal";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Comprar = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [imagemAtual, setImagemAtual] = useState({});
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [curtidas, setCurtidas] = useState({});

  const imoveisPorPagina = 12;

  useEffect(() => {
    fetch("http://localhost:5000/api/imoveis")
      .then((res) => res.json())
      .then((data) => setImoveis(data))
      .catch((err) => console.error("Erro ao buscar imóveis:", err));
  }, []);

  const toggleCurtida = (imovelId) => {
    if (!usuario) {
      alert("Você precisa fazer login para curtir os imóveis!");
      return;
    }
    if (usuario.tipo_usuario === "adm") {
      alert("Você é adm, não pode curtir!");
      return;
    }
    setCurtidas((prev) => ({
      ...prev,
      [imovelId]: !prev[imovelId],
    }));
  };

  const totalPaginas = Math.ceil(imoveis.length / imoveisPorPagina);
  const indexInicial = (paginaAtual - 1) * imoveisPorPagina;
  const indexFinal = indexInicial + imoveisPorPagina;
  const imoveisExibidos = imoveis.slice(indexInicial, indexFinal);

  const proximaImagem = (id, total) => {
    setImagemAtual((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total,
    }));
  };

  const imagemAnterior = (id, total) => {
    setImagemAtual((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) === 0 ? total - 1 : (prev[id] || 0) - 1,
    }));
  };

  return (
    <div className="comprar">
      <main className="properties-section">
        <div className="container">
          <div
            className="grid-imoveis"
            style={{
              justifyContent:
                imoveisExibidos.length < 3 ? "center" : "flex-start",
            }}
          >
            {imoveisExibidos.map((imovel) => (
              <div
                className="property-card"
                key={imovel.id}
                onClick={() => setImovelSelecionado(imovel)}
              >
                <div className="image-container">
                  {imovel.fotos && imovel.fotos.length > 0 ? (
                    <div className="carousel">
                      <button
                        className="carousel-btn prev"
                        onClick={(e) => {
                          e.stopPropagation();
                          imagemAnterior(imovel.id, imovel.fotos.length);
                        }}
                      >
                        ◀
                      </button>
                      <img
                        src={
                          imovel.fotos[imagemAtual[imovel.id] || 0]
                            ?.caminho_foto || ""
                        }
                        alt={imovel.titulo}
                        className="property-image"
                      />
                      <button
                        className="carousel-btn next"
                        onClick={(e) => {
                          e.stopPropagation();
                          proximaImagem(imovel.id, imovel.fotos.length);
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  ) : (
                    <div className="no-image">Sem imagem</div>
                  )}
                </div>

                <div className="property-content">
                  <div className="property-header">
                    <h3 className="property-title">{imovel.titulo}</h3>
                    <div className="property-price">R$ {imovel.preco}</div>
                  </div>

                  <div className="property-location">
                    <span className="location-icon">📍</span>
                    {imovel.endereco || "Localização não disponível"}
                  </div>

                  <p className="property-description">{imovel.descricao}</p>

                  <div className="property-features">
                    {imovel.area && (
                      <div className="feature">
                        <span className="feature-icon">🏠</span>
                        <span>{imovel.area}</span>
                      </div>
                    )}
                    {imovel.quartos && (
                      <div className="feature">
                        <span className="feature-icon">🛏️</span>
                        <span>{imovel.quartos} quartos</span>
                      </div>
                    )}
                    {imovel.banheiros && (
                      <div className="feature">
                        <span className="feature-icon">🚿</span>
                        <span>{imovel.banheiros} banheiros</span>
                      </div>
                    )}
                    {imovel.vagas && (
                      <div className="feature">
                        <span className="feature-icon">🚗</span>
                        <span>{imovel.vagas} vagas</span>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <button
                      className="contact-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImovelSelecionado(imovel);
                      }}
                    >
                      Ver Detalhes
                    </button>

                    <button
                      className="like-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCurtida(imovel.id);
                      }}
                    >
                      {curtidas[imovel.id] ? (
                        <AiFillHeart size={22} color="red" />
                      ) : (
                        <AiOutlineHeart size={22} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {imovelSelecionado && (
        <ImovelModal
          imovel={imovelSelecionado}
          usuario={usuario}
          onClose={() => setImovelSelecionado(null)}
        />
      )}
    </div>
  );
};

export default Comprar;
