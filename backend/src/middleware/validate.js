/** Valida req.body contra um schema Zod; devolve mensagens claras em caso de erro. */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Dados inválidos.",
        detalhes: result.error.issues.map((i) => ({
          campo: i.path.join("."),
          mensagem: i.message,
        })),
      });
    }
    req.body = result.data;
    next();
  };
}
