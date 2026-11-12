import { Router } from "express";
import { query } from "../lib/db.js";
import { validate } from "../middleware/validate.js";
import { requireCampaignMaster, requireCampaignMember } from "../middleware/auth.js";
import {
  criarSessaoSchema,
  definirDisponibilidadeSchema,
} from "../schemas/sessao.js";
import { enviarEmailSessaoMarcada } from "../lib/email.js";

export const sessoesRouter = Router();

// Jogador define sua grade de disponibilidade numa campanha
// (por padrão tudo disponível; aqui ele registra as exceções/indisponibilidades)
sessoesRouter.put(
  "/:campanhaId/disponibilidade",
  requireCampaignMember(),
  validate(definirDisponibilidadeSchema),
  async (req, res) => {
    const { campanhaId } = req.params;
    const { itens } = req.body;

    for (const item of itens) {
      await query(
        `insert into disponibilidades (usuario_id, campanha_id, dia_semana, hora_inicio, hora_fim, disponivel)
         values ($1, $2, $3, $4, $5, $6)
         on conflict (usuario_id, campanha_id, dia_semana, hora_inicio, hora_fim)
         do update set disponivel = excluded.disponivel`,
        [req.user.id, campanhaId, item.dia_semana, item.hora_inicio, item.hora_fim, item.disponivel]
      );
    }
    res.status(204).send();
  }
);

// Mestre vê o calendário de disponibilidade de todos os jogadores da campanha
sessoesRouter.get(
  "/:campanhaId/disponibilidade",
  requireCampaignMember(),
  async (req, res) => {
    const { rows } = await query(
      `select d.*, u.nome as usuario_nome
       from disponibilidades d
       join usuarios u on u.id = d.usuario_id
       where d.campanha_id = $1
       order by d.dia_semana, d.hora_inicio`,
      [req.params.campanhaId]
    );
    res.json(rows);
  }
);

/**
 * Regra de negócio "Conflito de Horário":
 * busca jogadores da campanha que marcaram indisponibilidade no dia/horário da sessão.
 */
async function buscarConflitos(campanhaId, data, horaInicio, horaFim) {
  const diaSemana = new Date(`${data}T00:00:00`).getDay();
  const { rows } = await query(
    `select distinct u.id, u.nome
     from disponibilidades d
     join usuarios u on u.id = d.usuario_id
     where d.campanha_id = $1
       and d.dia_semana = $2
       and d.disponivel = false
       and d.hora_inicio < $4 and d.hora_fim > $3`,
    [campanhaId, diaSemana, horaInicio, horaFim]
  );
  return rows;
}

// Mestre tenta marcar uma sessão: 1ª tentativa bloqueia se houver conflito;
// com forcar_com_conflito=true, marca mesmo assim e registra o aviso.
sessoesRouter.post(
  "/:campanhaId/sessoes",
  requireCampaignMaster(),
  validate(criarSessaoSchema),
  async (req, res) => {
    const { campanhaId } = req.params;
    const { data, hora_inicio, hora_fim, forcar_com_conflito } = req.body;

    const conflitos = await buscarConflitos(campanhaId, data, hora_inicio, hora_fim);

    if (conflitos.length > 0 && !forcar_com_conflito) {
      return res.status(409).json({
        error: "Conflito de horário.",
        jogadores_indisponiveis: conflitos,
        dica: "Envie forcar_com_conflito=true para marcar mesmo assim.",
      });
    }

    const { rows } = await query(
      `insert into sessoes (campanha_id, data, hora_inicio, hora_fim, marcada_com_conflito)
       values ($1, $2, $3, $4, $5)
       returning *`,
      [campanhaId, data, hora_inicio, hora_fim, conflitos.length > 0]
    );
    const sessao = rows[0];

    for (const jogador of conflitos) {
      await query(
        `insert into sessao_conflitos (sessao_id, usuario_id, motivo) values ($1, $2, 'indisponivel')`,
        [sessao.id, jogador.id]
      );
    }

    // notifica por e-mail todos os jogadores da campanha (regra extra: +2 pontos)
    const jogadores = await query(
      `select u.email, u.nome from usuarios u
       join campanha_jogadores cj on cj.jogador_id = u.id
       where cj.campanha_id = $1`,
      [campanhaId]
    );
    await enviarEmailSessaoMarcada(jogadores.rows, sessao);

    res.status(201).json(sessao);
  }
);

sessoesRouter.get(
  "/:campanhaId/sessoes",
  requireCampaignMember(),
  async (req, res) => {
    const { rows } = await query(
      "select * from sessoes where campanha_id = $1 order by data, hora_inicio",
      [req.params.campanhaId]
    );
    res.json(rows);
  }
);
