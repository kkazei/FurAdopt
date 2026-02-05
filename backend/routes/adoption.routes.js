import express from "express";
import {
	createAdoptionRequest,
	getMyAdoptedPets,
	getMyRequests,
} from "../controllers/adoption.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createAdoptionRequest);
router.get("/my", verifyToken, getMyRequests);
router.get("/my/adopted", verifyToken, getMyAdoptedPets);

export default router;
