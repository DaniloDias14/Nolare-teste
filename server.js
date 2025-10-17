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

    await pool.query(
      "INSERT INTO usuario_sessoes (usuario_id, data_login, ativo) VALUES ($1, CURRENT_TIMESTAMP, TRUE)",
      [user.id]
    );

    // Remove a senha do objeto antes de enviar
    const { senha: _, ...userSemSenha } = user;

    res.json({ user: userSemSenha });
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.post("/api/logout", async (req, res) => {
  const { usuario_id } = req.body;

  if (!usuario_id) {
    return res.status(400).json({ error: "usuario_id é obrigatório" });
  }

  try {
    // Update the most recent active session for this user
    await pool.query(
      `UPDATE usuario_sessoes 
       SET data_logout = CURRENT_TIMESTAMP, ativo = FALSE 
       WHERE usuario_id = $1 AND ativo = TRUE`,
      [usuario_id]
    );

    res.json({ message: "Logout realizado com sucesso" });
  } catch (err) {
    console.error("Erro ao fazer logout:", err);
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
// ROTAS DE SESSÕES (para Dashboard)
// =========================

app.get("/api/sessoes/ativos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(DISTINCT usuario_id) as count FROM usuario_sessoes WHERE ativo = TRUE"
    );
    res.json({ count: Number.parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Erro ao buscar usuários ativos:", err);
    res.status(500).json({ error: "Erro ao buscar usuários ativos" });
  }
});

app.get("/api/sessoes/pico/:data", async (req, res) => {
  const { data } = req.params;

  try {
    // Query to find peak concurrent users on a specific date
    const result = await pool.query(
      `WITH sessoes_dia AS (
        SELECT 
          usuario_id,
          data_login,
          COALESCE(data_logout, CURRENT_TIMESTAMP) as data_logout
        FROM usuario_sessoes
        WHERE DATE(data_login) = $1 OR DATE(data_logout) = $1
      ),
      intervalos AS (
        SELECT data_login as momento FROM sessoes_dia
        UNION
        SELECT data_logout as momento FROM sessoes_dia
      ),
      contagem AS (
        SELECT 
          i.momento,
          COUNT(DISTINCT s.usuario_id) as usuarios_ativos
        FROM intervalos i
        LEFT JOIN sessoes_dia s ON i.momento >= s.data_login AND i.momento <= s.data_logout
        WHERE DATE(i.momento) = $1
        GROUP BY i.momento
      )
      SELECT COALESCE(MAX(usuarios_ativos), 0) as pico
      FROM contagem`,
      [data]
    );

    res.json({ pico: Number.parseInt(result.rows[0].pico) });
  } catch (err) {
    console.error("Erro ao buscar pico de usuários:", err);
    res.status(500).json({ error: "Erro ao buscar pico de usuários" });
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
// ROTAS DE ESTATÍSTICAS (para Dashboard)
// =========================

app.get("/api/estatisticas/usuarios", async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios"
    );
    const tiposResult = await pool.query(
      "SELECT tipo_usuario, COUNT(*) as count FROM usuarios GROUP BY tipo_usuario"
    );
    const ultimoResult = await pool.query(
      "SELECT data_criacao FROM usuarios ORDER BY data_criacao DESC LIMIT 1"
    );

    const tipos = {};
    tiposResult.rows.forEach((row) => {
      tipos[row.tipo_usuario] = Number.parseInt(row.count);
    });

    res.json({
      total: Number.parseInt(totalResult.rows[0].total),
      tipos: tipos,
      ultimo_cadastro: ultimoResult.rows[0]?.data_criacao || null,
    });
  } catch (err) {
    console.error("Erro ao buscar estatísticas de usuários:", err);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

app.get("/api/estatisticas/imoveis", async (req, res) => {
  try {
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM imoveis WHERE visivel = TRUE"
    );
    const mediaPrecoResult = await pool.query(
      "SELECT AVG(preco) as media FROM imoveis WHERE visivel = TRUE"
    );
    const ultimoResult = await pool.query(
      "SELECT data_criacao FROM imoveis WHERE visivel = TRUE ORDER BY data_criacao DESC LIMIT 1"
    );
    const destaqueResult = await pool.query(
      "SELECT COUNT(*) as count FROM imoveis WHERE destaque = TRUE AND visivel = TRUE"
    );
    const statusResult = await pool.query(
      "SELECT status, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY status"
    );
    const finalidadeResult = await pool.query(
      "SELECT finalidade, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY finalidade"
    );
    const tipoResult = await pool.query(
      "SELECT tipo, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY tipo"
    );

    // Get properties by construtora from caracteristicas table
    const construtoraResult = await pool.query(
      `SELECT ic.construtora, COUNT(*) as count 
       FROM imoveis_caracteristicas ic
       JOIN imoveis i ON i.id = ic.imovel_id
       WHERE i.visivel = TRUE AND ic.construtora IS NOT NULL
       GROUP BY ic.construtora`
    );

    const status = {};
    statusResult.rows.forEach((row) => {
      if (row.status) status[row.status] = Number.parseInt(row.count);
    });

    const finalidade = {};
    finalidadeResult.rows.forEach((row) => {
      if (row.finalidade)
        finalidade[row.finalidade] = Number.parseInt(row.count);
    });

    const tipo = {};
    tipoResult.rows.forEach((row) => {
      if (row.tipo) tipo[row.tipo] = Number.parseInt(row.count);
    });

    const construtora = {};
    construtoraResult.rows.forEach((row) => {
      construtora[row.construtora] = Number.parseInt(row.count);
    });

    res.json({
      total: Number.parseInt(totalResult.rows[0].total),
      media_preco: Number.parseFloat(mediaPrecoResult.rows[0].media) || 0,
      ultimo_cadastro: ultimoResult.rows[0]?.data_criacao || null,
      destaque: Number.parseInt(destaqueResult.rows[0].count),
      status: status,
      finalidade: finalidade,
      tipo: tipo,
      construtora: construtora,
    });
  } catch (err) {
    console.error("Erro ao buscar estatísticas de imóveis:", err);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
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

        json_build_object(
          'id', ic.id,
          'quarto', ic.quarto,
          'suite', ic.suite,
          'banheiro', ic.banheiro,
          'vaga', ic.vaga,
          'andar', ic.andar,
          'andar_total', ic.andar_total,
          'mobiliado', ic.mobiliado,
          'piscina', ic.piscina,
          'churrasqueira', ic.churrasqueira,
          'salao_de_festa', ic.salao_de_festa,
          'academia', ic.academia,
          'playground', ic.playground,
          'jardim', ic.jardim,
          'varanda', ic.varanda,
          'interfone', ic.interfone,
          'acessibilidade_pcd', ic.acessibilidade_pcd,
          'ar_condicionado', ic.ar_condicionado,
          'energia_solar', ic.energia_solar,
          'quadra', ic.quadra,
          'lavanderia', ic.lavanderia,
          'closet', ic.closet,
          'escritorio', ic.escritorio,
          'lareira', ic.lareira,
          'alarme', ic.alarme,
          'camera_vigilancia', ic.camera_vigilancia,
          'bicicletario', ic.bicicletario,
          'sala_jogos', ic.sala_jogos,
          'brinquedoteca', ic.brinquedoteca,
          'elevador', ic.elevador,
          'pomar', ic.pomar,
          'lago', ic.lago,
          'aceita_animais', ic.aceita_animais,
          'na_planta', ic.na_planta,
          'construtora', ic.construtora
        ) AS caracteristicas,

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

        json_build_object(
          'id', ic.id,
          'quarto', ic.quarto,
          'suite', ic.suite,
          'banheiro', ic.banheiro,
          'vaga', ic.vaga,
          'andar', ic.andar,
          'andar_total', ic.andar_total,
          'mobiliado', ic.mobiliado,
          'piscina', ic.piscina,
          'churrasqueira', ic.churrasqueira,
          'salao_de_festa', ic.salao_de_festa,
          'academia', ic.academia,
          'playground', ic.playground,
          'jardim', ic.jardim,
          'varanda', ic.varanda,
          'interfone', ic.interfone,
          'acessibilidade_pcd', ic.acessibilidade_pcd,
          'ar_condicionado', ic.ar_condicionado,
          'energia_solar', ic.energia_solar,
          'quadra', ic.quadra,
          'lavanderia', ic.lavanderia,
          'closet', ic.closet,
          'escritorio', ic.escritorio,
          'lareira', ic.lareira,
          'alarme', ic.alarme,
          'camera_vigilancia', ic.camera_vigilancia,
          'bicicletario', ic.bicicletario,
          'sala_jogos', ic.sala_jogos,
          'brinquedoteca', ic.brinquedoteca,
          'elevador', ic.elevador,
          'pomar', ic.pomar,
          'lago', ic.lago,
          'aceita_animais', ic.aceita_animais,
          'na_planta', ic.na_planta,
          'construtora', ic.construtora
        ) AS caracteristicas,

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
    "na_planta",
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
          "na_planta",
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
