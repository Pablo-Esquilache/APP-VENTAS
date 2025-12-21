// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

// DB
import "./db.js";

// Rutas
import ventasRouter from "./routes/ventas.js";
import productosRouter from "./routes/productos.js";
import clientesRouter from "./routes/clientes.js";
import gastosRouter from "./routes/gastos.js";
import comerciosRouter from "./routes/comercios.js";
import authRouter from "./routes/auth.js";
import reportesRoutes from "./routes/reportes.js";
import exportarTablaRouter from "./routes/deacragaExcel.js";
import systemRouter from "./routes/system.js";
import clientesHistorialRoutes from "./routes/historial.js";

// Middlewares
import requireAuth from "./middleware/requireAuth.js";
import { requiereRol } from "./middleware/requireRole.js";

const app = express();

// Middlewares globales
app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());

// Auth (login / register)
app.use("/api/auth", authRouter);

// Rutas comunes → user y admin (solo logueados)
app.use("/api/ventas", requireAuth, ventasRouter);
app.use("/api/productos", requireAuth, productosRouter);
app.use("/api/clientes", requireAuth, clientesRouter);
app.use("/api/gastos", requireAuth, gastosRouter);
app.use("/api/comercios", requireAuth, comerciosRouter);
app.use("/api/exportar-tabla", requireAuth, exportarTablaRouter);
app.use("/api/system", requireAuth, systemRouter);

app.use(
  "/api/reportes",
  requireAuth,
  requiereRol("admin"),
  reportesRoutes
);

app.use(
  "/api",
  requireAuth,
  requiereRol("admin"),
  clientesHistorialRoutes
);


// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
