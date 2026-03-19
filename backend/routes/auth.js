import express from "express";
import { login, logout } from "../controllers/authController.js";

const router = express.Router();

// ================= LOGIN =================
router.post("/login", login);

// ================= LOGOUT =================
router.post("/logout", logout);

export default router;
