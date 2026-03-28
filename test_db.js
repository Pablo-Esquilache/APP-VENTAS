import pool from "./backend/db.js";

async function check() {
    try {
        const res = await pool.query("SELECT * FROM configuracion_sync");
        console.log("CONTENIDO DE CONFIGURACION_SYNC:");
        console.dir(res.rows, { depth: null });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
