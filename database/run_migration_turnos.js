import fs from "fs";
import pool from "../backend/db.js";

async function run() {
  const sql = fs.readFileSync("migration_turnos.sql", "utf-8");
  try {
    await pool.query(sql);
    console.log("Migración ejecutada con éxito");
  } catch (error) {
    console.error("Error ejecutando migración", error);
  } finally {
    pool.end();
  }
}

run();
