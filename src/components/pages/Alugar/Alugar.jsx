import "./Alugar.css";
import { IoHomeOutline } from "react-icons/io5";

const Alugar = () => {
  return (
    <main className="alugar-container">
      <div className="alugar-content">
        <div className="alugar-illustration">
          <div className="floating-home">
            <IoHomeOutline
              size={200}
              color="#191970"
              style={{ transform: "scaleX(-1)" }}
            />
          </div>
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
