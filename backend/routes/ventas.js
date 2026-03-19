import express from "express";
import {
  getVentas,
  getVentaById,
  getVentaDetalle,
  createVenta,
  updateVenta,
  deleteVenta,
} from "../controllers/ventasController.js";

const router = express.Router();

router.get("/", getVentas);
router.get("/:id", getVentaById);
router.get("/:id/detalle", getVentaDetalle);
router.post("/", createVenta);
router.put("/:id", updateVenta);
router.delete("/:id", deleteVenta);

export default router;
