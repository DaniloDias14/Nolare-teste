import "./Alugar.css";

const Alugar = () => {
  return (
    <main className="alugar-container">
      <div className="alugar-content">
        <div className="alugar-illustration">
          <div className="house-icon">
            <div className="house-roof"></div>
            <div className="house-body">
              <div className="house-door"></div>
              <div className="house-window"></div>
              <div className="house-window"></div>
            </div>
          </div>
          <div className="coming-soon-badge">Em breve</div>
        </div>

        <h1 className="alugar-title">Aluguel em Desenvolvimento</h1>
        <p className="alugar-text">
          Ainda não trabalhamos com aluguel, mas em breve estaremos prontos para
          isso.
        </p>
        <p className="alugar-subtext">
          Estamos preparando as melhores opções de imóveis para locação. Fique
          atento!
        </p>
      </div>
    </main>
  );
};

export default Alugar;
