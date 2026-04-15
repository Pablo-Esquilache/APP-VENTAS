import express from "express";
import { createBackup } from "../controllers/backupController.js";

const router = express.Router();

/* ==========================
   POST - GENERAR BACKUP
   ========================== */
router.post("/manual", createBackup);

export default router;
