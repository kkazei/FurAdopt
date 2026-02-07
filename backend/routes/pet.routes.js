import express from "express";
import { getPetStats, listPets, createPet, updatePet, deletePet, getShelterPets } from "../controllers/pet.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/", listPets);
router.get("/stats", getPetStats);

// Protected routes for shelter owners
router.post("/", verifyToken, createPet);
router.put("/:id", verifyToken, updatePet);
router.delete("/:id", verifyToken, deletePet);
router.get("/my-pets", verifyToken, getShelterPets);

export default router;
