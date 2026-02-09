import express from "express";
import { getPetStats, listPets, createPet, updatePet, deletePet, getShelterPets, getShelterStats, getFeaturedPets, getSuccessStories } from "../controllers/pet.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import upload from "../utils/multerConfig.js";

const router = express.Router();

router.get("/", listPets);
router.get("/stats", getPetStats);
router.get("/featured", getFeaturedPets);
router.get("/success-stories", getSuccessStories);

// Protected routes for shelter owners
router.post("/", verifyToken, upload.array('images', 5), createPet);
router.put("/:id", verifyToken, upload.array('images', 5), updatePet);
router.delete("/:id", verifyToken, deletePet);
router.get("/my-pets", verifyToken, getShelterPets);
router.get("/shelter/stats", verifyToken, getShelterStats);

export default router;
