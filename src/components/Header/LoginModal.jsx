import { useState } from "react";
import axios from "axios";
import "./LoginModal.css";

const LoginModal = ({ onClose, setAdmLogged }) => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Faz requisição para o backend
      const response = await axios.post("http://localhost:5000/api/login", {
        email,
        senha,
      });

      // Se a API retornar um usuário
      if (response.data && response.data.user) {
        const user = response.data.user;

        console.log("✅ Login realizado com sucesso!");
        console.log("Usuário:", user);

        // Se for admin, libera botão; caso contrário, garante que fique oculto
        if (typeof setAdmLogged === "function") {
          if (user.tipo_usuario === "adm") {
            console.log("🔑 Usuário é administrador. Botão admin liberado.");
            setAdmLogged(true);
          } else {
            console.log("👤 Usuário comum. Botão admin ocultado.");
            setAdmLogged(false);
          }
        }

        setError("");
        onClose();
      } else {
        console.log("❌ Credenciais inválidas!");
        if (typeof setAdmLogged === "function") setAdmLogged(false);
        setError("Credenciais inválidas!");
      }
    } catch (err) {
      // Captura erro detalhado do backend
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      console.error("❌ Erro ao fazer login:", errorMsg);

      // Mensagens específicas no console
      if (typeof errorMsg === "string") {
        const lower = errorMsg.toLowerCase();
        if (
          lower.includes("usuário") ||
          lower.includes("não encontrado") ||
          lower.includes("email")
        ) {
          console.log("❌ Email não encontrado!");
        } else if (lower.includes("senha") || lower.includes("incorreta")) {
          console.log("❌ Senha incorreta!");
        } else {
          console.log("❌ Erro de autenticação:", errorMsg);
        }
      }

      if (typeof setAdmLogged === "function") setAdmLogged(false);
      setError(errorMsg);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit">Entrar</button>
          {error && <p className="error">{error}</p>}
        </form>
        <button onClick={onClose} className="close-btn">
          Fechar
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
