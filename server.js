import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

dotenv.config();
const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/fotos_imoveis", express.static("public/fotos_imoveis"));

// =========================
// ROTAS DE AUTENTICAÇÃO
// =========================

app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const user = result.rows[0];

    // Compara a senha fornecida com o hash armazenado
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Remove a senha do objeto antes de enviar
    const { senha: _, ...userSemSenha } = user;

    res.json({ user: userSemSenha });
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.post("/api/register", async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;

  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  if (!["user", "adm"].includes(tipo_usuario)) {
    return res.status(400).json({ error: "Tipo de usuário inválido" });
  }

  try {
    // Verifica se o email já existe
    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere o novo usuário
    const result = await pool.query(
      "INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, tipo_usuario, data_criacao",
      [nome, email, senhaHash, tipo_usuario]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error("Erro ao registrar usuário:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// =========================
// ROTAS DE CURTIDAS
// =========================

app.get("/api/curtidas/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM curtidas WHERE usuario_id = $1",
      [usuario_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar curtidas:", err);
    res.status(500).json({ error: "Erro ao buscar curtidas" });
  }
});

app.post("/api/curtidas/:usuario_id/:imovel_id", async (req, res) => {
  const { usuario_id, imovel_id } = req.params;

  try {
    // Verifica se já existe curtida
    const curtidaExiste = await pool.query(
      "SELECT id FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
      [usuario_id, imovel_id]
    );

    if (curtidaExiste.rows.length > 0) {
      // Remove curtida
      await pool.query(
        "DELETE FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
        [usuario_id, imovel_id]
      );
      res.json({ curtido: false });
    } else {
      // Adiciona curtida
      await pool.query(
        "INSERT INTO curtidas (usuario_id, imovel_id) VALUES ($1, $2)",
        [usuario_id, imovel_id]
      );
      res.json({ curtido: true });
    }
  } catch (err) {
    console.error("Erro ao alternar curtida:", err);
    res.status(500).json({ error: "Erro ao alternar curtida" });
  }
});

// =========================
// Configuração do multer
// =========================
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
        const num = Number.parseInt(match[2]);
        if (num > maxNumber) maxNumber = num;
      }
    });

    const nextNumber = maxNumber + 1;
    cb(null, `${Date.now()}-${nextNumber}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// =========================
// ROTAS DE IMÓVEIS
// =========================

// Buscar todos os imóveis
app.get("/api/imoveis", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        i.id AS imovel_id,
        i.titulo,
        i.descricao,
        i.preco,
        i.destaque,
        i.status,
        i.finalidade,
        i.cep,
        i.area_total,
        i.area_construida,
        i.visivel,
        i.criado_por,
        i.estado,
        i.cidade,
        i.bairro,
        i.tipo,
        i.data_criacao,

        ic.id AS caracteristicas_id,
        ic.quarto,
        ic.suite,
        ic.banheiro,
        ic.vaga,
        ic.andar,
        ic.andar_total,
        ic.mobiliado,
        ic.piscina,
        ic.churrasqueira,
        ic.salao_de_festa,
        ic.academia,
        ic.playground,
        ic.jardim,
        ic.varanda,
        ic.interfone,
        ic.acessibilidade_pcd,
        ic.ar_condicionado,
        ic.energia_solar,
        ic.quadra,
        ic.lavanderia,
        ic.closet,
        ic.escritorio,
        ic.lareira,
        ic.alarme,
        ic.camera_vigilancia,
        ic.bicicletario,
        ic.sala_jogos,
        ic.brinquedoteca,
        ic.elevador,
        ic.pomar,
        ic.lago,
        ic.aceita_animais,
        ic.construtora,

        COALESCE(json_agg(f) FILTER (WHERE f.id IS NOT NULL), '[]') AS fotos
      FROM imoveis i
      LEFT JOIN imoveis_caracteristicas ic ON ic.imovel_id = i.id
      LEFT JOIN fotos_imoveis f ON f.imovel_id = i.id
      WHERE i.visivel = true
      GROUP BY i.id, ic.id
      ORDER BY i.data_criacao DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erro ao buscar imóveis:", err);
    res.status(500).json({ error: "Erro ao buscar imóveis" });
  }
});

// Buscar um imóvel específico por ID
app.get("/api/imoveis/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT 
        i.id AS imovel_id,
        i.titulo,
        i.descricao,
        i.preco,
        i.destaque,
        i.status,
        i.finalidade,
        i.cep,
        i.area_total,
        i.area_construida,
        i.visivel,
        i.criado_por,
        i.estado,
        i.cidade,
        i.bairro,
        i.tipo,
        i.data_criacao,

        ic.id AS caracteristicas_id,
        ic.quarto,
        ic.suite,
        ic.banheiro,
        ic.vaga,
        ic.andar,
        ic.andar_total,
        ic.mobiliado,
        ic.piscina,
        ic.churrasqueira,
        ic.salao_de_festa,
        ic.academia,
        ic.playground,
        ic.jardim,
        ic.varanda,
        ic.interfone,
        ic.acessibilidade_pcd,
        ic.ar_condicionado,
        ic.energia_solar,
        ic.quadra,
        ic.lavanderia,
        ic.closet,
        ic.escritorio,
        ic.lareira,
        ic.alarme,
        ic.camera_vigilancia,
        ic.bicicletario,
        ic.sala_jogos,
        ic.brinquedoteca,
        ic.elevador,
        ic.pomar,
        ic.lago,
        ic.aceita_animais,
        ic.construtora,

        COALESCE(json_agg(f) FILTER (WHERE f.id IS NOT NULL), '[]') AS fotos
      FROM imoveis i
      LEFT JOIN imoveis_caracteristicas ic ON ic.imovel_id = i.id
      LEFT JOIN fotos_imoveis f ON f.imovel_id = i.id
      WHERE i.id = $1
      GROUP BY i.id, ic.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erro ao buscar imóvel:", err);
    res.status(500).json({ error: "Erro ao buscar imóvel" });
  }
});

// Criar imóvel
app.post("/api/imoveis", async (req, res) => {
  const {
    titulo,
    descricao,
    preco,
    destaque,
    status,
    finalidade,
    cep,
    area_total,
    area_construida,
    visivel,
    criado_por,
    estado,
    cidade,
    bairro,
    tipo,
  } = req.body;

  if (!titulo || !preco || !criado_por)
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });

  const tiposPermitidos = [
    "Casa",
    "Apartamento",
    "Cobertura",
    "Kitnet",
    "Terreno",
    "Sala comercial",
    "Galpão",
    "Sítio",
    "Fazenda",
  ];

  if (tipo && !tiposPermitidos.includes(tipo)) {
    return res.status(400).json({ error: "Tipo de imóvel inválido" });
  }

  try {
    const imovelResult = await pool.query(
      `INSERT INTO imoveis
        (titulo, descricao, preco, destaque, status, finalidade, cep, area_total, area_construida, visivel, criado_por, estado, cidade, bairro, tipo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        titulo,
        descricao || "",
        preco,
        destaque || false,
        status || null,
        finalidade || null,
        cep || null,
        area_total || null,
        area_construida || null,
        visivel !== undefined ? visivel : true,
        criado_por,
        estado || null,
        cidade || null,
        bairro || null,
        tipo || null,
      ]
    );

    const imovelId = imovelResult.rows[0].id;
    res.status(201).json({ id: imovelId });
  } catch (err) {
    console.error("Erro ao cadastrar imóvel:", err);
    res.status(500).json({ error: "Erro ao cadastrar imóvel" });
  }
});

// Criar características do imóvel
app.post("/api/imoveis_caracteristicas", async (req, res) => {
  const campos = [
    "imovel_id",
    "condominio",
    "iptu",
    "quarto",
    "suite",
    "banheiro",
    "vaga",
    "andar",
    "andar_total",
    "piscina",
    "churrasqueira",
    "salao_de_festa",
    "academia",
    "playground",
    "jardim",
    "varanda",
    "interfone",
    "acessibilidade_pcd",
    "mobiliado",
    "ar_condicionado",
    "energia_solar",
    "quadra",
    "lavanderia",
    "closet",
    "escritorio",
    "lareira",
    "alarme",
    "camera_vigilancia",
    "bicicletario",
    "sala_jogos",
    "brinquedoteca",
    "elevador",
    "pomar",
    "lago",
    "aceita_animais",
    "construtora",
  ];

  const values = campos.map((c) =>
    req.body[c] !== undefined
      ? req.body[c]
      : [
          "suite",
          "piscina",
          "churrasqueira",
          "salao_de_festa",
          "academia",
          "playground",
          "jardim",
          "varanda",
          "interfone",
          "acessibilidade_pcd",
          "mobiliado",
          "energia_solar",
          "quadra",
          "lavanderia",
          "closet",
          "escritorio",
          "lareira",
          "alarme",
          "camera_vigilancia",
          "bicicletario",
          "sala_jogos",
          "brinquedoteca",
          "elevador",
          "pomar",
          "lago",
          "aceita_animais",
        ].includes(c)
      ? false
      : null
  );

  if (!req.body.imovel_id)
    return res.status(400).json({ error: "imovel_id é obrigatório" });

  try {
    const placeholders = campos.map((_, idx) => `$${idx + 1}`).join(",");
    await pool.query(
      `INSERT INTO imoveis_caracteristicas (${campos.join(
        ","
      )}) VALUES (${placeholders})`,
      values
    );
    res
      .status(201)
      .json({ message: "Características cadastradas com sucesso!" });
  } catch (err) {
    console.error("Erro ao cadastrar características:", err);
    res.status(500).json({ error: "Erro ao cadastrar características" });
  }
});

// Upload de fotos
app.post(
  "/api/imoveis/:id/upload",
  upload.array("fotos", 10),
  async (req, res) => {
    const { id } = req.params;
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "Arquivos não enviados" });

    try {
      const fotosInseridas = [];
      for (const file of req.files) {
        const caminho = `/fotos_imoveis/${file.filename}`;
        const result = await pool.query(
          "INSERT INTO fotos_imoveis (imovel_id, caminho_foto) VALUES ($1, $2) RETURNING *",
          [id, caminho]
        );
        fotosInseridas.push(result.rows[0]);
      }
      res.status(201).json(fotosInseridas);
    } catch (err) {
      console.error("Erro ao salvar fotos no banco:", err);
      res.status(500).json({ error: "Erro ao salvar fotos no banco" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
