import express from "express";
import {
  getVentasGastosTiempo,
  getTopProductos,
  getCategoriasVendidas,
  getEdadEtarioGenero,
  getMetodosPago,
  getGastosDescripcionTipo,
  getVentasPorLocalidad,
  getTopClientes,
} from "../controllers/reportesController.js";

const router = express.Router();

router.get("/ventas-gastos-tiempo", getVentasGastosTiempo);
router.get("/top-productos", getTopProductos);
router.get("/categorias-vendidas", getCategoriasVendidas);
router.get("/edad-etario-genero", getEdadEtarioGenero);
router.get("/metodos-pago", getMetodosPago);
router.get("/gastos-descripcion-tipo", getGastosDescripcionTipo);
router.get("/ventas-por-localidad", getVentasPorLocalidad);
router.get("/top-clientes-frecuencia-ticket", getTopClientes);

export default router;