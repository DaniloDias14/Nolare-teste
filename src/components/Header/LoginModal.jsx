"use client";

import { useState } from "react";
import axios from "axios";
import { IoClose } from "react-icons/io5";
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

  const isValidFullName = (nome) => {
    return nome.trim().length > 0;
  };

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar senha: mínimo 8 caracteres, pelo menos 1 maiúscula, 1 minúscula, 1 número, 1 caractere especial
  const isValidPassword = (senha) => {
    const hasUpperCase = /[A-Z]/.test(senha);
    const hasLowerCase = /[a-z]/.test(senha);
    const hasNumber = /[0-9]/.test(senha);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha);
    const hasMinLength = senha.length >= 8;

    return (
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar &&
      hasMinLength
    );
  };

  const getPasswordErrors = (senha) => {
    const errors = [];
    if (senha.length < 8) errors.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(senha)) errors.push("Uma letra maiúscula");
    if (!/[a-z]/.test(senha)) errors.push("Uma letra minúscula");
    if (!/[0-9]/.test(senha)) errors.push("Um número");
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(senha))
      errors.push("Um caractere especial");
    return errors;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = {};
    if (!loginEmail.trim()) {
      errors.loginEmail = "Email é obrigatório";
    } else if (!isValidEmail(loginEmail)) {
      errors.loginEmail = "Email inválido";
    }

    if (!loginSenha.trim()) {
      errors.loginSenha = "Senha é obrigatória";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Por favor, verifique os campos abaixo");
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
        setFieldErrors({ loginEmail: "", loginSenha: "" });
        setError("Credenciais inválidas!");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setAdmLogged(false);
      setFieldErrors({ loginEmail: "", loginSenha: "" });
      setError(errorMsg);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors = {};

    if (!registerNome.trim()) {
      errors.registerNome = "Nome é obrigatório";
    }

    if (!registerEmail.trim()) {
      errors.registerEmail = "Email é obrigatório";
    } else if (!isValidEmail(registerEmail)) {
      errors.registerEmail = "Email inválido";
    }

    if (!registerSenha.trim()) {
      errors.registerSenha = "Senha é obrigatória";
    } else if (!isValidPassword(registerSenha)) {
      const passwordErrors = getPasswordErrors(registerSenha);
      errors.registerSenha = `Senha deve conter: ${passwordErrors.join(", ")}`;
    }

    if (!registerConfirmSenha.trim()) {
      errors.registerConfirmSenha = "Senhas não coincidem";
    } else if (registerSenha !== registerConfirmSenha) {
      errors.registerConfirmSenha = "Senhas não coincidem";
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
      setRegisterNome("");
      setRegisterEmail("");
      setRegisterSenha("");
      setRegisterConfirmSenha("");
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Erro no servidor";
      setError(errorMsg);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="login-modal-overlay" onClick={handleOverlayClick}>
      <div className="login-type-selector">
        <label htmlFor="registerTipo">Tipo de usuário:</label>
        <select
          id="registerTipo"
          value={registerTipo}
          onChange={(e) => setRegisterTipo(e.target.value)}
        >
          <option value="user">Usuário</option>
          <option value="adm">Administrador</option>
        </select>
      </div>

      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close-btn" onClick={onClose}>
          <IoClose size={28} color="#ffffff" />
        </button>

        {error && <p className="login-error-msg">{error}</p>}

        {tab === "login" && (
          <form onSubmit={handleLogin} className="login-form">
            <h2 className="login-form-title">Entrar</h2>

            <div className="login-form-group">
              <label htmlFor="loginEmail">Email</label>
              <input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value);
                  if (fieldErrors.loginEmail) {
                    setFieldErrors({ ...fieldErrors, loginEmail: "" });
                  }
                }}
                className={`login-input ${
                  fieldErrors.loginEmail ? "input-error" : ""
                }`}
              />
              {fieldErrors.loginEmail && (
                <p className="login-field-error">{fieldErrors.loginEmail}</p>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="loginSenha">Senha</label>
              <input
                id="loginSenha"
                type="password"
                value={loginSenha}
                onChange={(e) => {
                  setLoginSenha(e.target.value);
                  if (fieldErrors.loginSenha) {
                    setFieldErrors({ ...fieldErrors, loginSenha: "" });
                  }
                }}
                className={`login-input ${
                  fieldErrors.loginSenha ? "input-error" : ""
                }`}
              />
              {fieldErrors.loginSenha && (
                <p className="login-field-error">{fieldErrors.loginSenha}</p>
              )}

              <a href="#" className="login-forgot-password">
                Esqueceu a senha?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Entrar
            </button>

            <div className="login-divider">ou</div>

            <button type="button" className="login-google-btn">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </button>

            <div className="login-footer-text">
              Não possui uma conta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setTab("register");
                  setError("");
                  setFieldErrors({});
                }}
              >
                Crie uma agora
              </a>
            </div>
          </form>
        )}

        {tab === "register" && (
          <form onSubmit={handleRegister} className="login-form">
            <h2 className="login-form-title">Criar Conta</h2>

            <div className="login-form-group">
              <label htmlFor="registerNome">Nome</label>
              <input
                id="registerNome"
                type="text"
                value={registerNome}
                onChange={(e) => {
                  setRegisterNome(e.target.value);
                  if (fieldErrors.registerNome) {
                    setFieldErrors({ ...fieldErrors, registerNome: "" });
                  }
                }}
                className={`login-input ${
                  fieldErrors.registerNome ? "input-error" : ""
                }`}
              />
              {fieldErrors.registerNome && (
                <p className="login-field-error">{fieldErrors.registerNome}</p>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="registerEmail">Email</label>
              <input
                id="registerEmail"
                type="email"
                value={registerEmail}
                onChange={(e) => {
                  setRegisterEmail(e.target.value);
                  if (fieldErrors.registerEmail) {
                    setFieldErrors({ ...fieldErrors, registerEmail: "" });
                  }
                }}
                className={`login-input ${
                  fieldErrors.registerEmail ? "input-error" : ""
                }`}
              />
              {fieldErrors.registerEmail && (
                <p className="login-field-error">{fieldErrors.registerEmail}</p>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="registerSenha">Senha</label>
              <input
                id="registerSenha"
                type="password"
                value={registerSenha}
                onChange={(e) => {
                  setRegisterSenha(e.target.value);
                  if (fieldErrors.registerSenha) {
                    setFieldErrors({ ...fieldErrors, registerSenha: "" });
                  }
                }}
                className={`login-input ${
                  fieldErrors.registerSenha ? "input-error" : ""
                }`}
              />
              {fieldErrors.registerSenha && (
                <p className="login-field-error">{fieldErrors.registerSenha}</p>
              )}
            </div>

            <div className="login-form-group">
              <label htmlFor="registerConfirmSenha">Confirmar Senha</label>
              <input
                id="registerConfirmSenha"
                type="password"
                value={registerConfirmSenha}
                onChange={(e) => {
                  setRegisterConfirmSenha(e.target.value);
                  if (fieldErrors.registerConfirmSenha) {
                    setFieldErrors({
                      ...fieldErrors,
                      registerConfirmSenha: "",
                    });
                  }
                }}
                className={`login-input ${
                  fieldErrors.registerConfirmSenha ? "input-error" : ""
                }`}
              />
              {fieldErrors.registerConfirmSenha && (
                <p className="login-field-error">
                  {fieldErrors.registerConfirmSenha}
                </p>
              )}
            </div>

            <button type="submit" className="login-btn">
              Cadastrar
            </button>

            <div className="login-divider">ou</div>

            <button type="button" className="login-google-btn">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar com Google
            </button>

            <div className="login-footer-text">
              Tem uma conta?{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setTab("login");
                  setError("");
                  setFieldErrors({});
                }}
              >
                Faça o login aqui
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
