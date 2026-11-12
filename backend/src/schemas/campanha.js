import { z } from "zod";
import { SISTEMAS_RPG } from "./personagem.js";

export const criarCampanhaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório.").max(80),
  sistema_rpg: z.enum(SISTEMAS_RPG),
  descricao: z.string().max(2000).optional(),
});

export const entrarCampanhaSchema = z.object({
  token: z.string().min(1, "Token do QR Code é obrigatório."),
});
