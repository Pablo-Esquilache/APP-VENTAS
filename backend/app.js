import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import pool from "./db.js";
import path from "path";
import { fileURLToPath } from "url";
import { app as electronApp } from "electron";
import net from "net";

import cajasRoutes from "./routes/cajas.js";
import ventasRouter from "./routes/ventas.js";
import productosRouter from "./routes/productos.js";
import clientesRouter from "./routes/clientes.js";
import gastosRouter from "./routes/gastos.js";
import comerciosRouter from "./routes/comercios.js";
import authRouter from "./routes/auth.js";
import usuariosRouter from "./routes/usuarios.js";
import reportesRoutes from "./routes/reportes.js";
import exportarTablaRouter from "./routes/deacragaExcel.js";
import systemRouter from "./routes/system.js";
import clientesHistorialRoutes from "./routes/historial.js";
import devolucionesRoutes from "./routes/devoluciones.js";
import syncConfigRoutes from "./routes/syncConfigRoutes.js";
import backupRoutes from "./routes/backupRoutes.js";
import ajustesRoutes from "./routes/ajustes.js";
import turnosRoutes from "./routes/turnos.js";
import { initSyncWorker } from "./services/syncWorker.js";
import { initBackupCron } from "./services/backupService.js";

/* ===== RUTAS ABSOLUTAS ===== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ===== CONFIGURAR DOTENV ===== */
if (electronApp?.isPackaged) {
  // En producción, buscamos estrictamente el .env al lado del Ejecutable (.exe)
  dotenv.config({ path: path.join(path.dirname(process.execPath), ".env") });
} else {
  // En desarrollo, usamos el .env de la carpeta backend
  dotenv.config({ path: path.join(__dirname, ".env") });
}

/* ===== TEST CONEXIÓN DB ===== */
pool.query("SELECT NOW()")
  .then(res => console.log("✅ Base conectada:", res.rows[0]))
  .catch(err => console.error("❌ Error conexión DB:", err));

/* ===== MIDDLEWARES ===== */
app.use(helmet());
app.use(cors());
app.use(express.json());

/* ===== RUTA FRONTEND ===== */
let frontendPath;

if (electronApp?.isPackaged) {
  frontendPath = path.join(process.resourcesPath, "app.asar", "frontend");
} else {
  frontendPath = path.join(__dirname, "..", "frontend");
}

console.log("📁 Frontend path:", frontendPath);

/* ===== SERVIR FRONTEND ===== */
app.use(express.static(frontendPath));

/* ===== RUTAS API ===== */
app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/ventas", ventasRouter);
app.use("/api/productos", productosRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/gastos", gastosRouter);
app.use("/api/comercios", comerciosRouter);
app.use("/api/exportar-tabla", exportarTablaRouter);
app.use("/api/system", systemRouter);
app.use("/api/reportes", reportesRoutes);
app.use("/api", clientesHistorialRoutes);
app.use("/api/devoluciones", devolucionesRoutes);
app.use("/api/cajas", cajasRoutes);
app.use("/api/config-sync", syncConfigRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/ajustes", ajustesRoutes);
app.use("/api/turnos", turnosRoutes);

/* ===== FALLBACK SPA ===== */
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

/* ===== BUSCAR PUERTO DISPONIBLE ===== */

function findAvailablePort(startPort) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.listen(startPort, () => {
      server.close(() => resolve(startPort));
    });

    server.on("error", async () => {
      resolve(await findAvailablePort(startPort + 1));
    });
  });
}

const BASE_PORT = 4000;
const PORT = await findAvailablePort(BASE_PORT);

/* ===== INICIAR SERVIDOR ===== */

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  initSyncWorker(); // Iniciar cron de sincronización en segundo plano
  initBackupCron(); // Chequear si corresponde generar un backup automático
});

export default server;