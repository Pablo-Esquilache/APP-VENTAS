import express from "express";
import {
  registrarDevolucion,
  getDevoluciones,
  getDetalleDevolucion,
} from "../controllers/devolucionesController.js";

const router = express.Router();

router.post("/", registrarDevolucion);
router.get("/", getDevoluciones);
router.get("/:id/detalle", getDetalleDevolucion);

export default router;
