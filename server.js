import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "./db.js"; // Usando db.js centralizado

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());

/* =========================
   ROTAS DE AUTENTICAÇÃO
   ========================= */

// LOGIN
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
    res.json({ user: userData });
  } catch (err) {
    console.error("Erro login:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// REGISTER
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

    res.status(201).json({ user: insert.rows[0] });
  } catch (err) {
    console.error("Erro cadastro:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

/* =========================
   ROTAS DE IMÓVEIS
   ========================= */

// LISTAR TODOS IMÓVEIS VISÍVEIS
app.get("/api/imoveis", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM imoveis WHERE visivel = true ORDER BY data_criacao DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar imóveis:", err);
    res.status(500).json({ error: "Erro ao buscar imóveis" });
  }
});

// OBTER IMÓVEL POR ID
app.get("/api/imoveis/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM imoveis WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Imóvel não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar imóvel" });
  }
});

// CRIAR IMÓVEL (ADMIN)
app.post("/api/imoveis", async (req, res) => {
  const { titulo, descricao, preco, endereco, criado_por } = req.body;

  if (!titulo || !preco || !criado_por)
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });

  try {
    const result = await pool.query(
      "INSERT INTO imoveis (titulo, descricao, preco, endereco, criado_por) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [titulo, descricao || "", preco, endereco || "", criado_por]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar imóvel" });
  }
});

// ATUALIZAR IMÓVEL (ADMIN)
app.put("/api/imoveis/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, preco, endereco, atualizado_por, visivel } =
    req.body;

  try {
    const result = await pool.query(
      `UPDATE imoveis SET titulo=$1, descricao=$2, preco=$3, endereco=$4, atualizado_por=$5, visivel=$6, data_atualizacao=NOW()
       WHERE id=$7 RETURNING *`,
      [titulo, descricao, preco, endereco, atualizado_por, visivel, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Imóvel não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar imóvel" });
  }
});

// DELETAR IMÓVEL (ADMIN)
app.delete("/api/imoveis/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM imoveis WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Imóvel não encontrado" });
    res.json({ message: "Imóvel deletado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar imóvel" });
  }
});

/* =========================
   ROTAS DE FOTOS DE IMÓVEIS
   ========================= */

// LISTAR FOTOS
app.get("/api/imoveis/:id/fotos", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM fotos_imoveis WHERE imovel_id = $1",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar fotos" });
  }
});

// ADICIONAR FOTO
app.post("/api/imoveis/:id/fotos", async (req, res) => {
  const { id } = req.params;
  const { caminho_foto } = req.body;

  if (!caminho_foto)
    return res.status(400).json({ error: "Caminho da foto é obrigatório" });

  try {
    const result = await pool.query(
      "INSERT INTO fotos_imoveis (imovel_id, caminho_foto) VALUES ($1,$2) RETURNING *",
      [id, caminho_foto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao adicionar foto" });
  }
});

// DELETAR FOTO
app.delete("/api/fotos/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM fotos_imoveis WHERE id=$1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Foto não encontrada" });
    res.json({ message: "Foto deletada com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar foto" });
  }
});

/* =========================
   START SERVER
   ========================= */
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
