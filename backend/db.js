// db.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on("connect", () => {
  console.log("🔌 PostgreSQL conectado");
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en PostgreSQL:", err);
});

export default pool;
