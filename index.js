import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import cors from "cors";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ==========================
// Rota inicial
// ==========================
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Conectado!", time: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CRUD USUÁRIOS
// ==========================
app.get("/usuarios", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, email, tipo_usuario, data_criacao FROM usuarios"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/usuarios", async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo_usuario, data_criacao",
      [nome, email, senha, tipo_usuario]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CRUD IMÓVEIS
// ==========================
app.get("/imoveis", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM imoveis ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/imoveis/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM imoveis WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Imóvel não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/imoveis", async (req, res) => {
  const { titulo, descricao, preco, endereco, criado_por } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO imoveis (titulo, descricao, preco, endereco, criado_por)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [titulo, descricao, preco, endereco, criado_por]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/imoveis/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, preco, endereco, atualizado_por } = req.body;
  try {
    const result = await pool.query(
      `UPDATE imoveis
       SET titulo = $1, descricao = $2, preco = $3, endereco = $4, atualizado_por = $5, data_atualizacao = NOW()
       WHERE id = $6 RETURNING *`,
      [titulo, descricao, preco, endereco, atualizado_por, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Imóvel não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/imoveis/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM imoveis WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Imóvel não encontrado" });
    res.json({ message: "Imóvel deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CRUD FOTOS DE IMÓVEIS
// ==========================
app.get("/imoveis/:id/fotos", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM fotos_imoveis WHERE imovel_id = $1",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/imoveis/:id/fotos", async (req, res) => {
  const { id } = req.params;
  const { caminho_foto } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO fotos_imoveis (imovel_id, caminho_foto) VALUES ($1, $2) RETURNING *",
      [id, caminho_foto]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// CURTIDAS
// ==========================
app.post("/curtidas", async (req, res) => {
  const { usuario_id, imovel_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO curtidas (usuario_id, imovel_id) VALUES ($1, $2) RETURNING *",
      [usuario_id, imovel_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505")
      return res.status(400).json({ message: "Usuário já curtiu este imóvel" });
    res.status(500).json({ error: err.message });
  }
});

app.delete("/curtidas", async (req, res) => {
  const { usuario_id, imovel_id } = req.body;
  try {
    const result = await pool.query(
      "DELETE FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2 RETURNING *",
      [usuario_id, imovel_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Curtida não encontrada" });
    res.json({ message: "Curtida removida" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================
// Start server
// ==========================
app.listen(port, () => {
  console.log(`Backend rodando na porta ${port}`);
});
