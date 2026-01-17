import express from "express";
import { registerAdmin, registerUser, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/register-admin", registerAdmin);
router.post("/register", registerUser);
router.post("/login", login);

export default router;
