import { Router } from "express";
import { query } from "../lib/db.js";
import { validate } from "../middleware/validate.js";
import {
  criarPersonagemSchema,
  editarPersonagemSchema,
} from "../schemas/personagem.js";

export const personagensRouter = Router();

/** Garante que o usuário é mesmo o dono do personagem antes de editar/excluir. */
async function carregarPersonagemDoUsuario(req, res, next) {
  const { rows } = await query(
    "select * from personagens where id = $1 and jogador_id = $2",
    [req.params.id, req.user.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: "Personagem não encontrado." });
  }
  req.personagem = rows[0];
  next();
}

// CREATE
personagensRouter.post("/", validate(criarPersonagemSchema), async (req, res) => {
  const { campanha_id, nome, sistema_rpg, ficha, avatar_url } = req.body;

  // precisa participar da campanha (como jogador ou mestre) para criar ficha nela
  const membro = await query(
    `select 1 from campanhas where id = $1 and mestre_id = $2
     union
     select 1 from campanha_jogadores where campanha_id = $1 and jogador_id = $2`,
    [campanha_id, req.user.id]
  );
  if (membro.rows.length === 0) {
    return res.status(403).json({ error: "Você não participa desta campanha." });
  }

  const { rows } = await query(
    `insert into personagens (jogador_id, campanha_id, nome, sistema_rpg, ficha, avatar_url)
     values ($1, $2, $3, $4, $5, $6)
     returning *`,
    [req.user.id, campanha_id, nome, sistema_rpg, ficha, avatar_url ?? null]
  );
  res.status(201).json(rows[0]);
});

// LIST (do usuário logado, com paginação e filtro por campanha)
personagensRouter.get("/", async (req, res) => {
  const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
  const pageSize = Math.min(parseInt(req.query.pageSize ?? "10", 10), 50);
  const offset = (page - 1) * pageSize;
  const campanhaId = req.query.campanha_id || null;

  const { rows } = await query(
    `select * from personagens
     where jogador_id = $1 and ($2::uuid is null or campanha_id = $2)
     order by criado_em desc
     limit $3 offset $4`,
    [req.user.id, campanhaId, pageSize, offset]
  );
  const total = await query(
    `select count(*)::int as total from personagens
     where jogador_id = $1 and ($2::uuid is null or campanha_id = $2)`,
    [req.user.id, campanhaId]
  );

  res.json({ dados: rows, pagina: page, pageSize, total: total.rows[0].total });
});

// READ
personagensRouter.get("/:id", carregarPersonagemDoUsuario, (req, res) => {
  res.json(req.personagem);
});

// UPDATE
personagensRouter.put(
  "/:id",
  carregarPersonagemDoUsuario,
  validate(editarPersonagemSchema),
  async (req, res) => {
    const atual = req.personagem;
    const dados = { ...atual, ...req.body };
    const { rows } = await query(
      `update personagens
       set nome = $1, sistema_rpg = $2, ficha = $3, avatar_url = $4, atualizado_em = now()
       where id = $5
       returning *`,
      [dados.nome, dados.sistema_rpg, dados.ficha, dados.avatar_url, atual.id]
    );
    res.json(rows[0]);
  }
);

// DELETE
personagensRouter.delete("/:id", carregarPersonagemDoUsuario, async (req, res) => {
  await query("delete from personagens where id = $1", [req.personagem.id]);
  res.status(204).send();
});
