"use client";

import { useEffect, useState } from "react";
import "./Curtidas.css";
import ImovelModal from "../../ImovelModal/ImovelModal";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Curtidas = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [imagemAtual, setImagemAtual] = useState({});
  const [curtidas, setCurtidas] = useState({});

  useEffect(() => {
    if (!usuario || usuario.tipo_usuario === "adm") return;

    fetch(`http://localhost:5000/api/curtidas/${usuario.id}`)
      .then((res) => res.json())
      .then(async (data) => {
        const curtidasMap = {};
        const imoveisCompletos = [];

        for (const c of data) {
          curtidasMap[c.imovel_id] = true;

          const imovel = await fetch(
            `http://localhost:5000/api/imoveis/${c.imovel_id}`
          ).then((res) => res.json());
          imoveisCompletos.push({ ...imovel, fotos: imovel.fotos || [] });
        }

        setCurtidas(curtidasMap);
        setImoveis(imoveisCompletos);
      })
      .catch((err) => console.error("Erro ao buscar curtidas:", err));
  }, [usuario]);

  const removerImovel = (imovelId) => {
    setImoveis((prev) => prev.filter((i) => i.imovel_id !== imovelId));
  };

  const adicionarImovel = async (imovelId) => {
    setImoveis((prev) => {
      if (prev.some((i) => i.imovel_id === imovelId)) return prev;
      return [...prev, { imovel_id: imovelId, carregando: true }];
    });

    try {
      const novoImovel = await fetch(
        `http://localhost:5000/api/imoveis/${imovelId}`
      ).then((res) => res.json());

      setImoveis((prev) =>
        prev.map((i) =>
          i.imovel_id === imovelId && i.carregando
            ? { ...novoImovel, fotos: novoImovel.fotos || [] }
            : i
        )
      );
    } catch (err) {
      console.error("Erro ao adicionar imóvel curtido:", err);
      setImoveis((prev) =>
        prev.filter((i) => i.imovel_id !== imovelId || !i.carregando)
      );
    }
  };

  const toggleCurtida = async (imovelId) => {
    if (!usuario) return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/curtidas/${usuario.id}/${imovelId}`,
        { method: "POST" }
      );

      if (!res.ok) throw new Error("Erro ao alternar curtida");

      const likeBtn = document.querySelector(`[data-imovel-id="${imovelId}"]`);
      if (likeBtn && curtidas[imovelId]) {
        likeBtn.classList.add("heart-burst");
        setTimeout(() => likeBtn.classList.remove("heart-burst"), 600);
      }

      setCurtidas((prev) => {
        const atualizado = { ...prev, [imovelId]: !prev[imovelId] };

        if (prev[imovelId] && !atualizado[imovelId]) {
          removerImovel(imovelId);
        }

        if (!prev[imovelId] && atualizado[imovelId]) {
          adicionarImovel(imovelId);
        }

        return atualizado;
      });
    } catch (err) {
      console.error(err);
    }
  };

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

  if (!usuario) return <p>Faça login para ver seus imóveis curtidos.</p>;

  return (
    <div className="curtidas-page">
      <h2>Imóveis Curtidos</h2>

      {imoveis.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">💙</div>
          <h3>Nenhum imóvel curtido ainda</h3>
          <p>Explore nossos imóveis e favorite os que mais gostar!</p>
        </div>
      ) : (
        <div className="curtidas-grid">
          {imoveis.map((imovel) => (
            <div
              className="property-card"
              key={imovel.imovel_id}
              onClick={() => setImovelSelecionado(imovel)}
            >
              <div className="image-container">
                {imovel.fotos && imovel.fotos.length > 0 ? (
                  <div className="carousel">
                    <button
                      className="carousel-btn prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        imagemAnterior(imovel.imovel_id, imovel.fotos.length);
                      }}
                    >
                      ◀
                    </button>
                    <img
                      src={`http://localhost:5000${
                        imovel.fotos[imagemAtual[imovel.imovel_id] || 0]
                          ?.caminho_foto
                      }`}
                      alt={imovel.titulo}
                      className="property-image"
                    />
                    <button
                      className="carousel-btn next"
                      onClick={(e) => {
                        e.stopPropagation();
                        proximaImagem(imovel.imovel_id, imovel.fotos.length);
                      }}
                    >
                      ▶
                    </button>
                  </div>
                ) : (
                  <div className="no-image">Sem imagem</div>
                )}
                <button
                  className="like-button"
                  data-imovel-id={imovel.imovel_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCurtida(imovel.imovel_id);
                  }}
                >
                  {curtidas[imovel.imovel_id] ? (
                    <AiFillHeart size={28} color="#191970" />
                  ) : (
                    <AiOutlineHeart size={28} color="#191970" />
                  )}
                </button>
              </div>

              <div className="property-content">
                <h3>{imovel.titulo}</h3>
                <p>
                  📍 {imovel.cidade} - {imovel.bairro}
                </p>
                <p style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  R$ {(imovel.preco || 0).toLocaleString("pt-BR")}
                </p>
                <div className="property-features">
                  {imovel.area_total && (
                    <span className="feature">🏠 {imovel.area_total} m²</span>
                  )}
                  {imovel.caracteristicas?.quarto && (
                    <span className="feature">
                      🛏 {imovel.caracteristicas.quarto} quartos
                    </span>
                  )}
                  {imovel.caracteristicas?.banheiro && (
                    <span className="feature">
                      🛁 {imovel.caracteristicas.banheiro} banheiros
                    </span>
                  )}
                  {imovel.caracteristicas?.vaga && (
                    <span className="feature">
                      🚗 {imovel.caracteristicas.vaga} vagas
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {imovelSelecionado && (
        <ImovelModal
          imovel={imovelSelecionado}
          onClose={() => setImovelSelecionado(null)}
          usuario={usuario}
          curtidas={curtidas}
          setCurtidas={setCurtidas}
          onDescurtir={removerImovel}
          onCurtir={adicionarImovel}
        />
      )}
    </div>
  );
};

export default Curtidas;
