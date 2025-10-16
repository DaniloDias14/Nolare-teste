"use client";

import { useState, useEffect } from "react";
import "./Comprar.css";
import ImovelModal from "../../ImovelModal/ImovelModal";
import Destaque from "../../Destaque/Destaque";
import Filtro from "../../Filtro/Filtro";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const Comprar = ({ usuario }) => {
  const [imoveis, setImoveis] = useState([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [imagemAtual, setImagemAtual] = useState({});
  const [imovelSelecionado, setImovelSelecionado] = useState(null);
  const [curtidas, setCurtidas] = useState({});
  const [mensagemSemResultados, setMensagemSemResultados] = useState("");

  const imoveisPorPagina = 15;

  useEffect(() => {
    fetch("http://localhost:5000/api/imoveis")
      .then((res) => res.json())
      .then((data) => {
        setImoveis(data);
        setImoveisFiltrados(data);
      })
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

  const handleFiltrar = (filtros) => {
    if (
      Object.keys(filtros).length === 0 ||
      Object.values(filtros).every((v) => !v)
    ) {
      setImoveisFiltrados(imoveis);
      setMensagemSemResultados("");
      setPaginaAtual(1);
      return;
    }

    const normalizeStr = (s) =>
      s
        ? String(s)
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        : "";

    const filtrados = imoveis.filter((imovel) => {
      let match = true;

      if (
        filtros.tipo &&
        normalizeStr(imovel.tipo) !== normalizeStr(filtros.tipo)
      ) {
        match = false;
      }

      if (
        filtros.finalidade &&
        normalizeStr(imovel.finalidade) !== normalizeStr(filtros.finalidade)
      ) {
        match = false;
      }

      if (filtros.localizacao) {
        const loc = normalizeStr(filtros.localizacao);
        const cidade = normalizeStr(imovel.cidade);
        const bairro = normalizeStr(imovel.bairro);
        if (!cidade.includes(loc) && !bairro.includes(loc)) {
          match = false;
        }
      }

      if (
        filtros.precoMin &&
        imovel.preco < Number.parseFloat(filtros.precoMin)
      ) {
        match = false;
      }

      if (
        filtros.precoMax &&
        imovel.preco > Number.parseFloat(filtros.precoMax)
      ) {
        match = false;
      }

      if (
        filtros.quartos &&
        imovel.caracteristicas?.quarto < Number.parseInt(filtros.quartos)
      ) {
        match = false;
      }

      if (
        filtros.banheiros &&
        imovel.caracteristicas?.banheiro < Number.parseInt(filtros.banheiros)
      ) {
        match = false;
      }

      if (
        filtros.vagas &&
        imovel.caracteristicas?.vaga < Number.parseInt(filtros.vagas)
      ) {
        match = false;
      }

      if (filtros.areaMin) {
        const area = imovel.area_total || imovel.area_construida || 0;
        if (area < Number.parseFloat(filtros.areaMin)) {
          match = false;
        }
      }

      if (filtros.areaMax) {
        const area = imovel.area_total || imovel.area_construida || 0;
        if (area > Number.parseFloat(filtros.areaMax)) {
          match = false;
        }
      }

      return match;
    });

    setImoveisFiltrados(filtrados);
    setPaginaAtual(1);

    if (filtrados.length === 0) {
      setMensagemSemResultados(
        "Ainda não temos esse tipo de imóvel disponível, mas em breve poderemos ter!"
      );
    } else {
      setMensagemSemResultados("");
    }
  };

  const toggleCurtida = async (imovel) => {
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

      const likeBtn = document.querySelector(`[data-imovel-id="${imovelId}"]`);
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

  const totalPaginas = Math.ceil(imoveisFiltrados.length / imoveisPorPagina);
  const indexInicial = (paginaAtual - 1) * imoveisPorPagina;
  const indexFinal = indexInicial + imoveisPorPagina;
  const imoveisExibidos = imoveisFiltrados.slice(indexInicial, indexFinal);

  const gerarNumerosPaginas = () => {
    const paginas = [];
    for (let i = 1; i <= totalPaginas; i++) {
      paginas.push(i);
    }
    return paginas;
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

  const normalizeStr = (s) =>
    s
      ? String(s)
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
      : "";

  const renderTypeSpecific = (imovel) => {
    const tipoRaw = imovel.tipo ?? imovel.tipo_imovel ?? "";
    const tipo = normalizeStr(tipoRaw);

    const areaTotal = imovel.area_total;
    const areaConstruida = imovel.area_construida;
    const quarto = imovel.caracteristicas?.quarto ?? imovel.quarto ?? null;
    const banheiro =
      imovel.caracteristicas?.banheiro ?? imovel.banheiro ?? null;
    const andar = imovel.caracteristicas?.andar ?? imovel.andar ?? null;
    const mobiliado =
      imovel.caracteristicas?.mobiliado ?? imovel.mobiliado ?? false;

    const mobiliadoTexto = mobiliado ? "Mobiliado" : "Não mobiliado";

    switch (tipo) {
      case "casa":
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
            {quarto != null && <div>🛏 {quarto} quartos</div>}
            <div>{mobiliadoTexto}</div>
          </>
        );
      case "apartamento":
      case "cobertura":
      case "kitnet":
        return (
          <>
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
            {quarto != null && <div>🛏 {quarto} quartos</div>}
            {andar != null && <div>Andar: {andar}</div>}
            <div>{mobiliadoTexto}</div>
          </>
        );
      case "terreno":
      case "sitio":
      case "sítio":
      case "fazenda":
        return (
          <>{areaTotal != null && <div>Área total: {areaTotal} m²</div>}</>
        );
      case "sala comercial":
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
            {banheiro != null && <div>🛁 {banheiro} banheiros</div>}
            <div>{mobiliadoTexto}</div>
          </>
        );
      case "galpao":
      case "galpão":
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
          </>
        );
      default:
        return (
          <>
            {areaTotal != null && <div>Área total: {areaTotal} m²</div>}
            {areaConstruida != null && (
              <div>Área construída: {areaConstruida} m²</div>
            )}
          </>
        );
    }
  };

  return (
    <div className="comprar">
      <div className="properties-section">
        <h1 style={{ textDecoration: "underline" }}>
          Encontre um imóvel ideal para você
        </h1>
      </div>

      <Destaque
        usuario={usuario}
        curtidas={curtidas}
        setCurtidas={setCurtidas}
        onImovelClick={setImovelSelecionado}
      />

      <Filtro onFiltrar={handleFiltrar} />

      <main className="properties-section">
        <div className="container">
          {mensagemSemResultados && (
            <div className="sem-resultados">
              <p>{mensagemSemResultados}</p>
            </div>
          )}

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
                key={imovel.id ?? imovel.imovel_id}
                onClick={() => setImovelSelecionado(imovel)}
              >
                <div className="image-wrapper">
                  <div className="image-container">
                    {imovel.fotos?.length > 0 ? (
                      <div className="carousel">
                        <button
                          className="carousel-btn prev"
                          onClick={(e) => {
                            e.stopPropagation();
                            imagemAnterior(
                              imovel.id ?? imovel.imovel_id,
                              imovel.fotos.length
                            );
                          }}
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
                          className="property-image"
                        />
                        <button
                          className="carousel-btn next"
                          onClick={(e) => {
                            e.stopPropagation();
                            proximaImagem(
                              imovel.id ?? imovel.imovel_id,
                              imovel.fotos.length
                            );
                          }}
                        >
                          ▶
                        </button>
                      </div>
                    ) : (
                      <div className="no-image">Sem imagem</div>
                    )}
                  </div>
                </div>

                <div className="property-content">
                  <div className="property-header">
                    <h3 className="property-title">{imovel.titulo}</h3>
                    <div className="property-price-single">
                      R$ {(imovel.preco || 0).toLocaleString("pt-BR")}
                    </div>
                  </div>

                  <div className="property-details">
                    <div>
                      📍 {imovel.cidade || "Cidade não informada"} -{" "}
                      {imovel.bairro || "Bairro não informado"}
                    </div>
                    {renderTypeSpecific(imovel)}
                  </div>

                  <div className="property-features">
                    {imovel.caracteristicas?.quarto && (
                      <div className="feature">
                        🛏 {imovel.caracteristicas.quarto} quartos
                      </div>
                    )}
                    {imovel.caracteristicas?.banheiro && (
                      <div className="feature">
                        🛁 {imovel.caracteristicas.banheiro} banheiros
                      </div>
                    )}
                    {imovel.caracteristicas?.vaga && (
                      <div className="feature">
                        🚗 {imovel.caracteristicas.vaga} vagas
                      </div>
                    )}
                  </div>

                  <div className="action-buttons">
                    <button
                      className="contact-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open("https://www.youtube.com", "_blank");
                      }}
                    >
                      Entrar em Contato
                    </button>

                    <button
                      className="like-btn"
                      data-imovel-id={imovel.id ?? imovel.imovel_id}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCurtida(imovel);
                      }}
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

          {totalPaginas > 1 && (
            <div className="pagination">
              <div className="pagination-controls">
                <button
                  className="pagination-btn"
                  onClick={() =>
                    setPaginaAtual((prev) => Math.max(1, prev - 1))
                  }
                  disabled={paginaAtual === 1}
                >
                  ← Anterior
                </button>

                <div className="pagination-info">
                  Página {paginaAtual} de {totalPaginas}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() =>
                    setPaginaAtual((prev) => Math.min(totalPaginas, prev + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                >
                  Próxima →
                </button>
              </div>

              <div className="pagination-numbers">
                {gerarNumerosPaginas().map((numeroPagina) => (
                  <button
                    key={numeroPagina}
                    className={`page-number-btn ${
                      paginaAtual === numeroPagina ? "active" : ""
                    }`}
                    onClick={() => setPaginaAtual(numeroPagina)}
                  >
                    {numeroPagina}
                  </button>
                ))}
              </div>
            </div>
          )}
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
