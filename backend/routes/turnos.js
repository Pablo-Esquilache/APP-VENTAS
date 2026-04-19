import express from "express";
import {
  getTurnos,
  createTurno,
  updateTurno,
  deleteTurno,
} from "../controllers/turnosController.js";

const router = express.Router();

router.get("/", getTurnos);
router.post("/", createTurno);
router.put("/:id", updateTurno);
router.delete("/:id", deleteTurno);

export default router;
