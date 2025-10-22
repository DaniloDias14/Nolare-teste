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
app.use("/fotos_imoveis_maps", express.static("public/fotos_imoveis_maps"));

// =========================
// ROTAS DE AUTENTICAÇÃO
// =========================

// ROTA: Login de usuário
app.post("/api/login", async (req, res) => {
  const { email, senha } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!email || !senha) {
    return res.status(400).json({ error: "Email e senha são obrigatórios" });
  }

  try {
    // DB QUERY: Busca usuário por email
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const user = result.rows[0];

    // VALIDAÇÃO: Compara senha com hash armazenado
    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // DB QUERY: Registra sessão de login
    await pool.query(
      "INSERT INTO usuario_sessoes (usuario_id, data_login, ativo) VALUES ($1, CURRENT_TIMESTAMP, TRUE)",
      [user.id]
    );

    // SEGURANÇA: Remove senha antes de enviar resposta
    const { senha: _, ...userSemSenha } = user;

    res.json({ user: userSemSenha });
  } catch (err) {
    console.error("Erro ao fazer login:", err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ROTA: Logout de usuário
app.post("/api/logout", async (req, res) => {
  const { usuario_id } = req.body;

  // VALIDAÇÃO: Campo obrigatório
  if (!usuario_id) {
    return res.status(400).json({ error: "usuario_id é obrigatório" });
  }

  try {
    // DB QUERY: Atualiza sessão ativa para inativa
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

// ROTA: Registro de novo usuário
app.post("/api/register", async (req, res) => {
  const { nome, email, senha, tipo_usuario } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!nome || !email || !senha || !tipo_usuario) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  // VALIDAÇÃO: Tipo de usuário permitido
  if (!["user", "adm"].includes(tipo_usuario)) {
    return res.status(400).json({ error: "Tipo de usuário inválido" });
  }

  try {
    // DB QUERY: Verifica se email já existe
    const emailExiste = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (emailExiste.rows.length > 0) {
      return res.status(409).json({ error: "Email já cadastrado" });
    }

    // SEGURANÇA: Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // DB QUERY: Insere novo usuário
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
// ROTAS DE SESSÕES (Dashboard)
// =========================

// ROTA: Conta usuários ativos
app.get("/api/sessoes/ativos", async (req, res) => {
  try {
    // DB QUERY: Conta sessões ativas únicas
    const result = await pool.query(
      "SELECT COUNT(DISTINCT usuario_id) as count FROM usuario_sessoes WHERE ativo = TRUE"
    );
    res.json({ count: Number.parseInt(result.rows[0].count) });
  } catch (err) {
    console.error("Erro ao buscar usuários ativos:", err);
    res.status(500).json({ error: "Erro ao buscar usuários ativos" });
  }
});

// ROTA: Pico de usuários em uma data específica
app.get("/api/sessoes/pico/:data", async (req, res) => {
  const { data } = req.params;

  try {
    // DB QUERY: Calcula pico de usuários simultâneos em uma data
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

// ROTA: Busca curtidas de um usuário
app.get("/api/curtidas/:usuario_id", async (req, res) => {
  const { usuario_id } = req.params;

  try {
    // DB QUERY: Busca todas as curtidas do usuário
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

// ROTA: Adiciona ou remove curtida (toggle)
app.post("/api/curtidas/:usuario_id/:imovel_id", async (req, res) => {
  const { usuario_id, imovel_id } = req.params;

  try {
    // VALIDAÇÃO: Verifica se usuário existe
    const usuarioExiste = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [usuario_id]
    );
    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // VALIDAÇÃO: Verifica se imóvel existe
    const imovelExiste = await pool.query(
      "SELECT id FROM imoveis WHERE id = $1",
      [imovel_id]
    );
    if (imovelExiste.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    // DB QUERY: Verifica se curtida já existe
    const curtidaExiste = await pool.query(
      "SELECT id FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
      [usuario_id, imovel_id]
    );

    if (curtidaExiste.rows.length > 0) {
      // DB QUERY: Remove curtida
      await pool.query(
        "DELETE FROM curtidas WHERE usuario_id = $1 AND imovel_id = $2",
        [usuario_id, imovel_id]
      );
      res.json({ curtido: false });
    } else {
      // DB QUERY: Adiciona curtida com timestamp
      await pool.query(
        "INSERT INTO curtidas (usuario_id, imovel_id, data_curtida) VALUES ($1, $2, CURRENT_TIMESTAMP)",
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
// ROTAS DE ESTATÍSTICAS (Dashboard)
// =========================

// ROTA: Estatísticas de usuários
app.get("/api/estatisticas/usuarios", async (req, res) => {
  try {
    // DB QUERY: Total de usuários
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM usuarios"
    );

    // DB QUERY: Usuários por tipo
    const tiposResult = await pool.query(
      "SELECT tipo_usuario, COUNT(*) as count FROM usuarios GROUP BY tipo_usuario"
    );

    // DB QUERY: Data do último cadastro
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

// ROTA: Estatísticas de imóveis
app.get("/api/estatisticas/imoveis", async (req, res) => {
  try {
    // DB QUERY: Total de imóveis visíveis
    const totalResult = await pool.query(
      "SELECT COUNT(*) as total FROM imoveis WHERE visivel = TRUE"
    );

    // DB QUERY: Preço médio dos imóveis
    const mediaPrecoResult = await pool.query(
      "SELECT AVG(preco) as media FROM imoveis WHERE visivel = TRUE"
    );

    // DB QUERY: Data do último cadastro
    const ultimoResult = await pool.query(
      "SELECT data_criacao FROM imoveis WHERE visivel = TRUE ORDER BY data_criacao DESC LIMIT 1"
    );

    // DB QUERY: Total de imóveis em destaque
    const destaqueResult = await pool.query(
      "SELECT COUNT(*) as count FROM imoveis WHERE destaque = TRUE AND visivel = TRUE"
    );

    // DB QUERY: Imóveis por status
    const statusResult = await pool.query(
      "SELECT status, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY status"
    );

    // DB QUERY: Imóveis por finalidade
    const finalidadeResult = await pool.query(
      "SELECT finalidade, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY finalidade"
    );

    // DB QUERY: Imóveis por tipo
    const tipoResult = await pool.query(
      "SELECT tipo, COUNT(*) as count FROM imoveis WHERE visivel = TRUE GROUP BY tipo"
    );

    // DB QUERY: Imóveis por construtora
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
// CONFIGURAÇÃO MULTER (Upload de arquivos)
// =========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isFotoMaps = req.body.isFotoMaps === "true";
    const dir = isFotoMaps
      ? "public/fotos_imoveis_maps"
      : "public/fotos_imoveis";

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const isFotoMaps = req.body.isFotoMaps === "true";
    const dir = isFotoMaps
      ? "public/fotos_imoveis_maps"
      : "public/fotos_imoveis";
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

// ROTA: Busca todos os imóveis visíveis
app.get("/api/imoveis", async (req, res) => {
  try {
    // DB QUERY: Busca imóveis com características e fotos
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
        i.map_url,

        json_build_object(
          'id', ic.id,
          'condominio', ic.condominio,
          'iptu', ic.iptu,
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
          'portaria_24h', ic.portaria_24h,
          'carregador_carro_eletrico', ic.carregador_carro_eletrico,
          'gerador_energia', ic.gerador_energia,
          'estudio', ic.estudio,
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

// ROTA: Busca um imóvel específico por ID
app.get("/api/imoveis/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // DB QUERY: Busca imóvel específico com características e fotos
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
        i.map_url,

        json_build_object(
          'id', ic.id,
          'condominio', ic.condominio,
          'iptu', ic.iptu,
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
          'portaria_24h', ic.portaria_24h,
          'carregador_carro_eletrico', ic.carregador_carro_eletrico,
          'gerador_energia', ic.gerador_energia,
          'estudio', ic.estudio,
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

// ROTA: Cria novo imóvel
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
    map_url,
  } = req.body;

  // VALIDAÇÃO: Campos obrigatórios
  if (!titulo || !preco || !criado_por) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes" });
  }

  // VALIDAÇÃO: Verifica se usuário existe
  try {
    const usuarioExiste = await pool.query(
      "SELECT id FROM usuarios WHERE id = $1",
      [criado_por]
    );
    if (usuarioExiste.rows.length === 0) {
      return res.status(404).json({ error: "Usuário criador não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao validar usuário:", err);
    return res.status(500).json({ error: "Erro ao validar usuário" });
  }

  // VALIDAÇÃO: Tipos de imóvel permitidos
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
    // DB QUERY: Insere novo imóvel
    const imovelResult = await pool.query(
      `INSERT INTO imoveis
        (titulo, descricao, preco, destaque, status, finalidade, cep, area_total, area_construida, visivel, criado_por, estado, cidade, bairro, tipo, map_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
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
        map_url || null,
      ]
    );

    const imovelId = imovelResult.rows[0].id;
    res.status(201).json({ id: imovelId });
  } catch (err) {
    console.error("Erro ao cadastrar imóvel:", err);
    res.status(500).json({ error: "Erro ao cadastrar imóvel" });
  }
});

// ROTA: Cria características do imóvel
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
    "portaria_24h",
    "carregador_carro_eletrico",
    "gerador_energia",
    "estudio",
    "construtora",
  ];

  // VALIDAÇÃO: Campo obrigatório
  if (!req.body.imovel_id) {
    return res.status(400).json({ error: "imovel_id é obrigatório" });
  }

  // VALIDAÇÃO: Verifica se imóvel existe
  try {
    const imovelExiste = await pool.query(
      "SELECT id FROM imoveis WHERE id = $1",
      [req.body.imovel_id]
    );
    if (imovelExiste.rows.length === 0) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }
  } catch (err) {
    console.error("Erro ao validar imóvel:", err);
    return res.status(500).json({ error: "Erro ao validar imóvel" });
  }

  // Define valores padrão para campos booleanos
  const camposBooleanos = [
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
    "portaria_24h",
    "carregador_carro_eletrico",
    "gerador_energia",
    "estudio",
  ];

  const values = campos.map((c) =>
    req.body[c] !== undefined
      ? req.body[c]
      : camposBooleanos.includes(c)
      ? false
      : null
  );

  try {
    // DB QUERY: Insere características do imóvel
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

// ROTA: Upload de fotos do imóvel
app.post(
  "/api/imoveis/:id/upload",
  upload.array("fotos", 11),
  async (req, res) => {
    const { id } = req.params;
    const { isFotoMaps } = req.body;

    // VALIDAÇÃO: Verifica se arquivos foram enviados
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Arquivos não enviados" });
    }

    // VALIDAÇÃO: Verifica se imóvel existe
    try {
      const imovelExiste = await pool.query(
        "SELECT id FROM imoveis WHERE id = $1",
        [id]
      );
      if (imovelExiste.rows.length === 0) {
        return res.status(404).json({ error: "Imóvel não encontrado" });
      }
    } catch (err) {
      console.error("Erro ao validar imóvel:", err);
      return res.status(500).json({ error: "Erro ao validar imóvel" });
    }

    try {
      const fotosInseridas = [];
      // DB QUERY: Insere cada foto no banco
      for (const file of req.files) {
        const folder =
          isFotoMaps === "true" ? "fotos_imoveis_maps" : "fotos_imoveis";
        const caminho = `/${folder}/${file.filename}`;

        // Se for foto do Google Maps, salva em caminho_foto_maps
        if (isFotoMaps === "true") {
          const result = await pool.query(
            "INSERT INTO fotos_imoveis (imovel_id, caminho_foto_maps) VALUES ($1, $2) RETURNING *",
            [id, caminho]
          );
          fotosInseridas.push(result.rows[0]);
        } else {
          const result = await pool.query(
            "INSERT INTO fotos_imoveis (imovel_id, caminho_foto) VALUES ($1, $2) RETURNING *",
            [id, caminho]
          );
          fotosInseridas.push(result.rows[0]);
        }
      }
      res.status(201).json(fotosInseridas);
    } catch (err) {
      console.error("Erro ao salvar fotos no banco:", err);
      res.status(500).json({ error: "Erro ao salvar fotos no banco" });
    }
  }
);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
