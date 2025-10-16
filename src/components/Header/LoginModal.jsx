"use client";

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
  const [fieldErrors, setFieldErrors] = useState({});

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("mínimo 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("uma letra maiúscula");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("uma letra minúscula");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("um caractere especial");
    }
    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = {};
    if (!loginEmail.trim()) {
      errors.email = "Email é obrigatório";
    }
    if (!loginSenha.trim()) {
      errors.senha = "Senha é obrigatória";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/login", {
        email: loginEmail,
        senha: loginSenha,
      });

      if (response.data && response.data.user) {
        const user = response.data.user;

        setUser(user);
        localStorage.setItem("nolare_user", JSON.stringify(user));

        setAdmLogged(user.tipo_usuario === "adm");

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
      const errorMsg =
        err.response?.data?.error ||
        "Erro ao fazer login. Verifique suas credenciais.";
      setAdmLogged(false);
      setError(errorMsg);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = {};

    if (!registerNome.trim()) {
      errors.nome = "Nome é obrigatório";
    }

    if (!registerEmail.trim()) {
      errors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      errors.email = "Email inválido";
    }

    if (!registerSenha) {
      errors.senha = "Senha é obrigatória";
    } else {
      const passwordErrors = validatePassword(registerSenha);
      if (passwordErrors.length > 0) {
        errors.senha = `A senha deve conter: ${passwordErrors.join(", ")}`;
      }
    }

    if (!registerConfirmSenha) {
      errors.confirmSenha = "Confirmação de senha é obrigatória";
    } else if (registerSenha !== registerConfirmSenha) {
      errors.confirmSenha = "As senhas não coincidem";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, corrija os erros abaixo");
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
      setFieldErrors({});
      // Limpar campos após cadastro bem-sucedido
      setRegisterNome("");
      setRegisterEmail("");
      setRegisterSenha("");
      setRegisterConfirmSenha("");
      setRegisterTipo("user");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error || "Erro ao cadastrar. Tente novamente.";
      setError(errorMsg);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <div className="tabs">
          <button
            className={tab === "login" ? "active" : ""}
            onClick={() => {
              setTab("login");
              setError("");
              setFieldErrors({});
            }}
          >
            Login
          </button>
          <button
            className={tab === "register" ? "active" : ""}
            onClick={() => {
              setTab("register");
              setError("");
              setFieldErrors({});
            }}
          >
            Cadastrar
          </button>
        </div>

        {tab === "login" && (
          <form onSubmit={handleLogin} className="form-content">
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="Digite seu email"
                className={fieldErrors.email ? "input-error" : ""}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={loginSenha}
                onChange={(e) => {
                  setLoginSenha(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, senha: "" }));
                }}
                placeholder="Digite sua senha"
                className={fieldErrors.senha ? "input-error" : ""}
              />
              {fieldErrors.senha && (
                <span className="field-error">{fieldErrors.senha}</span>
              )}
            </div>

            <button type="submit" className="submit-btn">
              Entrar
            </button>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegister} className="form-content">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={registerNome}
                onChange={(e) => {
                  setRegisterNome(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, nome: "" }));
                }}
                placeholder="Digite seu nome"
                className={fieldErrors.nome ? "input-error" : ""}
              />
              {fieldErrors.nome && (
                <span className="field-error">{fieldErrors.nome}</span>
              )}
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={registerEmail}
                onChange={(e) => {
                  setRegisterEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="Digite seu email"
                className={fieldErrors.email ? "input-error" : ""}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={registerSenha}
                onChange={(e) => {
                  setRegisterSenha(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, senha: "" }));
                }}
                placeholder="Mínimo 8 caracteres, maiúsculas, minúsculas e especiais"
                className={fieldErrors.senha ? "input-error" : ""}
              />
              {fieldErrors.senha && (
                <span className="field-error">{fieldErrors.senha}</span>
              )}
            </div>

            <div className="form-group">
              <label>Confirmar Senha</label>
              <input
                type="password"
                value={registerConfirmSenha}
                onChange={(e) => {
                  setRegisterConfirmSenha(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmSenha: "" }));
                }}
                placeholder="Confirme sua senha"
                className={fieldErrors.confirmSenha ? "input-error" : ""}
              />
              {fieldErrors.confirmSenha && (
                <span className="field-error">{fieldErrors.confirmSenha}</span>
              )}
            </div>

            <div className="form-group">
              <label>Tipo de usuário</label>
              <select
                value={registerTipo}
                onChange={(e) => setRegisterTipo(e.target.value)}
              >
                <option value="user">Usuário</option>
                <option value="adm">Administrador</option>
              </select>
            </div>

            <button type="submit" className="submit-btn">
              Cadastrar
            </button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default LoginModal;
