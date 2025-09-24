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

  useEffect(() => {
    if (usuario) {
      fetch(`http://localhost:5000/api/curtidas/${usuario.id}`)
        .then((res) => res.json())
        .then((data) => {
          const curtidasMap = {};
          data.forEach((c) => (curtidasMap[c.imovel_id] = true));
          setCurtidas(curtidasMap);
        })
        .catch((err) => console.error("Erro ao buscar curtidas:", err));
    }
  }, [usuario]);

  const toggleCurtida = async (imovelId) => {
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
        `http://localhost:5000/api/curtidas/${usuario.id}/${imovelId}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Erro ao alternar curtida");

      setCurtidas((prev) => ({
        ...prev,
        [imovelId]: !prev[imovelId],
      }));
    } catch (err) {
      console.error(err);
      alert("Não foi possível curtir/descurtir o imóvel.");
    }
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
                  {imovel.fotos?.length > 0 ? (
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
                            ?.caminho_foto
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
                      <div className="feature">🏠 {imovel.area}</div>
                    )}
                    {imovel.quartos && (
                      <div className="feature">🛏 {imovel.quartos} quartos</div>
                    )}
                    {imovel.banheiros && (
                      <div className="feature">
                        🚿 {imovel.banheiros} banheiros
                      </div>
                    )}
                    {imovel.vagas && (
                      <div className="feature">🚗 {imovel.vagas} vagas</div>
                    )}
                  </div>

                  <div className="action-buttons">
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
          curtidas={curtidas}
          setCurtidas={setCurtidas}
          onClose={() => setImovelSelecionado(null)}
        />
      )}
    </div>
  );
};

export default Comprar;
