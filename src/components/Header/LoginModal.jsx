// LoginModal.jsx
import { useState } from "react";
import axios from "axios";
import "./LoginModal.css";

const LoginModal = ({ onClose, setAdmLogged, setUser }) => {
  const [tab, setTab] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");
  const [registerNome, setRegisterNome] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerSenha, setRegisterSenha] = useState("");
  const [registerConfirmSenha, setRegisterConfirmSenha] = useState("");
  const [registerTipo, setRegisterTipo] = useState("user");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email: loginEmail,
        senha: loginSenha,
      });

      if (response.data && response.data.user) {
        const user = response.data.user;

        // salva usuário globalmente
        setUser(user);
        localStorage.setItem("nolare_user", JSON.stringify(user));

        // Admin liberado caso seja tipo adm
        setAdmLogged(user.tipo_usuario === "adm");

        // Mensagem no console
        if (user.tipo_usuario === "adm") {
          console.log("Fez login como adm");
        } else if (user.tipo_usuario === "user") {
          console.log("Fez login como user");
        }

        setError("");
        onClose();
      } else {
        setAdmLogged(false);
        setError("Credenciais inválidas!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setAdmLogged(false);
      setError(errorMsg);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (registerSenha !== registerConfirmSenha) {
      setError("As senhas não coincidem!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/register", {
        nome: registerNome,
        email: registerEmail,
        senha: registerSenha,
        tipo_usuario: registerTipo,
      });

      setTab("login");
      setError("");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setError(errorMsg);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="tabs">
          <button
            className={tab === "login" ? "active" : ""}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={tab === "register" ? "active" : ""}
            onClick={() => setTab("register")}
          >
            Cadastro
          </button>
        </div>

        {tab === "login" && (
          <form onSubmit={handleLogin}>
            <label>Email</label>
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />

            <label>Senha</label>
            <input
              type="password"
              value={loginSenha}
              onChange={(e) => setLoginSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />

            <button type="submit">Entrar</button>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegister}>
            <label>Nome</label>
            <input
              type="text"
              value={registerNome}
              onChange={(e) => setRegisterNome(e.target.value)}
              placeholder="Digite seu nome"
              required
            />

            <label>Email</label>
            <input
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              placeholder="Digite seu email"
              required
            />

            <label>Senha</label>
            <input
              type="password"
              value={registerSenha}
              onChange={(e) => setRegisterSenha(e.target.value)}
              placeholder="Digite sua senha"
              required
            />

            <label>Confirmar Senha</label>
            <input
              type="password"
              value={registerConfirmSenha}
              onChange={(e) => setRegisterConfirmSenha(e.target.value)}
              placeholder="Confirme sua senha"
              required
            />

            <label>Tipo de usuário</label>
            <select
              value={registerTipo}
              onChange={(e) => setRegisterTipo(e.target.value)}
            >
              <option value="user">Usuário</option>
              <option value="adm">Administrador</option>
            </select>

            <button type="submit">Cadastrar</button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default LoginModal;
