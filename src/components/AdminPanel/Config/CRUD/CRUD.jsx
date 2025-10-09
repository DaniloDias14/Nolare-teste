import React, { useState } from "react";
import axios from "axios";
import "./CRUD.css";

const booleanFields = [
  "suite",
  "piscina",
  "churrasqueira",
  "salao_de_festa",
  "academia",
  "playground",
  "jardim",
  "varanda",
  "interfone",
  "acessibilidade_pcd",
  "mobiliado",
  "energia_solar",
  "quadra",
  "lavanderia",
  "closet",
  "escritorio",
  "lareira",
  "alarme",
  "camera_vigilancia",
  "bicicletario",
  "sala_jogos",
  "brinquedoteca",
  "elevador",
  "pomar",
  "lago",
  "aceita_animais",
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
const finalidades = ["Venda", "Aluguel", "Temporada"];
const construtoras = [
  "Construfase",
  "Construtora Fontana",
  "Corbetta Construtora",
  "Criciúma Construções",
];

const CRUD = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");

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
    fotos: [null, null, null],

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

  const handleClosePopup = () => {
    setShowPopup(false);
    setStep(1);
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
      fotos: [null, null, null],
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
    });
  };

  const parseNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

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

  return (
    <div className="crud-container">
      <h2>Adicionar Novo Imóvel</h2>
      <button className="open-popup" onClick={() => setShowPopup(true)}>
        Adicionar Novo Imóvel
      </button>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-popup-btn" onClick={handleClosePopup}>
              ×
            </button>

            <h3>Cadastrar Imóvel</h3>
            {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <input
                    type="text"
                    name="titulo"
                    placeholder="Título"
                    value={formData.titulo}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="descricao"
                    placeholder="Descrição"
                    value={formData.descricao}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="preco"
                    placeholder="Preço"
                    value={formData.preco}
                    onChange={handleInputChange}
                  />

                  {/* Campo de tipo atualizado */}
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Casa">Casa</option>
                    <option value="Apartamento">Apartamento</option>
                    <option value="Cobertura">Cobertura</option>
                    <option value="Kitnet">Kitnet</option>
                    <option value="Terreno">Terreno</option>
                    <option value="Sala comercial">Sala comercial</option>
                    <option value="Galpão">Galpão</option>
                    <option value="Sítio">Sítio</option>
                    <option value="Fazenda">Fazenda</option>
                  </select>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione o status</option>
                    <option value="disponivel">Disponível</option>
                    <option value="vendido">Vendido</option>
                  </select>
                  <select
                    name="finalidade"
                    value={formData.finalidade}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione a finalidade</option>
                    {finalidades.map((f) => (
                      <option key={f} value={f.toLowerCase()}>
                        {f}
                      </option>
                    ))}
                  </select>

                  <label>
                    <input
                      type="checkbox"
                      name="destaque"
                      checked={formData.destaque}
                      onChange={handleInputChange}
                    />{" "}
                    Marcar como destaque
                  </label>

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
                    <option value="">Selecione o estado</option>
                    {estados.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  <select
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione a cidade</option>
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
                  <input
                    type="number"
                    name="area_total"
                    placeholder="Área Total"
                    value={formData.area_total}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="area_construida"
                    placeholder="Área Construída"
                    value={formData.area_construida}
                    onChange={handleInputChange}
                  />

                  <div>
                    <button type="button" onClick={() => setStep(2)}>
                      Próximo: Características
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h4>Características</h4>
                  {booleanFields.map((f) => (
                    <label key={f}>
                      <input
                        type="checkbox"
                        name={f}
                        checked={formData[f]}
                        onChange={handleInputChange}
                      />
                      {f.replace(/_/g, " ")}
                    </label>
                  ))}

                  {[
                    "condominio",
                    "iptu",
                    "quarto",
                    "banheiro",
                    "vaga",
                    "andar",
                    "andar_total",
                    "ar_condicionado",
                  ].map((f) => (
                    <input
                      key={f}
                      type="number"
                      name={f}
                      placeholder={f}
                      value={formData[f]}
                      onChange={handleInputChange}
                    />
                  ))}

                  <select
                    name="construtora"
                    value={formData.construtora}
                    onChange={handleInputChange}
                  >
                    <option value="">Selecione a construtora</option>
                    {construtoras.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <div>
                    <button type="button" onClick={() => setStep(1)}>
                      Voltar
                    </button>
                    <button type="button" onClick={() => setStep(3)}>
                      Próximo: Fotos
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h4>Fotos</h4>
                  {formData.fotos.map((foto, idx) => (
                    <div key={idx}>
                      {foto && (
                        <img
                          src={URL.createObjectURL(foto)}
                          alt={`foto-${idx}`}
                          width="120"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFotoChange(idx, e.target.files[0])
                        }
                      />
                    </div>
                  ))}
                  <div>
                    <button type="button" onClick={() => setStep(2)}>
                      Voltar
                    </button>
                    <button type="submit">Salvar Imóvel</button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRUD;
