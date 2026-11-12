import "dotenv/config";
import express from "express";
import cors from "cors";
import "express-async-errors"; // permite que erros em handlers async caiam no error handler abaixo

import { requireAuth } from "./middleware/auth.js";
import { personagensRouter } from "./routes/personagens.js";
import { campanhasRouter } from "./routes/campanhas.js";
import { sessoesRouter } from "./routes/sessoes.js";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

// único endpoint público — usado pelo serviço de deploy para healthcheck
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// tudo abaixo exige usuário autenticado (Supabase Auth)
app.use("/api", requireAuth);
app.use("/api/campanhas", campanhasRouter);
app.use("/api/personagens", personagensRouter);
app.use("/api/campanhas", sessoesRouter); // /api/campanhas/:campanhaId/sessoes e /disponibilidade

// handler de erro genérico — nunca deixa stacktrace vazar pro cliente
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Erro interno do servidor." });
});

const port = process.env.PORT || 3333;
app.listen(port, () => console.log(`API rodando na porta ${port}`));
