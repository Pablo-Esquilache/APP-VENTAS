import express from "express";
import {
  getProductos,
  getCategorias,
  getProductoById,
  createProducto,
  updateProducto,
  importarProductos,
} from "../controllers/productosController.js";

const router = express.Router();

router.get("/", getProductos);
router.get("/categorias/lista", getCategorias);
router.get("/:id", getProductoById);
router.post("/", createProducto);
router.put("/:id", updateProducto);
router.post("/importar", importarProductos);

export default router;
