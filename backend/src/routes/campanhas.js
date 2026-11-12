import { Router } from "express";
import { nanoid } from "nanoid";
import QRCode from "qrcode";
import { query } from "../lib/db.js";
import { validate } from "../middleware/validate.js";
import { requireCampaignMaster, requireCampaignMember } from "../middleware/auth.js";
import { criarCampanhaSchema, entrarCampanhaSchema } from "../schemas/campanha.js";

export const campanhasRouter = Router();
const HORAS_EXPIRACAO = Number(process.env.QRCODE_EXPIRATION_HOURS ?? 24);

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
  const qrCodeDataUrl = await QRCode.toDataURL(token);
  res.status(201).json({ ...campanha, qr_code_imagem: qrCodeDataUrl });
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
  res.json(rows);
});

// DETALHE — mestre ou jogador da campanha
campanhasRouter.get(
  "/:campanhaId",
  requireCampaignMember(),
  async (req, res) => {
    const { rows } = await query("select * from campanhas where id = $1", [
      req.params.campanhaId,
    ]);
    res.json(rows[0]);
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
    const qrCodeDataUrl = await QRCode.toDataURL(token);
    res.json({ ...rows[0], qr_code_imagem: qrCodeDataUrl });
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

// Jogadores/personagens da campanha, com filtro por nome (mestre gerencia participantes)
campanhasRouter.get(
  "/:campanhaId/personagens",
  requireCampaignMember(),
  async (req, res) => {
    const filtro = req.query.nome ? `%${req.query.nome}%` : "%";
    const { rows } = await query(
      `select p.*, u.nome as jogador_nome
       from personagens p
       join usuarios u on u.id = p.jogador_id
       where p.campanha_id = $1 and p.nome ilike $2
       order by p.nome`,
      [req.params.campanhaId, filtro]
    );
    res.json(rows);
  }
);
