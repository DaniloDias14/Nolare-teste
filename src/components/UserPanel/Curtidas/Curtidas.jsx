import React, { useEffect, useState } from "react";
import "./Curtidas.css";
import ImovelModal from "../../Pages/Comprar/ImovelModal.jsx";
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
    setImoveis((prev) => prev.filter((i) => i.imovel_id !== imovelId)); // ✅ Corrigido
  };

  const adicionarImovel = async (imovelId) => {
    setImoveis((prev) => {
      if (prev.some((i) => i.imovel_id === imovelId)) return prev; // ✅ Corrigido
      return [...prev, { imovel_id: imovelId, carregando: true }];
    });

    try {
      const novoImovel = await fetch(
        `http://localhost:5000/api/imoveis/${imovelId}`
      ).then((res) => res.json());

      setImoveis((prev) =>
        prev.map((i) =>
          i.imovel_id === imovelId && i.carregando // ✅ Corrigido
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
      <div className="curtidas-grid">
        {imoveis.length === 0 && <p>Você ainda não curtiu nenhum imóvel.</p>}
        {imoveis.map((imovel) => (
          <div
            className="property-card"
            key={imovel.imovel_id} // ✅ Corrigido
            onClick={() => setImovelSelecionado(imovel)}
          >
            <div className="image-container">
              {imovel.fotos && imovel.fotos.length > 0 ? (
                <div className="carousel">
                  <button
                    className="carousel-btn prev"
                    onClick={(e) => {
                      e.stopPropagation();
                      imagemAnterior(imovel.imovel_id, imovel.fotos.length); // ✅ Corrigido
                    }}
                  >
                    ◀
                  </button>
                  <img
                    src={`http://localhost:5000${
                      imovel.fotos[imagemAtual[imovel.imovel_id] || 0]
                        ?.caminho_foto
                    }`} // ✅ Corrigido
                    alt={imovel.titulo}
                    className="property-image"
                  />
                  <button
                    className="carousel-btn next"
                    onClick={(e) => {
                      e.stopPropagation();
                      proximaImagem(imovel.imovel_id, imovel.fotos.length); // ✅ Corrigido
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
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCurtida(imovel.imovel_id); // ✅ Corrigido
                }}
              >
                {curtidas[imovel.imovel_id] ? ( // ✅ Corrigido
                  <AiFillHeart size={26} color="red" />
                ) : (
                  <AiOutlineHeart size={26} />
                )}
              </button>
            </div>

            <div className="property-content">
              <h3>{imovel.titulo}</h3>
              <p>{imovel.endereco}</p>
              <p>R$ {imovel.preco}</p>
              {imovel.area && <p>🏠 {imovel.area}</p>}
              {imovel.quartos && <p>🛏 {imovel.quartos} quartos</p>}
              {imovel.banheiros && <p>🚿 {imovel.banheiros} banheiros</p>}
              {imovel.vagas && <p>🚗 {imovel.vagas} vagas</p>}
            </div>
          </div>
        ))}
      </div>

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
