import express from "express";
import { exportarExcel } from "../controllers/exportarController.js";

const router = express.Router();

/* ==========================
   GET - EXPORTAR TABLA A EXCEL
   ========================== */
router.get("/", exportarExcel);

export default router;
