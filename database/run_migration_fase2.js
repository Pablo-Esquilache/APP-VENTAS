import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './backend/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'migration_fase2.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Ejecutando migración Fase 2...");
    await pool.query(sql);

    // Insert defaults if empty
    const { rows } = await pool.query(`SELECT COUNT(*) as count FROM gastos_categorias`);
    if (parseInt(rows[0].count) === 0) {
        console.log("Agregando categorías por defecto...");
        // get a comercio_id to insert defaults to
        const comercios = await pool.query(`SELECT id FROM comercios LIMIT 1`);
        if (comercios.rows.length > 0) {
            const comercio_id = comercios.rows[0].id;
            await pool.query(`INSERT INTO gastos_categorias (comercio_id, nombre) VALUES ($1, 'Fijo'), ($1, 'Variable')`, [comercio_id]);
        }
    }

    console.log("Migración Fase 2 completada exitosamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error ejecutando migración:", error);
    process.exit(1);
  }
}

runMigration();
