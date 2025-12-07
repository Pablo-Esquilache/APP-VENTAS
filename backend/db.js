// db.js (formato ES Modules)
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Mensaje al iniciar
pool.connect()
    .then(() => console.log("🔌 Conectado a PostgreSQL correctamente"))
    .catch(err => console.error("❌ Error de conexión a PostgreSQL:", err));

export default pool;
