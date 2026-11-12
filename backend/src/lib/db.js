import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase")
    ? { rejectUnauthorized: false }
    : false,
});

/**
 * Executa uma query parametrizada (nunca concatenar SQL na mão — evita SQL Injection).
 * @param {string} text
 * @param {any[]} params
 */
export function query(text, params = []) {
  return pool.query(text, params);
}
