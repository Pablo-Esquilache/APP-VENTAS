import express from "express";
import {
  getClientes,
  createCliente,
  updateCliente,
  getLocalidades,
  getSaldoCliente,
  getCuentaCorriente,
  registrarPagoCliente,
} from "../controllers/clientesController.js";

const router = express.Router();

router.get("/", getClientes);
router.post("/", createCliente);
router.put("/:id", updateCliente);
router.get("/localidades/lista", getLocalidades);
router.get("/:id/saldo", getSaldoCliente);
router.get("/:id/cuenta-corriente", getCuentaCorriente);
router.post("/:id/pago", registrarPagoCliente);

export default router;;
