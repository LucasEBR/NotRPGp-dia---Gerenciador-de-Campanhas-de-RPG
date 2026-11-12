import { z } from "zod";

export const SISTEMAS_RPG = ["dnd5e", "tormenta20", "ordem_paranormal"];

export const criarPersonagemSchema = z.object({
  campanha_id: z.string().uuid({ message: "campanha_id inválido." }),
  nome: z.string().min(1, "Nome é obrigatório.").max(80),
  sistema_rpg: z.enum(SISTEMAS_RPG, {
    errorMap: () => ({ message: `sistema_rpg deve ser um de: ${SISTEMAS_RPG.join(", ")}` }),
  }),
  ficha: z.record(z.any()).default({}),
  avatar_url: z.string().url().optional().nullable(),
});

export const editarPersonagemSchema = criarPersonagemSchema
  .omit({ campanha_id: true })
  .partial();
