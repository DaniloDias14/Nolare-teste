"use client";

import { useState } from "react";
import "./Comprar.css";

const mockImoveis = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  titulo: `Residência Exclusiva ${i + 1}`,
  descricao:
    "Casa de alto padrão com acabamentos de luxo, localizada em condomínio exclusivo.",
  preco: `R$ ${(800000 + i * 50000).toLocaleString("pt-BR")}`,
  localizacao: `Bairro Nobre ${Math.floor(i / 5) + 1}`,
  area: `${250 + i * 10}m²`,
  quartos: Math.floor(Math.random() * 3) + 2,
  banheiros: Math.floor(Math.random() * 2) + 2,
  vagas: Math.floor(Math.random() * 2) + 1,
  imagens: [
    `../src/assets/img/${i * 3 + 1}.png`,
    `../src/assets/img/${i * 3 + 2}.png`,
    `../src/assets/img/${i * 3 + 3}.png`,
  ],
}));

const Comprar = () => {
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [imagemAtual, setImagemAtual] = useState({});

  const imoveisPorPagina = 12;
  const totalPaginas = Math.ceil(mockImoveis.length / imoveisPorPagina);

  const indexInicial = (paginaAtual - 1) * imoveisPorPagina;
  const indexFinal = indexInicial + imoveisPorPagina;
  const imoveisExibidos = mockImoveis.slice(indexInicial, indexFinal);

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
          <div className="grid-imoveis">
            {imoveisExibidos.map((imovel) => (
              <div className="property-card" key={imovel.id}>
                <div className="image-container">
                  <div className="carousel">
                    <button
                      className="carousel-btn prev"
                      onClick={() =>
                        imagemAnterior(imovel.id, imovel.imagens.length)
                      }
                      aria-label="Imagem anterior"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M15 18L9 12L15 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <img
                      src={imovel.imagens[imagemAtual[imovel.id] || 0]}
                      alt={imovel.titulo}
                      className="property-image"
                    />
                    <button
                      className="carousel-btn next"
                      onClick={() =>
                        proximaImagem(imovel.id, imovel.imagens.length)
                      }
                      aria-label="Próxima imagem"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 18L15 12L9 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                    <div className="image-indicators">
                      {imovel.imagens.map((_, index) => (
                        <span
                          key={index}
                          className={`indicator ${
                            index === (imagemAtual[imovel.id] || 0)
                              ? "active"
                              : ""
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="property-content">
                  <div className="property-header">
                    <h3 className="property-title">{imovel.titulo}</h3>
                    <div className="property-price">{imovel.preco}</div>
                  </div>

                  <div className="property-location">
                    <span className="location-icon">📍</span>
                    {imovel.localizacao}
                  </div>

                  <p className="property-description">{imovel.descricao}</p>

                  <div className="property-features">
                    <div className="feature">
                      <span className="feature-icon">🏠</span>
                      <span>{imovel.area}</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">🛏️</span>
                      <span>{imovel.quartos} quartos</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">🚿</span>
                      <span>{imovel.banheiros} banheiros</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">🚗</span>
                      <span>{imovel.vagas} vagas</span>
                    </div>
                  </div>

                  <button className="contact-button">Entrar em Contato</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="pagination-container">
        <div className="paginacao">
          <button
            className="pagination-btn"
            disabled={paginaAtual === 1}
            onClick={() => setPaginaAtual(paginaAtual - 1)}
          >
            ← Anterior
          </button>

          <div className="page-numbers">
            {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`page-number ${
                    paginaAtual === pageNum ? "active" : ""
                  }`}
                  onClick={() => setPaginaAtual(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            className="pagination-btn"
            disabled={paginaAtual === totalPaginas}
            onClick={() => setPaginaAtual(paginaAtual + 1)}
          >
            Próxima →
          </button>
        </div>

        <div className="pagination-info">
          Exibindo {indexInicial + 1}-{Math.min(indexFinal, mockImoveis.length)}{" "}
          de {mockImoveis.length} propriedades
        </div>
      </div>
    </div>
  );
};

export default Comprar;
