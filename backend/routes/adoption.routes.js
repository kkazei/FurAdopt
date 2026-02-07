import express from "express";
import {
	createAdoptionRequest,
	getMyAdoptedPets,
	getMyRequests,
	getShelterRequests,
	updateRequestStatus,
	getShelterAdoptedPets,
} from "../controllers/adoption.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, createAdoptionRequest);
router.get("/my", verifyToken, getMyRequests);
router.get("/my/adopted", verifyToken, getMyAdoptedPets);

// Shelter routes
router.get("/shelter/requests", verifyToken, getShelterRequests);
router.put("/shelter/requests/:requestId", verifyToken, updateRequestStatus);
router.get("/shelter/adopted", verifyToken, getShelterAdoptedPets);

export default router;
