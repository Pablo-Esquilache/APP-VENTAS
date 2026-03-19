import express from "express";
import {
  getHistorialCliente,
  getDetalleVenta,
} from "../controllers/historialController.js";

const router = express.Router();

// =======================================================
// GET HISTORIAL DE VENTAS POR CLIENTE (TRANSACCIONES)
// =======================================================
router.get("/clientes/:id/historial", getHistorialCliente);

// =======================================================
// GET DETALLE DE UNA VENTA
// =======================================================
router.get("/ventas/:ventaId/detalle", getDetalleVenta);

export default router;