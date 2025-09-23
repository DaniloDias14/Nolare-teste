// server.js
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import pool from "./db.js"; // Conexão com o banco
import multer from "multer";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/fotos_imoveis", express.static("public/fotos_imoveis")); // Serve imagens estáticas

/* =========================
   MULTER CONFIG PARA UPLOAD DE FOTOS
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "public/fotos_imoveis";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const dir = "public/fotos_imoveis";
    const files = fs.readdirSync(dir);
    let maxNumber = 0;

    files.forEach((f) => {
      const match = f.match(/^(\d+)-(\d+)\./);
      if (match) {
        const num = parseInt(match[2]);
        if (num > maxNumber) maxNumber = num;
      }
    });

    const nextNumber = maxNumber + 1;
    cb(null, `${Date.now()}-${nextNumber}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

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
      "SELECT i.*, json_agg(f.*) AS fotos FROM imoveis i LEFT JOIN fotos_imoveis f ON i.id = f.imovel_id WHERE i.visivel = true GROUP BY i.id ORDER BY i.data_criacao DESC"
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
    const result = await pool.query(
      "SELECT i.*, json_agg(f.*) AS fotos FROM imoveis i LEFT JOIN fotos_imoveis f ON i.id = f.imovel_id WHERE i.id = $1 GROUP BY i.id",
      [id]
    );
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

// UPLOAD DE FOTOS (várias)
app.post(
  "/api/imoveis/:id/upload",
  upload.array("fotos", 10),
  async (req, res) => {
    const { id } = req.params;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "Arquivos não enviados" });

    try {
      const fotosInseridas = [];
      for (let file of req.files) {
        const caminho = `/fotos_imoveis/${file.filename}`;
        const result = await pool.query(
          "INSERT INTO fotos_imoveis (imovel_id, caminho_foto) VALUES ($1, $2) RETURNING *",
          [id, caminho]
        );
        fotosInseridas.push(result.rows[0]);
      }
      res.status(201).json(fotosInseridas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao salvar fotos no banco" });
    }
  }
);

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
