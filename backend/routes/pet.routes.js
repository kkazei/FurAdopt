import express from "express";
import { getPetStats, listPets } from "../controllers/pet.controller.js";

const router = express.Router();

router.get("/", listPets);
router.get("/stats", getPetStats);

export default router;
