import pool from './backend/db.js';

async function migrateUrl() {
  try {
    await pool.query(`
      ALTER TABLE configuracion_sync 
      ADD COLUMN IF NOT EXISTS api_url TEXT DEFAULT 'http://127.0.0.1:3000/api/sync';
    `);
    console.log('✅ Migración: Columna api_url agregada correctamente.');
  } catch (error) {
    console.error('❌ Error migrando url:', error);
  } finally {
    pool.end();
  }
}

migrateUrl();
