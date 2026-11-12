import { supabaseAdmin } from "../lib/supabase.js";
import { query } from "../lib/db.js";

/**
 * Protege rotas privadas: exige um Bearer token válido do Supabase Auth.
 * Qualquer rota sob /api/* passa por aqui, exceto o health check.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Token de autenticação ausente." });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }

  const authUser = data.user;

  // Garante que o usuário existe espelhado na tabela "usuarios" (1ª vez que ele aparece).
  await query(
    `insert into usuarios (id, nome, email, auth_provider)
     values ($1, $2, $3, $4)
     on conflict (id) do update set email = excluded.email`,
    [
      authUser.id,
      authUser.user_metadata?.full_name || authUser.email,
      authUser.email,
      authUser.app_metadata?.provider || "email",
    ]
  );

  req.user = { id: authUser.id, email: authUser.email };
  next();
}

/**
 * Autorização contextual: só o mestre daquela campanha pode seguir.
 * Papel "mestre"/"jogador" não é fixo no usuário — é relativo a cada campanha.
 */
export function requireCampaignMaster() {
  return async (req, res, next) => {
    const { campanhaId } = req.params;
    const { rows } = await query(
      "select 1 from campanhas where id = $1 and mestre_id = $2",
      [campanhaId, req.user.id]
    );
    if (rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Apenas o mestre desta campanha pode fazer isso." });
    }
    next();
  };
}

/** Autorização: usuário precisa ser mestre OU jogador participante da campanha. */
export function requireCampaignMember() {
  return async (req, res, next) => {
    const { campanhaId } = req.params;
    const { rows } = await query(
      `select 1 from campanhas where id = $1 and mestre_id = $2
       union
       select 1 from campanha_jogadores where campanha_id = $1 and jogador_id = $2`,
      [campanhaId, req.user.id]
    );
    if (rows.length === 0) {
      return res
        .status(403)
        .json({ error: "Você não participa desta campanha." });
    }
    next();
  };
}
