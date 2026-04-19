import pool from './backend/db.js';

async function migrate() {
  try {
    console.log('🔄 Iniciando migración de base de datos...');

    // 1. Crear tabla configuracion_sync
    await pool.query(`
      CREATE TABLE IF NOT EXISTS configuracion_sync (
        id SERIAL PRIMARY KEY,
        comercio_id INTEGER REFERENCES comercios(id),
        api_token TEXT,
        sync_enabled BOOLEAN DEFAULT false,
        ultima_sincronizacion TIMESTAMP
      );
    `);
    console.log('✅ Tabla configuracion_sync creada o verificada ok.');

    // 2. Insertar configuración por defecto para el comercio 1 si no existe
    const checkConfig = await pool.query('SELECT id FROM configuracion_sync WHERE comercio_id = 1');
    if (checkConfig.rows.length === 0) {
      await pool.query('INSERT INTO configuracion_sync (comercio_id, sync_enabled) VALUES (1, false)');
      console.log('✅ Registro por defecto para comercio 1 creado.');
    }

    // 3. Modificar tabla ventas para agregar columna sincronizada_web
    // Atrapamos el error si la columna ya existe
    try {
      await pool.query(`
        ALTER TABLE ventas 
        ADD COLUMN sincronizada_web BOOLEAN DEFAULT false;
      `);
      console.log('✅ Columna sincronizada_web agregada a ventas.');
    } catch (err) {
      if (err.code === '42701') { // 42701 = duplicate_column
        console.log('⚠️ La columna sincronizada_web ya existe en ventas, omitiendo.');
      } else {
        throw err;
      }
    }

    console.log('🎉 Migración completada con éxito.');
  } catch (error) {
    console.error('❌ Error en migración:', error);
  } finally {
    pool.end();
  }
}

migrate();
