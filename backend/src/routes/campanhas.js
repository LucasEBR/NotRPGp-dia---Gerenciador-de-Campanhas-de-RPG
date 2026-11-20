import { Router } from "express";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { query } from "../lib/db.js";
import { validate } from "../middleware/validate.js";
import { requireCampaignMaster, requireCampaignMember } from "../middleware/auth.js";
import {
  criarCampanhaSchema,
  editarCampanhaSchema,
  entrarCampanhaSchema,
} from "../schemas/campanha.js";

export const campanhasRouter = Router();
const HORAS_EXPIRACAO = Number(process.env.QRCODE_EXPIRATION_HOURS ?? 24);

/**
 * Link de convite: abre o site já no fluxo de entrada na campanha (/entrar/:token).
 * Usa a primeira URL de FRONTEND_URL (se houver várias separadas por vírgula).
 */
function linkDeEntrada(token) {
  const base = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")[0]
    .trim()
    .replace(/\/$/, "");
  return `${base}/entrar/${token}`;
}

/** Monta o link e o QR Code (que aponta para o mesmo link) a partir do token. */
async function dadosDeEntrada(token) {
  const link = linkDeEntrada(token);
  return { link_entrada: link, qr_code_imagem: await QRCode.toDataURL(link) };
}

// CREATE — gera já com QR Code de acesso (expira em N horas)
campanhasRouter.post("/", validate(criarCampanhaSchema), async (req, res) => {
  const { nome, sistema_rpg, descricao } = req.body;
  const token = nanoid(24);
  const expiraEm = new Date(Date.now() + HORAS_EXPIRACAO * 60 * 60 * 1000);

  const { rows } = await query(
    `insert into campanhas (mestre_id, nome, sistema_rpg, descricao, qr_code_token, qr_code_expira_em)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [req.user.id, nome, sistema_rpg, descricao ?? null, token, expiraEm]
  );

  const campanha = rows[0];
  res.status(201).json({ ...campanha, ...(await dadosDeEntrada(token)) });
});

// LIST — "Minhas Campanhas" (como mestre) + onde sou jogador
campanhasRouter.get("/", async (req, res) => {
  const { rows } = await query(
    `select c.*, (c.mestre_id = $1) as sou_mestre
     from campanhas c
     where c.mestre_id = $1
     or exists (select 1 from campanha_jogadores cj where cj.campanha_id = c.id and cj.jogador_id = $1)
     order by c.criado_em desc`,
    [req.user.id]
  );
  // o token de convite é só do mestre: jogadores não recebem esse campo
  res.json(
    rows.map((c) =>
      c.sou_mestre ? c : { ...c, qr_code_token: undefined, qr_code_expira_em: undefined }
    )
  );
});

// DETALHE — mestre ou jogador da campanha
campanhasRouter.get(
  "/:campanhaId",
  requireCampaignMember(),
  async (req, res) => {
    const { rows } = await query("select * from campanhas where id = $1", [
      req.params.campanhaId,
    ]);
    const campanha = rows[0];

    // jogadores não precisam (nem devem) ver o token de convite
    if (campanha.mestre_id !== req.user.id) {
      const { qr_code_token, qr_code_expira_em, ...publico } = campanha;
      return res.json(publico);
    }

    // mestre: devolve também o link de convite e o QR Code já prontos
    const entrada = campanha.qr_code_token ? await dadosDeEntrada(campanha.qr_code_token) : {};
    res.json({ ...campanha, ...entrada });
  }
);

// Regenerar QR Code (só o mestre)
campanhasRouter.post(
  "/:campanhaId/qrcode",
  requireCampaignMaster(),
  async (req, res) => {
    const token = nanoid(24);
    const expiraEm = new Date(Date.now() + HORAS_EXPIRACAO * 60 * 60 * 1000);
    const { rows } = await query(
      `update campanhas set qr_code_token = $1, qr_code_expira_em = $2
       where id = $3 returning *`,
      [token, expiraEm, req.params.campanhaId]
    );
    res.json({ ...rows[0], ...(await dadosDeEntrada(token)) });
  }
);

// Entrar na campanha lendo o QR Code (token precisa estar válido/não expirado)
campanhasRouter.post(
  "/entrar",
  validate(entrarCampanhaSchema),
  async (req, res) => {
    const { token } = req.body;
    const { rows } = await query(
      "select * from campanhas where qr_code_token = $1 and qr_code_expira_em > now()",
      [token]
    );
    if (rows.length === 0) {
      return res.status(410).json({ error: "QR Code inválido ou expirado." });
    }
    const campanha = rows[0];

    if (campanha.mestre_id === req.user.id) {
      return res.status(400).json({ error: "Você é o mestre desta campanha." });
    }

    await query(
      `insert into campanha_jogadores (campanha_id, jogador_id)
       values ($1, $2)
       on conflict (campanha_id, jogador_id) do nothing`,
      [campanha.id, req.user.id]
    );
    res.status(200).json(campanha);
  }
);

// Jogadores/personagens da campanha, com filtro por nome e paginação
campanhasRouter.get(
  "/:campanhaId/personagens",
  requireCampaignMember(),
  async (req, res) => {
    const page = Math.max(parseInt(req.query.page ?? "1", 10) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(req.query.pageSize ?? "10", 10) || 10, 1), 50);
    const filtro = `%${req.query.nome ?? ""}%`;

    const dados = await query(
      `select p.*, u.nome as jogador_nome
       from personagens p
       join usuarios u on u.id = p.jogador_id
       where p.campanha_id = $1 and p.nome ilike $2
       order by p.nome
       limit $3 offset $4`,
      [req.params.campanhaId, filtro, pageSize, (page - 1) * pageSize]
    );
    const total = await query(
      `select count(*)::int as total
       from personagens p
       where p.campanha_id = $1 and p.nome ilike $2`,
      [req.params.campanhaId, filtro]
    );

    res.json({ dados: dados.rows, pagina: page, pageSize, total: total.rows[0].total });
  }
);

// UPDATE — só o mestre da campanha
campanhasRouter.put(
  "/:campanhaId",
  requireCampaignMaster(),
  validate(editarCampanhaSchema),
  async (req, res) => {
    const { nome, sistema_rpg, descricao } = req.body;
    const { rows } = await query(
      `update campanhas
       set nome = coalesce($1, nome),
           sistema_rpg = coalesce($2, sistema_rpg),
           descricao = coalesce($3, descricao)
       where id = $4
       returning *`,
      [nome ?? null, sistema_rpg ?? null, descricao ?? null, req.params.campanhaId]
    );
    res.json(rows[0]);
  }
);

// DELETE — só o mestre (apaga em cascata jogadores, personagens, sessões e disponibilidades)
campanhasRouter.delete(
  "/:campanhaId",
  requireCampaignMaster(),
  async (req, res) => {
    await query("delete from campanhas where id = $1", [req.params.campanhaId]);
    res.status(204).send();
  }
);
