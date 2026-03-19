import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  database: process.env.PGDATABASE || "postgres",
  user: process.env.PGUSER || "app_ventas",
  password: process.env.PGPASSWORD || "123456",
  port: process.env.PGPORT || 5432,
});


pool.on("connect", () => {
  console.log("🔌 PostgreSQL conectado");
});

pool.on("error", (err) => {
  console.error("❌ Error inesperado en PostgreSQL:", err);
});

export default pool;