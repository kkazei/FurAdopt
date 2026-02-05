import express from "express";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);

export default router;
