// app.js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
dotenv.config();

// Importar conexión a la base (IMPORTANTE)
import "./db.js";

// Importar rutas
import ventasRouter from "./routes/ventas.js";
import productosRouter from "./routes/productos.js";
import clientesRouter from "./routes/clientes.js";
import gastosRouter from "./routes/gastos.js";

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rutas API
app.use("/api/ventas", ventasRouter);
app.use("/api/productos", productosRouter);
app.use("/api/clientes", clientesRouter);
app.use("/api/gastos", gastosRouter);

// Puerto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
