"use client";

import { useState } from "react";
import axios from "axios";
import "./AdicionarImovel.css";

const booleanFields = [
  "acessibilidade_pcd",
  "aceita_animais",
  "academia",
  "alarme",
  "bicicletario",
  "brinquedoteca",
  "camera_vigilancia",
  "carregador_carro_eletrico",
  "churrasqueira",
  "closet",
  "elevador",
  "energia_solar",
  "escritorio",
  "estudio",
  "gerador_energia",
  "interfone",
  "jardim",
  "lago",
  "lareira",
  "lavanderia",
  "mobiliado",
  "na_planta",
  "playground",
  "piscina",
  "pomar",
  "portaria_24h",
  "quadra",
  "sala_jogos",
  "salao_de_festa",
  "suite",
  "varanda",
];

const estados = ["Santa Catarina"];
const cidades = [
  "Araranguá",
  "Balneário Arroio do Silva",
  "Criciúma",
  "Forquilhinha",
  "Içara",
  "Morro da Fumaça",
  "Nova Veneza",
  "Siderópolis",
  "Urussanga",
];
const finalidades = ["Aluguel", "Temporada", "Venda"];
const construtoras = [
  "Construfase",
  "Construtora Fontana",
  "Corbetta Construtora",
  "Criciúma Construções",
];

const AdicionarImovel = ({ showPopup, setShowPopup }) => {
  const [activeTab, setActiveTab] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [draggedIndex, setDraggedIndex] = useState(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    tipo: "",
    status: "",
    finalidade: "",
    destaque: false,
    visivel: true,
    cep: "",
    estado: "",
    cidade: "",
    bairro: "",
    area_total: "",
    area_construida: "",
    fotos: Array(10).fill(null),

    condominio: "",
    iptu: "",
    quarto: "",
    suite: false,
    banheiro: "",
    vaga: "",
    andar: "",
    andar_total: "",
    piscina: false,
    churrasqueira: false,
    salao_de_festa: false,
    academia: false,
    playground: false,
    jardim: false,
    varanda: false,
    interfone: false,
    acessibilidade_pcd: false,
    mobiliado: false,
    ar_condicionado: "",
    energia_solar: false,
    quadra: false,
    lavanderia: false,
    closet: false,
    escritorio: false,
    lareira: false,
    alarme: false,
    camera_vigilancia: false,
    bicicletario: false,
    sala_jogos: false,
    brinquedoteca: false,
    elevador: false,
    pomar: false,
    lago: false,
    aceita_animais: false,
    construtora: "",
    portaria_24h: false,
    carregador_carro_eletrico: false,
    gerador_energia: false,
    estudio: false,
    na_planta: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;

    if (name === "cep") {
      newValue = newValue.replace(/\D/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleFotoChange = (index, file) => {
    setFormData((prev) => {
      const newFotos = [...prev.fotos];
      newFotos[index] = file || null;
      return { ...prev, fotos: newFotos };
    });
  };

  const handleRemoveFoto = (index) => {
    setFormData((prev) => {
      const newFotos = [...prev.fotos];
      newFotos[index] = null;
      return { ...prev, fotos: newFotos };
    });
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;

    setFormData((prev) => {
      const newFotos = [...prev.fotos];
      const temp = newFotos[draggedIndex];
      newFotos[draggedIndex] = newFotos[index];
      newFotos[index] = temp;
      return { ...prev, fotos: newFotos };
    });
    setDraggedIndex(null);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setActiveTab(1);
    setErrorMsg("");
    setFormData({
      titulo: "",
      descricao: "",
      preco: "",
      tipo: "",
      status: "",
      finalidade: "",
      destaque: false,
      visivel: true,
      cep: "",
      estado: "",
      cidade: "",
      bairro: "",
      area_total: "",
      area_construida: "",
      fotos: Array(10).fill(null),
      condominio: "",
      iptu: "",
      quarto: "",
      suite: false,
      banheiro: "",
      vaga: "",
      andar: "",
      andar_total: "",
      piscina: false,
      churrasqueira: false,
      salao_de_festa: false,
      academia: false,
      playground: false,
      jardim: false,
      varanda: false,
      interfone: false,
      acessibilidade_pcd: false,
      mobiliado: false,
      ar_condicionado: "",
      energia_solar: false,
      quadra: false,
      lavanderia: false,
      closet: false,
      escritorio: false,
      lareira: false,
      alarme: false,
      camera_vigilancia: false,
      bicicletario: false,
      sala_jogos: false,
      brinquedoteca: false,
      elevador: false,
      pomar: false,
      lago: false,
      aceita_animais: false,
      construtora: "",
      portaria_24h: false,
      carregador_carro_eletrico: false,
      gerador_energia: false,
      estudio: false,
      na_planta: false,
    });
  };

  const parseNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.titulo || formData.titulo.trim() === "") {
      errors.push("Título");
    }
    if (!formData.descricao || formData.descricao.trim() === "") {
      errors.push("Descrição");
    }
    if (!formData.preco || parseNumberOrNull(formData.preco) === null) {
      errors.push("Preço");
    }

    if (errors.length > 0) {
      setErrorMsg(
        `Os seguintes campos obrigatórios estão ausentes ou inválidos: ${errors.join(
          ", "
        )}`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) {
      return;
    }

    try {
      const imovelPayload = {
        titulo: formData.titulo || null,
        descricao: formData.descricao || null,
        preco: parseNumberOrNull(formData.preco),
        tipo: formData.tipo || null,
        status: formData.status || null,
        finalidade: formData.finalidade || null,
        destaque: !!formData.destaque,
        visivel: formData.visivel ?? true,
        cep: formData.cep || null,
        estado: formData.estado || null,
        cidade: formData.cidade || null,
        bairro: formData.bairro || null,
        area_total: parseNumberOrNull(formData.area_total),
        area_construida: parseNumberOrNull(formData.area_construida),
        criado_por: 1,
      };

      const createRes = await axios.post(
        "http://localhost:5000/api/imoveis",
        imovelPayload
      );
      const imovelId = createRes.data?.id;
      if (!imovelId) throw new Error("ID do imóvel não retornado.");

      const caracteristicasPayload = {
        imovel_id: imovelId,
        condominio: parseNumberOrNull(formData.condominio),
        iptu: parseNumberOrNull(formData.iptu),
        quarto: parseNumberOrNull(formData.quarto),
        banheiro: parseNumberOrNull(formData.banheiro),
        vaga: parseNumberOrNull(formData.vaga),
        andar: parseNumberOrNull(formData.andar),
        andar_total: parseNumberOrNull(formData.andar_total),
        ar_condicionado: parseNumberOrNull(formData.ar_condicionado),
        construtora: formData.construtora?.trim() || null,
        ...booleanFields.reduce((acc, f) => {
          acc[f] = !!formData[f];
          return acc;
        }, {}),
      };

      await axios.post(
        "http://localhost:5000/api/imoveis_caracteristicas",
        caracteristicasPayload
      );

      const formDataFotos = new FormData();
      formData.fotos.forEach((foto) => {
        if (foto) formDataFotos.append("fotos", foto);
      });

      if (formDataFotos.has("fotos")) {
        await axios.post(
          `http://localhost:5000/api/imoveis/${imovelId}/upload`,
          formDataFotos,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      alert("Imóvel cadastrado com sucesso!");
      handleClosePopup();
    } catch (err) {
      console.error("Erro ao cadastrar imóvel:", err);
      setErrorMsg(
        err.response?.data?.error || err.message || "Erro inesperado."
      );
    }
  };

  const formatFieldLabel = (field) => {
    const labels = {
      acessibilidade_pcd: "Acessibilidade PCD",
      aceita_animais: "Aceita Animais",
      academia: "Academia",
      alarme: "Alarme",
      bicicletario: "Bicicletário",
      brinquedoteca: "Brinquedoteca",
      camera_vigilancia: "Câmera de Vigilância",
      carregador_carro_eletrico: "Carregador de Carro Elétrico",
      churrasqueira: "Churrasqueira",
      closet: "Closet",
      elevador: "Elevador",
      energia_solar: "Energia Solar",
      escritorio: "Escritório",
      estudio: "Estúdio",
      gerador_energia: "Gerador de Energia",
      interfone: "Interfone",
      jardim: "Jardim",
      lago: "Lago",
      lareira: "Lareira",
      lavanderia: "Lavanderia",
      mobiliado: "Mobiliado",
      na_planta: "Na Planta",
      playground: "Playground",
      piscina: "Piscina",
      pomar: "Pomar",
      portaria_24h: "Portaria 24h",
      quadra: "Quadra",
      sala_jogos: "Sala de Jogos",
      salao_de_festa: "Salão de Festa",
      suite: "Suíte",
      varanda: "Varanda",
    };
    return labels[field] || field.replace(/_/g, " ");
  };

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-popup-btn" onClick={handleClosePopup}>
              ×
            </button>

            {errorMsg && <p className="error-msg">{errorMsg}</p>}

            <div className="tabs-container">
              <button
                className={`tab ${activeTab === 1 ? "active" : ""}`}
                onClick={() => setActiveTab(1)}
                type="button"
              >
                Informações Básicas
              </button>
              <button
                className={`tab ${activeTab === 2 ? "active" : ""}`}
                onClick={() => setActiveTab(2)}
                type="button"
              >
                Características
              </button>
              <button
                className={`tab ${activeTab === 3 ? "active" : ""}`}
                onClick={() => setActiveTab(3)}
                type="button"
              >
                Fotos
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {activeTab === 1 && (
                <div className="tab-content">
                  <h4>Identificação</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="titulo"
                      placeholder="Título *"
                      value={formData.titulo}
                      onChange={handleInputChange}
                      className="full-width"
                    />
                  </div>

                  <div className="form-row">
                    <textarea
                      name="descricao"
                      placeholder="Descrição *"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      className="full-width"
                      rows="4"
                    />
                  </div>

                  <h4>Valor</h4>
                  <div className="form-row">
                    <input
                      type="number"
                      name="preco"
                      placeholder="Preço *"
                      value={formData.preco}
                      onChange={handleInputChange}
                      className="full-width"
                    />
                  </div>

                  <h4>Classificação</h4>
                  <div className="form-row">
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione o Tipo</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Casa">Casa</option>
                      <option value="Chalé">Chalé</option>
                      <option value="Cobertura">Cobertura</option>
                      <option value="Fazenda">Fazenda</option>
                      <option value="Galpão">Galpão</option>
                      <option value="Kitnet">Kitnet</option>
                      <option value="Sala comercial">Sala Comercial</option>
                      <option value="Sítio">Sítio</option>
                      <option value="Terreno">Terreno</option>
                    </select>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione o Status</option>
                      <option value="disponivel">Disponível</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <select
                      name="finalidade"
                      value={formData.finalidade}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione a Finalidade</option>
                      {finalidades.map((f) => (
                        <option key={f} value={f.toLowerCase()}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h4>Destaque</h4>
                  <div className="form-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="destaque"
                        checked={formData.destaque}
                        onChange={handleInputChange}
                      />
                      <span>Marcar como Destaque</span>
                    </label>
                  </div>

                  <h4>Localização</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="cep"
                      placeholder="CEP"
                      value={formData.cep}
                      onChange={handleInputChange}
                    />
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione o Estado</option>
                      {estados.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-row">
                    <select
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                    >
                      <option value="">Selecione a Cidade</option>
                      {cidades.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="bairro"
                      placeholder="Bairro"
                      value={formData.bairro}
                      onChange={handleInputChange}
                    />
                  </div>

                  <h4>Áreas</h4>
                  <div className="form-row">
                    <input
                      type="number"
                      name="area_total"
                      placeholder="Área Total (m²)"
                      value={formData.area_total}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="area_construida"
                      placeholder="Área Construída (m²)"
                      value={formData.area_construida}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}

              {activeTab === 2 && (
                <div className="tab-content">
                  <h4>Valores</h4>
                  <div className="form-row">
                    <input
                      type="number"
                      name="condominio"
                      placeholder="Condomínio (R$)"
                      value={formData.condominio}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="iptu"
                      placeholder="IPTU (R$)"
                      value={formData.iptu}
                      onChange={handleInputChange}
                    />
                  </div>

                  <h4>Cômodos</h4>
                  <div className="form-row">
                    <input
                      type="number"
                      name="quarto"
                      placeholder="Quartos"
                      value={formData.quarto}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="banheiro"
                      placeholder="Banheiros"
                      value={formData.banheiro}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="number"
                      name="vaga"
                      placeholder="Vagas de Garagem"
                      value={formData.vaga}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="ar_condicionado"
                      placeholder="Ar Condicionado"
                      value={formData.ar_condicionado}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-row">
                    <input
                      type="number"
                      name="andar"
                      placeholder="Andar"
                      value={formData.andar}
                      onChange={handleInputChange}
                    />
                    <input
                      type="number"
                      name="andar_total"
                      placeholder="Total de Andares"
                      value={formData.andar_total}
                      onChange={handleInputChange}
                    />
                  </div>

                  <h4>Construtora</h4>
                  <div className="form-row">
                    <select
                      name="construtora"
                      value={formData.construtora}
                      onChange={handleInputChange}
                      className="full-width"
                    >
                      <option value="">Selecione a Construtora</option>
                      {construtoras.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h4>Características</h4>
                  <div className="caracteristicas-grid">
                    {booleanFields.map((f) => (
                      <label key={f} className="checkbox-label">
                        <input
                          type="checkbox"
                          name={f}
                          checked={formData[f]}
                          onChange={handleInputChange}
                        />
                        <span>{formatFieldLabel(f)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div className="tab-content">
                  <div className="fotos-grid">
                    {formData.fotos.map((foto, idx) => (
                      <div
                        key={idx}
                        className={`foto-item ${foto ? "has-photo" : ""}`}
                        draggable={!!foto}
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(idx)}
                      >
                        {foto ? (
                          <>
                            <img
                              src={
                                URL.createObjectURL(foto) || "/placeholder.svg"
                              }
                              alt={`foto-${idx}`}
                            />
                            <button
                              type="button"
                              className="remove-foto-btn"
                              onClick={() => handleRemoveFoto(idx)}
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <label className="foto-upload-label">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFotoChange(idx, e.target.files[0])
                              }
                              style={{ display: "none" }}
                            />
                            <span>+</span>
                          </label>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="submit-container">
                <button type="submit" className="submit-btn">
                  Adicionar Imóvel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AdicionarImovel;
