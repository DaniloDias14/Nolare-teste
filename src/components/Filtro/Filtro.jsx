"use client";

import { useState, useEffect } from "react";
import "./Filtro.css";

const Filtro = ({ onFiltrar }) => {
  const [buscaAvancada, setBuscaAvancada] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);

  const [filtros, setFiltros] = useState({
    tipo: "",
    finalidade: "",
    localizacao: "",
    precoMin: "",
    precoMax: "",
    quartos: "",
    banheiros: "",
    vagas: "",
    areaMin: "",
    areaMax: "",
  });

  const tiposImovel = [
    "Apartamento",
    "Casa",
    "Chalé",
    "Cobertura",
    "Fazenda",
    "Galpão",
    "Kitnet",
    "Sala comercial",
    "Sítio",
    "Terreno",
  ];

  const finalidades = ["Aluguel", "Temporada", "Venda"];

  useEffect(() => {
    if (filtros.localizacao.length >= 2) {
      fetch("http://localhost:5000/api/imoveis")
        .then((res) => res.json())
        .then((data) => {
          const localizacoes = new Set();
          data.forEach((imovel) => {
            if (imovel.cidade) localizacoes.add(imovel.cidade);
            if (imovel.bairro) localizacoes.add(imovel.bairro);
          });

          const filtradas = Array.from(localizacoes).filter((loc) =>
            loc.toLowerCase().includes(filtros.localizacao.toLowerCase())
          );

          setSugestoes(filtradas);
          setMostrarSugestoes(filtradas.length > 0);
        })
        .catch((err) => console.error("Erro ao buscar sugestões:", err));
    } else {
      setSugestoes([]);
      setMostrarSugestoes(false);
    }
  }, [filtros.localizacao]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSugestaoClick = (sugestao) => {
    setFiltros((prev) => ({
      ...prev,
      localizacao: sugestao,
    }));
    setMostrarSugestoes(false);
  };

  const handleBuscar = () => {
    onFiltrar(filtros);
  };

  const handleLimpar = () => {
    setFiltros({
      tipo: "",
      finalidade: "",
      localizacao: "",
      precoMin: "",
      precoMax: "",
      quartos: "",
      banheiros: "",
      vagas: "",
      areaMin: "",
      areaMax: "",
    });
    onFiltrar({});
  };

  return (
    <div className="filtro-section">
      <div className="filtro-container">
        <div className="filtro-principal">
          <select
            name="tipo"
            value={filtros.tipo}
            onChange={handleInputChange}
            className="filtro-select"
          >
            <option value="">Tipo de Imóvel</option>
            {tiposImovel.map((tipo) => (
              <option key={tipo} value={tipo.toLowerCase()}>
                {tipo}
              </option>
            ))}
          </select>

          <select
            name="finalidade"
            value={filtros.finalidade}
            onChange={handleInputChange}
            className="filtro-select"
          >
            <option value="">Finalidade</option>
            {finalidades.map((finalidade) => (
              <option key={finalidade} value={finalidade.toLowerCase()}>
                {finalidade}
              </option>
            ))}
          </select>

          <div className="filtro-localizacao-wrapper">
            <input
              type="text"
              name="localizacao"
              placeholder="Bairro ou Cidade"
              value={filtros.localizacao}
              onChange={handleInputChange}
              className="filtro-input"
              onFocus={() => {
                if (sugestoes.length > 0) setMostrarSugestoes(true);
              }}
            />
            {mostrarSugestoes && (
              <div className="sugestoes-dropdown">
                {sugestoes.map((sugestao, index) => (
                  <div
                    key={index}
                    className="sugestao-item"
                    onClick={() => handleSugestaoClick(sugestao)}
                  >
                    {sugestao}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="filtro-buscar-btn" onClick={handleBuscar}>
            Buscar
          </button>
        </div>

        <button
          className="filtro-avancada-toggle"
          onClick={() => setBuscaAvancada(!buscaAvancada)}
        >
          {buscaAvancada ? "▲ Busca Simples" : "▼ Busca Avançada"}
        </button>

        {buscaAvancada && (
          <div className="filtro-avancada">
            <div className="filtro-avancada-grid">
              <div className="filtro-group">
                <label>Preço</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="precoMin"
                    placeholder="Mínimo"
                    value={filtros.precoMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="precoMax"
                    placeholder="Máximo"
                    value={filtros.precoMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Quartos</label>
                <input
                  type="number"
                  name="quartos"
                  placeholder="Nº de quartos"
                  value={filtros.quartos}
                  onChange={handleInputChange}
                  className="filtro-input-small"
                />
              </div>

              <div className="filtro-group">
                <label>Banheiros</label>
                <input
                  type="number"
                  name="banheiros"
                  placeholder="Nº de banheiros"
                  value={filtros.banheiros}
                  onChange={handleInputChange}
                  className="filtro-input-small"
                />
              </div>

              <div className="filtro-group">
                <label>Vagas</label>
                <input
                  type="number"
                  name="vagas"
                  placeholder="Nº de vagas"
                  value={filtros.vagas}
                  onChange={handleInputChange}
                  className="filtro-input-small"
                />
              </div>

              <div className="filtro-group">
                <label>Área (m²)</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="areaMin"
                    placeholder="Mínima"
                    value={filtros.areaMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="areaMax"
                    placeholder="Máxima"
                    value={filtros.areaMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>
            </div>

            <button className="filtro-limpar-btn" onClick={handleLimpar}>
              Limpar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Filtro;
