import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// -------- LOGIN --------
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ error: "Email e senha obrigatórios" });

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Usuário não encontrado" });

    const user = result.rows[0];
    const match = await bcrypt.compare(senha, user.senha);
    if (!match) return res.status(400).json({ error: "Senha incorreta" });

    const { senha: _, ...userData } = user;
    return res.json({ user: userData });
  } catch (err) {
    console.error("Erro login:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// -------- REGISTER --------
app.post("/api/register", async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;

  if (
    !nome ||
    !email ||
    !senha ||
    !tipo_usuario ||
    !["user", "adm"].includes(tipo_usuario)
  ) {
    return res
      .status(400)
      .json({ error: "Campos inválidos ou tipo de usuário incorreto" });
  }

  try {
    console.log("Recebido no register:", req.body);

    const check = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    if (check.rows.length > 0)
      return res.status(400).json({ error: "Email já cadastrado" });

    const hashedPassword = await bcrypt.hash(senha, 10);
    const insert = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo_usuario, data_criacao",
      [nome, email, hashedPassword, tipo_usuario]
    );

    return res.status(201).json({ user: insert.rows[0] });
  } catch (err) {
    console.error("Erro cadastro:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
