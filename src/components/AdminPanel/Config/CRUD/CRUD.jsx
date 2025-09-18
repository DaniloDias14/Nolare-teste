import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CRUD.css";

const CRUD = () => {
  const [activeTab, setActiveTab] = useState("Create");
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    localizacao: "",
    area: "",
    quartos: "",
    banheiros: "",
    vagas: "",
    fotos: [null, null, null], // arquivos selecionados
  });
  const [imoveis, setImoveis] = useState([]);

  // Listar imóveis (Read)
  const fetchImoveis = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/imoveis");
      setImoveis(res.data);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
    }
  };

  useEffect(() => {
    fetchImoveis();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFotoChange = (index, file) => {
    const newFotos = [...formData.fotos];
    newFotos[index] = file;
    setFormData({ ...formData, fotos: newFotos });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Criar imóvel primeiro
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        preco: formData.preco,
        endereco: formData.localizacao,
        criado_por: 1, // Substitua pelo ID do admin logado
      };

      const res = await axios.post(
        "http://localhost:5000/api/imoveis",
        payload
      );
      const imovelId = res.data.id;

      // Upload de fotos
      const formDataFotos = new FormData();
      formData.fotos.forEach((foto) => {
        if (foto) formDataFotos.append("fotos", foto);
      });

      if (formDataFotos.has("fotos")) {
        await axios.post(
          `http://localhost:5000/api/imoveis/${imovelId}/upload`,
          formDataFotos,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      alert("Imóvel criado com sucesso!");
      setShowPopup(false);
      setFormData({
        titulo: "",
        descricao: "",
        preco: "",
        localizacao: "",
        area: "",
        quartos: "",
        banheiros: "",
        vagas: "",
        fotos: [null, null, null],
      });

      fetchImoveis(); // Atualiza a lista
    } catch (err) {
      console.error("Erro ao criar imóvel:", err);
      alert("Erro ao criar imóvel.");
    }
  };

  return (
    <div className="crud-container">
      <h2>Gerenciar Imóveis (CRUD)</h2>

      <div className="tabs">
        {["Create", "Read", "Update", "Delete"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Create" && (
        <>
          <button className="open-popup" onClick={() => setShowPopup(true)}>
            Adicionar Novo Imóvel
          </button>

          {showPopup && (
            <div className="popup-overlay">
              <div className="popup">
                <h3>Cadastrar Imóvel</h3>
                <form onSubmit={handleSubmit}>
                  <input
                    type="text"
                    name="titulo"
                    placeholder="Título"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="descricao"
                    placeholder="Descrição"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="number"
                    name="preco"
                    placeholder="Preço"
                    value={formData.preco}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="localizacao"
                    placeholder="Localização"
                    value={formData.localizacao}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="area"
                    placeholder="Área"
                    value={formData.area}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="quartos"
                    placeholder="Quartos"
                    value={formData.quartos}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="banheiros"
                    placeholder="Banheiros"
                    value={formData.banheiros}
                    onChange={handleInputChange}
                  />
                  <input
                    type="number"
                    name="vagas"
                    placeholder="Vagas"
                    value={formData.vagas}
                    onChange={handleInputChange}
                  />

                  <div className="foto-inputs">
                    {formData.fotos.map((foto, idx) => (
                      <input
                        key={idx}
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFotoChange(idx, e.target.files[0])
                        }
                      />
                    ))}
                  </div>

                  <div className="popup-actions">
                    <button type="submit">Salvar</button>
                    <button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="cancel-btn"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "Read" && (
        <div className="read-section">
          {imoveis.length === 0 ? (
            <p>Nenhum imóvel cadastrado.</p>
          ) : (
            <div className="imoveis-list">
              {imoveis.map((imovel) => (
                <div key={imovel.id} className="imovel-card">
                  <h4>{imovel.titulo}</h4>
                  <p>{imovel.descricao}</p>
                  <p>Preço: R$ {imovel.preco}</p>
                  <p>Endereço: {imovel.endereco}</p>

                  {imovel.fotos &&
                    imovel.fotos.length > 0 &&
                    imovel.fotos.map((foto) => (
                      <img
                        key={foto.id}
                        src={`http://localhost:5000${foto.caminho_foto}`}
                        alt={imovel.titulo}
                        style={{ width: "200px", marginRight: "10px" }}
                      />
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab !== "Create" && activeTab !== "Read" && (
        <p>Funcionalidade {activeTab} ainda não implementada.</p>
      )}
    </div>
  );
};

export default CRUD;
