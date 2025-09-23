import React, { useEffect, useState } from "react";
import "./Curtidas.css";
import ImovelModal from "../../Pages/Comprar/ImovelModal.jsx"; // caminho ajustado
import { AiFillHeart } from "react-icons/ai";

const Curtidas = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [imagemAtual, setImagemAtual] = useState({});
  const [curtidos, setCurtidos] = useState([]);

  useEffect(() => {
    if (!usuario?.id) return;

    // Busca imóveis curtidos pelo usuário
    fetch(`http://localhost:5000/api/curtidas/${usuario.id}`)
      .then((res) => res.json())
      .then((data) => setCurtidos(data.map((c) => c.id)))
      .catch((err) => console.error("Erro ao buscar curtidas:", err));
  }, [usuario]);

  useEffect(() => {
    if (curtidos.length === 0) return;

    fetch("http://localhost:5000/api/imoveis")
      .then((res) => res.json())
      .then((data) =>
        setImoveis(data.filter((imovel) => curtidos.includes(imovel.id)))
      )
      .catch((err) => console.error("Erro ao buscar imóveis:", err));
  }, [curtidos]);

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
    <div className="curtidas-page">
      <h2>Imóveis Curtidos</h2>
      <div className="curtidas-grid">
        {imoveis.length === 0 && <p>Você ainda não curtiu nenhum imóvel.</p>}
        {imoveis.map((imovel) => (
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
                      imovel.fotos[imagemAtual[imovel.id] || 0]?.caminho_foto
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

              <button className="like-button" disabled>
                <AiFillHeart size={26} color="red" />
              </button>
            </div>

            <div className="property-content">
              <h3>{imovel.titulo}</h3>
              <p>{imovel.endereco}</p>
              <p>R$ {imovel.preco}</p>
            </div>
          </div>
        ))}
      </div>

      {imovelSelecionado && (
        <ImovelModal
          imovel={imovelSelecionado}
          onClose={() => setImovelSelecionado(null)}
          setImagemAtual={setImagemAtual}
        />
      )}
    </div>
  );
};

export default Curtidas;
