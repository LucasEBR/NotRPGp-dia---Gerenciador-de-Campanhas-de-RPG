import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.resolve(__dirname, "../../sql");

async function run() {
  const arquivos = fs.readdirSync(sqlDir).filter((f) => f.endsWith(".sql")).sort();
  for (const arquivo of arquivos) {
    console.log(`Aplicando ${arquivo}...`);
    const sql = fs.readFileSync(path.join(sqlDir, arquivo), "utf-8");
    await pool.query(sql);
  }
  console.log("Migrações aplicadas com sucesso.");
  await pool.end();
}

run().catch((err) => {
  console.error("Erro ao migrar:", err);
  process.exit(1);
});
