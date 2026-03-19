import express from "express";
import { getComercioByUid } from "../controllers/comerciosController.js";

const router = express.Router();

// ------------------------------
// Obtener comercio a partir del Firebase UID del usuario
// ------------------------------
router.get("/uid/:uid", getComercioByUid);

export default router;
