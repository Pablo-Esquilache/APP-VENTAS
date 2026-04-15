import express from "express";
import {
  getCajaHoy,
  abrirCaja,
  cerrarCaja,
  getMovimientosDia,
  getHistorial,
} from "../controllers/cajasController.js";

const router = express.Router();

router.get("/hoy/:comercioId", getCajaHoy);
router.post("/abrir", abrirCaja);
router.put("/cerrar/:id", cerrarCaja);
router.get("/movimientos/:comercioId", getMovimientosDia);
router.get("/historial/:comercioId", getHistorial);

export default router;
