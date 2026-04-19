import pool from './backend/db.js';

async function migrateBarcode() {
  try {
    await pool.query(`
      ALTER TABLE productos 
      ADD COLUMN IF NOT EXISTS codigo_barras VARCHAR(255) DEFAULT NULL;
    `);
    console.log('✅ Migración: Columna codigo_barras agregada a productos.');
  } catch (error) {
    console.error('❌ Error migrando codigo_barras:', error);
  } finally {
    pool.end();
  }
}

migrateBarcode();
