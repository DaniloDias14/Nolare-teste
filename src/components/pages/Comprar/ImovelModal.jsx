import "./ImovelModal.css";

const ImovelModal = ({ imovel, imagemAtual, setImagemAtual, onClose }) => {
  if (!imovel) return null;

  const proximaImagem = () => {
    setImagemAtual((prev) => ({
      ...prev,
      [imovel.id]: ((prev[imovel.id] || 0) + 1) % imovel.fotos.length,
    }));
  };

  const imagemAnterior = () => {
    setImagemAtual((prev) => ({
      ...prev,
      [imovel.id]:
        (prev[imovel.id] || 0) === 0
          ? imovel.fotos.length - 1
          : (prev[imovel.id] || 0) - 1,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        {/* Carrossel grande */}
        <div className="modal-carousel">
          {imovel.fotos && imovel.fotos.length > 0 ? (
            <>
              <button className="carousel-btn prev" onClick={imagemAnterior}>
                ◀
              </button>
              <img
                src={imovel.fotos[imagemAtual[imovel.id] || 0]?.caminho_foto}
                alt={imovel.titulo}
                className="modal-image"
              />
              <button className="carousel-btn next" onClick={proximaImagem}>
                ▶
              </button>
            </>
          ) : (
            <div className="no-image">Sem imagem</div>
          )}
        </div>

        {/* Informações detalhadas */}
        <div className="modal-details">
          <h2>{imovel.titulo}</h2>
          <p className="modal-price">R$ {imovel.preco}</p>
          <p className="modal-location">📍 {imovel.endereco}</p>
          <p className="modal-description">{imovel.descricao}</p>

          <div className="modal-features">
            {imovel.area && <p>🏠 {imovel.area}</p>}
            {imovel.quartos && <p>🛏️ {imovel.quartos} quartos</p>}
            {imovel.banheiros && <p>🚿 {imovel.banheiros} banheiros</p>}
            {imovel.vagas && <p>🚗 {imovel.vagas} vagas</p>}
          </div>

          <button className="contact-btn">Entrar em Contato</button>
        </div>
      </div>
    </div>
  );
};

export default ImovelModal;
