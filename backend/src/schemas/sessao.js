import { z } from "zod";

export const criarSessaoSchema = z
  .object({
    data: z.string().date(),
    hora_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Formato HH:MM."),
    hora_fim: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Formato HH:MM."),
    forcar_com_conflito: z.boolean().default(false),
  })
  .refine((v) => v.hora_fim > v.hora_inicio, {
    message: "hora_fim deve ser depois de hora_inicio.",
    path: ["hora_fim"],
  });

export const definirDisponibilidadeSchema = z.object({
  itens: z
    .array(
      z.object({
        dia_semana: z.number().int().min(0).max(6),
        hora_inicio: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
        hora_fim: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
        disponivel: z.boolean(),
      })
    )
    .min(1),
});
