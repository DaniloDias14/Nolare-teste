"use client";

import { useState, useEffect, useRef } from "react";
import "./Filtro.css";

const Filtro = ({ onFiltrar }) => {
  const [buscaAvancada, setBuscaAvancada] = useState(false);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const localizacaoRef = useRef(null);

  const [filtros, setFiltros] = useState({
    identificador: "",
    tipo: "",
    finalidade: "",
    localizacao: "",
    precoMin: "",
    precoMax: "",
    areaTotalMin: "",
    areaTotalMax: "",
    areaConstruidaMin: "",
    areaConstruidaMax: "",
    condominioMin: "",
    condominioMax: "",
    iptuMin: "",
    iptuMax: "",
    quartos: "",
    banheiros: "",
    vagas: "",
    arCondicionado: "",
    andarMin: "",
    andarMax: "",
    andarTotalMin: "",
    andarTotalMax: "",
    construtora: "",
    // Características booleanas
    acessibilidade_pcd: false,
    aceita_animais: false,
    academia: false,
    alarme: false,
    bicicletario: false,
    brinquedoteca: false,
    camera_vigilancia: false,
    carregador_carro_eletrico: false,
    churrasqueira: false,
    closet: false,
    escritorio: false,
    estudio: false,
    gerador_energia: false,
    interfone: false,
    jardim: false,
    lavanderia: false,
    mobiliado: false,
    na_planta: false,
    piscina: false,
    playground: false,
    pomar: false,
    portaria_24h: false,
    quadra: false,
    sala_jogos: false,
    salao_de_festa: false,
    suite: false,
    varanda: false,
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

  const construtoras = [
    "Construfase",
    "Construtora Fontana",
    "Corbetta Construtora",
    "Criciúma Construções",
  ];

  const caracteristicasOrdenadas = [
    { key: "acessibilidade_pcd", label: "Acessibilidade PCD" },
    { key: "aceita_animais", label: "Aceita Animais" },
    { key: "academia", label: "Academia" },
    { key: "alarme", label: "Alarme" },
    { key: "bicicletario", label: "Bicicletário" },
    { key: "brinquedoteca", label: "Brinquedoteca" },
    { key: "camera_vigilancia", label: "Câmera de Vigilância" },
    { key: "carregador_carro_eletrico", label: "Carregador Carro Elétrico" },
    { key: "churrasqueira", label: "Churrasqueira" },
    { key: "closet", label: "Closet" },
    { key: "elevador", label: "Elevador" },
    { key: "energia_solar", label: "Energia Solar" },
    { key: "escritorio", label: "Escritório" },
    { key: "estudio", label: "Estúdio" },
    { key: "gerador_energia", label: "Gerador de Energia" },
    { key: "interfone", label: "Interfone" },
    { key: "jardim", label: "Jardim" },
    { key: "lago", label: "Lago" },
    { key: "lareira", label: "Lareira" },
    { key: "lavanderia", label: "Lavanderia" },
    { key: "mobiliado", label: "Mobiliado" },
    { key: "na_planta", label: "Na Planta" },
    { key: "piscina", label: "Piscina" },
    { key: "playground", label: "Playground" },
    { key: "pomar", label: "Pomar" },
    { key: "portaria_24h", label: "Portaria 24h" },
    { key: "quadra", label: "Quadra" },
    { key: "sala_jogos", label: "Sala de Jogos" },
    { key: "salao_de_festa", label: "Salão de Festa" },
    { key: "suite", label: "Suíte" },
    { key: "varanda", label: "Varanda" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        localizacaoRef.current &&
        !localizacaoRef.current.contains(event.target)
      ) {
        setMostrarSugestoes(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        })
        .catch((err) => console.error("Erro ao buscar sugestões:", err));
    } else {
      setSugestoes([]);
      setMostrarSugestoes(false);
    }
  }, [filtros.localizacao]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFiltros((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    const filtrosLimpos = {
      identificador: "",
      tipo: "",
      finalidade: "",
      localizacao: "",
      precoMin: "",
      precoMax: "",
      areaTotalMin: "",
      areaTotalMax: "",
      areaConstruidaMin: "",
      areaConstruidaMax: "",
      condominioMin: "",
      condominioMax: "",
      iptuMin: "",
      iptuMax: "",
      quartos: "",
      banheiros: "",
      vagas: "",
      arCondicionado: "",
      andarMin: "",
      andarMax: "",
      andarTotalMin: "",
      andarTotalMax: "",
      construtora: "",
    };

    caracteristicasOrdenadas.forEach((c) => {
      filtrosLimpos[c.key] = false;
    });

    setFiltros(filtrosLimpos);
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

          <div className="filtro-localizacao-wrapper" ref={localizacaoRef}>
            <input
              type="text"
              name="localizacao"
              placeholder="Bairro ou Cidade"
              value={filtros.localizacao}
              onChange={handleInputChange}
              onFocus={() => {
                if (sugestoes.length > 0) setMostrarSugestoes(true);
              }}
              className="filtro-input"
            />
            {mostrarSugestoes && sugestoes.length > 0 && (
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
                <label>Identificador (ID)</label>
                <input
                  type="number"
                  name="identificador"
                  placeholder="Digite o ID do imóvel"
                  value={filtros.identificador}
                  onChange={handleInputChange}
                  className="filtro-input-small"
                />
              </div>

              <div className="filtro-group">
                <label>Preço (R$)</label>
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
                <label>Área Total (m²)</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="areaTotalMin"
                    placeholder="Mínima"
                    value={filtros.areaTotalMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="areaTotalMax"
                    placeholder="Máxima"
                    value={filtros.areaTotalMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Área Construída (m²)</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="areaConstruidaMin"
                    placeholder="Mínima"
                    value={filtros.areaConstruidaMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="areaConstruidaMax"
                    placeholder="Máxima"
                    value={filtros.areaConstruidaMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Condomínio (R$)</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="condominioMin"
                    placeholder="Mínimo"
                    value={filtros.condominioMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="condominioMax"
                    placeholder="Máximo"
                    value={filtros.condominioMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>IPTU (R$)</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="iptuMin"
                    placeholder="Mínimo"
                    value={filtros.iptuMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="iptuMax"
                    placeholder="Máximo"
                    value={filtros.iptuMax}
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
                  placeholder="Quantidade"
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
                  placeholder="Quantidade"
                  value={filtros.banheiros}
                  onChange={handleInputChange}
                  className="filtro-input-small"
                />
              </div>

              <div className="filtro-group">
                <label>Vagas de Garagem</label>
                <input
                  type="number"
                  name="vagas"
                  placeholder="Quantidade"
                  value={filtros.vagas}
                  onChange={handleInputChange}
                  className="filtro-input-small"
                />
              </div>

              <div className="filtro-group">
                <label>Ar-Condicionado</label>
                <input
                  type="number"
                  name="arCondicionado"
                  placeholder="Quantidade"
                  value={filtros.arCondicionado}
                  onChange={handleInputChange}
                  className="filtro-input-small"
                />
              </div>

              <div className="filtro-group">
                <label>Andar</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="andarMin"
                    placeholder="Mínimo"
                    value={filtros.andarMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="andarMax"
                    placeholder="Máximo"
                    value={filtros.andarMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Total de Andares</label>
                <div className="filtro-range">
                  <input
                    type="number"
                    name="andarTotalMin"
                    placeholder="Mínimo"
                    value={filtros.andarTotalMin}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                  <span>até</span>
                  <input
                    type="number"
                    name="andarTotalMax"
                    placeholder="Máximo"
                    value={filtros.andarTotalMax}
                    onChange={handleInputChange}
                    className="filtro-input-small"
                  />
                </div>
              </div>

              <div className="filtro-group">
                <label>Construtora</label>
                <select
                  name="construtora"
                  value={filtros.construtora}
                  onChange={handleInputChange}
                  className="filtro-select-small"
                >
                  <option value="">Todas</option>
                  {construtoras.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="filtro-amenidades">
              <h4>Características</h4>
              <div className="filtro-checkbox-grid">
                {caracteristicasOrdenadas.map((caracteristica) => (
                  <label key={caracteristica.key} className="filtro-checkbox">
                    <input
                      type="checkbox"
                      name={caracteristica.key}
                      checked={filtros[caracteristica.key]}
                      onChange={handleInputChange}
                    />
                    <span>{caracteristica.label}</span>
                  </label>
                ))}
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
