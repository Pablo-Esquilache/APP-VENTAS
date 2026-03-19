import express from "express";
import {
  getGastos,
  createGasto,
  updateGasto,
  deleteGasto,
} from "../controllers/gastosController.js";

const router = express.Router();

router.get("/", getGastos);
router.post("/", createGasto);
router.put("/:id", updateGasto);
router.delete("/:id", deleteGasto);

export default router;
