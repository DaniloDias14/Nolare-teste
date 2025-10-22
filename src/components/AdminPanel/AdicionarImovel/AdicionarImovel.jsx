"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [newImovelId, setNewImovelId] = useState(null);

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
    map_url: "",
    fotoMaps: null,

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

  const formatCurrency = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 11);
    if (!limited || limited === "0" || Number.parseInt(limited) === 0) {
      return "";
    }
    const num = Number.parseInt(limited);
    const intPart = Math.floor(num / 100).toString();
    const decPart = (num % 100).toString().padStart(2, "0");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${formattedInt},${decPart}`;
  };

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, "");
    const limited = numbers.slice(0, 8);
    if (!limited || limited === "0" || Number.parseInt(limited) === 0) {
      return "";
    }
    if (limited.length <= 5) {
      return limited;
    }
    return limited.replace(/(\d{5})(\d{0,3})/, "$1-$2");
  };

  const parseCurrency = (formatted) => {
    const numbers = formatted.replace(/\./g, "").replace(",", ".");
    const num = Number.parseFloat(numbers);
    return isNaN(num) ? 0 : num;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === "checkbox" ? checked : value;
    if (name === "cep") {
      newValue = formatCEP(value);
    }
    if (name === "preco" || name === "condominio" || name === "iptu") {
      newValue = formatCurrency(value);
    }
    if (
      type === "number" ||
      [
        "area_total",
        "area_construida",
        "quarto",
        "banheiro",
        "vaga",
        "andar",
        "andar_total",
        "ar_condicionado",
      ].includes(name)
    ) {
      if (
        value.includes("e") ||
        value.includes("E") ||
        value.includes("+") ||
        value.includes("-")
      ) {
        return;
      }
      if (Number.parseFloat(value) < 0 || value === "0") {
        return;
      }
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

  const handleFotoMapsChange = (file) => {
    setFormData((prev) => ({
      ...prev,
      fotoMaps: file || null,
    }));
  };

  const handleRemoveFoto = (index) => {
    setFormData((prev) => {
      const newFotos = [...prev.fotos];
      newFotos[index] = null;
      return { ...prev, fotos: newFotos };
    });
  };

  const handleRemoveFotoMaps = () => {
    setFormData((prev) => ({
      ...prev,
      fotoMaps: null,
    }));
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
    setFieldErrors({}); // Reset field errors on close
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
      map_url: "",
      fotoMaps: null,
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
    const errors = {};
    let firstErrorTab = null;

    // Tab 1 - Informações Básicas
    if (!formData.titulo || formData.titulo.trim() === "") {
      errors.titulo = "O campo Título é obrigatório";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.descricao || formData.descricao.trim() === "") {
      errors.descricao = "O campo Descrição é obrigatório";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.preco || parseCurrency(formData.preco) === 0) {
      errors.preco = "O campo Preço é obrigatório e deve ser maior que zero";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.tipo || formData.tipo === "") {
      errors.tipo = "Selecione o Tipo do imóvel";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.status || formData.status === "") {
      errors.status = "Selecione o Status do imóvel";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.finalidade || formData.finalidade === "") {
      errors.finalidade = "Selecione a Finalidade do imóvel";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.cep || formData.cep.trim() === "") {
      errors.cep = "O campo CEP é obrigatório";
      if (!firstErrorTab) firstErrorTab = 1;
    } else if (formData.cep.replace(/\D/g, "").length !== 8) {
      errors.cep = "CEP deve conter exatamente 8 dígitos";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.estado || formData.estado === "") {
      errors.estado = "Selecione o Estado";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.cidade || formData.cidade === "") {
      errors.cidade = "Selecione a Cidade";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    if (!formData.bairro || formData.bairro.trim() === "") {
      errors.bairro = "O campo Bairro é obrigatório";
      if (!firstErrorTab) firstErrorTab = 1;
    }

    // Tab 3 - Fotos
    const hasAtLeastOnePhoto = formData.fotos.some((foto) => foto !== null);
    if (!hasAtLeastOnePhoto) {
      errors.fotos = "Adicione pelo menos uma foto do imóvel";
      if (!firstErrorTab) firstErrorTab = 3;
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Navigate to the first tab with errors
      if (firstErrorTab) {
        setActiveTab(firstErrorTab);
      }
      setErrorMsg("Por favor, corrija os erros destacados nos campos abaixo");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }
    setShowConfirmPopup(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmPopup(false);
    try {
      const imovelPayload = {
        titulo: formData.titulo || null,
        descricao: formData.descricao || null,
        preco: parseCurrency(formData.preco),
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
        map_url: formData.map_url || null,
      };

      const createRes = await axios.post(
        "http://localhost:5000/api/imoveis",
        imovelPayload
      );
      const imovelId = createRes.data?.id;
      if (!imovelId)
        throw new Error("ID do imóvel não retornado pelo servidor");

      const caracteristicasPayload = {
        imovel_id: imovelId,
        condominio: parseCurrency(formData.condominio),
        iptu: parseCurrency(formData.iptu),
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
        try {
          await axios.post(
            `http://localhost:5000/api/imoveis/${imovelId}/upload`,
            formDataFotos,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } catch (uploadErr) {
          console.error("Erro ao fazer upload das fotos:", uploadErr);
          throw new Error(
            "Erro ao fazer upload das fotos do imóvel. Verifique o tamanho e formato das imagens."
          );
        }
      }

      if (formData.fotoMaps) {
        const formDataMaps = new FormData();
        formDataMaps.append("fotos", formData.fotoMaps);
        formDataMaps.append("isFotoMaps", "true");
        try {
          await axios.post(
            `http://localhost:5000/api/imoveis/${imovelId}/upload`,
            formDataMaps,
            {
              headers: { "Content-Type": "multipart/form-data" },
            }
          );
        } catch (uploadErr) {
          console.error(
            "Erro ao fazer upload da foto do Google Maps:",
            uploadErr
          );
          throw new Error(
            "Erro ao fazer upload da foto do Google Maps. Verifique o tamanho e formato da imagem."
          );
        }
      }
      setNewImovelId(imovelId);
      setShowSuccessPopup(true);
    } catch (err) {
      console.error("Erro ao cadastrar imóvel:", err);
      let errorMessage = "Erro inesperado ao cadastrar o imóvel";

      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.error) {
        errorMessage = `Erro no servidor: ${err.response.data.error}`;
      } else if (err.response?.status === 500) {
        errorMessage = "Erro interno do servidor. Tente novamente mais tarde.";
      } else if (err.response?.status === 400) {
        errorMessage =
          "Dados inválidos. Verifique os campos e tente novamente.";
      } else if (!navigator.onLine) {
        errorMessage =
          "Sem conexão com a internet. Verifique sua conexão e tente novamente.";
      }

      setErrorMsg(errorMessage);
      setActiveTab(1); // Go back to first tab to show error
    }
  };

  const handleGoToImovel = () => {
    setShowSuccessPopup(false);
    handleClosePopup();
    navigate(`/imovel/${newImovelId}`);
  };

  const handleCloseSuccess = () => {
    setShowSuccessPopup(false);
    handleClosePopup();
    navigate("/comprar");
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

  const handleTabClick = (tabNumber) => {
    // Validate current tab before switching
    if (tabNumber === 2 && activeTab === 1) {
      const currentErrors = {};
      if (!formData.titulo || formData.titulo.trim() === "")
        currentErrors.titulo = "O campo Título é obrigatório";
      if (!formData.descricao || formData.descricao.trim() === "")
        currentErrors.descricao = "O campo Descrição é obrigatório";
      if (!formData.preco || parseCurrency(formData.preco) === 0)
        currentErrors.preco =
          "O campo Preço é obrigatório e deve ser maior que zero";
      if (!formData.tipo || formData.tipo === "")
        currentErrors.tipo = "Selecione o Tipo do imóvel";
      if (!formData.status || formData.status === "")
        currentErrors.status = "Selecione o Status do imóvel";
      if (!formData.finalidade || formData.finalidade === "")
        currentErrors.finalidade = "Selecione a Finalidade do imóvel";
      if (!formData.cep || formData.cep.trim() === "") {
        currentErrors.cep = "O campo CEP é obrigatório";
      } else if (formData.cep.replace(/\D/g, "").length !== 8) {
        currentErrors.cep = "CEP deve conter exatamente 8 dígitos";
      }
      if (!formData.estado || formData.estado === "")
        currentErrors.estado = "Selecione o Estado";
      if (!formData.cidade || formData.cidade === "")
        currentErrors.cidade = "Selecione a Cidade";
      if (!formData.bairro || formData.bairro.trim() === "")
        currentErrors.bairro = "O campo Bairro é obrigatório";

      if (Object.keys(currentErrors).length > 0) {
        setFieldErrors(currentErrors);
        setErrorMsg("Por favor, corrija os erros destacados nos campos abaixo");
        return;
      }
    }
    if (tabNumber === 3 && activeTab === 2) {
      // Add validation for tab 2 if needed before switching to tab 3
    }
    setActiveTab(tabNumber);
    setErrorMsg(""); // Clear general error message on tab switch
    // Don't clear field errors here, let validateForm handle it
  };

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showPopup]);

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
                className={`tab ${activeTab === 1 ? "active" : ""} ${
                  Object.keys(fieldErrors).some((key) =>
                    [
                      "titulo",
                      "descricao",
                      "preco",
                      "tipo",
                      "status",
                      "finalidade",
                      "cep",
                      "estado",
                      "cidade",
                      "bairro",
                    ].includes(key)
                  )
                    ? "has-error"
                    : ""
                }`}
                onClick={() => handleTabClick(1)}
                type="button"
              >
                Informações Básicas
              </button>
              <button
                className={`tab ${activeTab === 2 ? "active" : ""}`}
                onClick={() => handleTabClick(2)}
                type="button"
              >
                Características
              </button>
              <button
                className={`tab ${activeTab === 3 ? "active" : ""} ${
                  fieldErrors.fotos ? "has-error" : ""
                }`}
                onClick={() => handleTabClick(3)}
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
                      className={`full-width ${
                        fieldErrors.titulo ? "input-error" : ""
                      }`}
                    />
                  </div>
                  {fieldErrors.titulo && (
                    <p className="field-error-msg">{fieldErrors.titulo}</p>
                  )}

                  <div className="form-row">
                    <textarea
                      name="descricao"
                      placeholder="Descrição *"
                      value={formData.descricao}
                      onChange={handleInputChange}
                      className={`full-width ${
                        fieldErrors.descricao ? "input-error" : ""
                      }`}
                      rows="4"
                    />
                  </div>
                  {fieldErrors.descricao && (
                    <p className="field-error-msg">{fieldErrors.descricao}</p>
                  )}

                  <h4>Preço</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="preco"
                      placeholder={formData.preco ? "" : "Preço*"}
                      value={formData.preco}
                      onChange={handleInputChange}
                      className={`full-width ${
                        fieldErrors.preco ? "input-error" : ""
                      }`}
                    />
                  </div>
                  {fieldErrors.preco && (
                    <p className="field-error-msg">{fieldErrors.preco}</p>
                  )}

                  <h4>Classificação</h4>
                  <div className="form-row">
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      className={fieldErrors.tipo ? "input-error" : ""}
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
                      className={fieldErrors.status ? "input-error" : ""}
                    >
                      <option value="">Selecione o Status</option>
                      <option value="disponivel">Disponível</option>
                      <option value="vendido">Vendido</option>
                    </select>
                  </div>
                  {fieldErrors.tipo && (
                    <p className="field-error-msg">{fieldErrors.tipo}</p>
                  )}
                  {fieldErrors.status && (
                    <p className="field-error-msg">{fieldErrors.status}</p>
                  )}

                  <div className="form-row">
                    <select
                      name="finalidade"
                      value={formData.finalidade}
                      onChange={handleInputChange}
                      className={`${
                        fieldErrors.finalidade ? "input-error" : ""
                      }`}
                    >
                      <option value="">Selecione a Finalidade</option>
                      {finalidades.map((f) => (
                        <option key={f} value={f.toLowerCase()}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.finalidade && (
                    <p className="field-error-msg">{fieldErrors.finalidade}</p>
                  )}

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
                      placeholder={formData.cep ? "" : "CEP *"}
                      value={formData.cep}
                      onChange={handleInputChange}
                      className={fieldErrors.cep ? "input-error" : ""}
                    />
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className={fieldErrors.estado ? "input-error" : ""}
                    >
                      <option value="">Selecione o Estado</option>
                      {estados.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.cep && (
                    <p className="field-error-msg">{fieldErrors.cep}</p>
                  )}
                  {fieldErrors.estado && (
                    <p className="field-error-msg">{fieldErrors.estado}</p>
                  )}

                  <div className="form-row">
                    <select
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleInputChange}
                      className={fieldErrors.cidade ? "input-error" : ""}
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
                      className={fieldErrors.bairro ? "input-error" : ""}
                    />
                  </div>
                  {fieldErrors.cidade && (
                    <p className="field-error-msg">{fieldErrors.cidade}</p>
                  )}
                  {fieldErrors.bairro && (
                    <p className="field-error-msg">{fieldErrors.bairro}</p>
                  )}

                  <div className="form-row">
                    <input
                      type="text"
                      name="map_url"
                      placeholder="URL do Google Maps"
                      value={formData.map_url}
                      onChange={handleInputChange}
                      className="full-width"
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
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <input
                      type="number"
                      name="area_construida"
                      placeholder="Área Construída (m²)"
                      value={formData.area_construida}
                      onChange={handleInputChange}
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </div>
              )}
              {activeTab === 2 && (
                <div className="tab-content">
                  <h4>Valores</h4>
                  <div className="form-row">
                    <input
                      type="text"
                      name="condominio"
                      placeholder={formData.condominio ? "" : "Condomíno"}
                      value={formData.condominio}
                      onChange={handleInputChange}
                    />
                    <input
                      type="text"
                      name="iptu"
                      placeholder={formData.iptu ? "" : "IPTU"}
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
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <input
                      type="number"
                      name="banheiro"
                      placeholder="Banheiros"
                      value={formData.banheiro}
                      onChange={handleInputChange}
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="number"
                      name="vaga"
                      placeholder="Vagas de Garagem"
                      value={formData.vaga}
                      onChange={handleInputChange}
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <input
                      type="number"
                      name="ar_condicionado"
                      placeholder="Ar Condicionado"
                      value={formData.ar_condicionado}
                      onChange={handleInputChange}
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                  <div className="form-row">
                    <input
                      type="number"
                      name="andar"
                      placeholder="Andar"
                      value={formData.andar}
                      onChange={handleInputChange}
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <input
                      type="number"
                      name="andar_total"
                      placeholder="Total de Andares"
                      value={formData.andar_total}
                      onChange={handleInputChange}
                      min="1"
                      onKeyDown={(e) => {
                        if (
                          e.key === "e" ||
                          e.key === "E" ||
                          e.key === "-" ||
                          e.key === "+"
                        ) {
                          e.preventDefault();
                        }
                        if (e.key === "0" && !e.target.value) {
                          e.preventDefault();
                        }
                      }}
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
                  <h4>Fotos do Imóvel</h4>
                  {fieldErrors.fotos && (
                    <p className="field-error-msg">{fieldErrors.fotos}</p>
                  )}
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
                  <h4 style={{ marginTop: "30px" }}>Foto Google Maps</h4>
                  <div className="foto-maps-container">
                    <div
                      className={`foto-item foto-maps ${
                        formData.fotoMaps ? "has-photo" : ""
                      }`}
                    >
                      {formData.fotoMaps ? (
                        <>
                          <img
                            src={
                              URL.createObjectURL(formData.fotoMaps) ||
                              "/placeholder.svg"
                            }
                            alt="foto-maps"
                          />
                          <button
                            type="button"
                            className="remove-foto-btn"
                            onClick={handleRemoveFotoMaps}
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
                              handleFotoMapsChange(e.target.files[0])
                            }
                            style={{ display: "none" }}
                          />
                          <span>+</span>
                        </label>
                      )}
                    </div>
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
      {showConfirmPopup && (
        <div
          className="popup-overlay"
          onClick={() => setShowConfirmPopup(false)}
        >
          <div
            className="confirmation-popup"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirmar Cadastro</h3>
            <p>Tem certeza que deseja adicionar este imóvel?</p>
            <div className="confirmation-buttons">
              <button className="confirm-btn" onClick={handleConfirmSubmit}>
                Confirmar
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowConfirmPopup(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {showSuccessPopup && (
        <div className="popup-overlay" onClick={handleCloseSuccess}>
          <div className="success-popup" onClick={(e) => e.stopPropagation()}>
            <button className="close-popup-btn" onClick={handleCloseSuccess}>
              ×
            </button>
            <h3>Imóvel Cadastrado com Sucesso!</h3>
            <div className="success-buttons">
              <button className="go-to-imovel-btn" onClick={handleGoToImovel}>
                Ver Imóvel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdicionarImovel;
