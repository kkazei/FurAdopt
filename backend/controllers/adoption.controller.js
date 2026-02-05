import { AdoptionRequest } from "../models/adoptionRequest.model.js";
import { Pet } from "../models/pet.model.js";

export const createAdoptionRequest = async (req, res) => {
	const { petId, note } = req.body;
	try {
		const pet = await Pet.findById(petId);
		if (!pet) {
			return res.status(404).json({ success: false, message: "Pet not found" });
		}
		if (pet.status !== "available") {
			return res.status(400).json({ success: false, message: "Pet is not available" });
		}

		const existing = await AdoptionRequest.findOne({ pet: petId, user: req.userId, status: "pending" });
		if (existing) {
			return res.status(400).json({ success: false, message: "You already have a pending request for this pet" });
		}

		const request = await AdoptionRequest.create({ pet: petId, user: req.userId, note });
		res.status(201).json({ success: true, request });
	} catch (error) {
		console.error("Error creating adoption request", error);
		res.status(500).json({ success: false, message: "Failed to create request" });
	}
};

export const getMyRequests = async (req, res) => {
	try {
		const requests = await AdoptionRequest.find({ user: req.userId })
			.sort({ createdAt: -1 })
			.populate("pet");
		res.status(200).json({ success: true, requests });
	} catch (error) {
		console.error("Error fetching requests", error);
		res.status(500).json({ success: false, message: "Failed to fetch requests" });
	}
};

export const getMyAdoptedPets = async (req, res) => {
	try {
		const pets = await Pet.find({ status: "adopted", adoptedBy: req.userId }).sort({ updatedAt: -1 });
		res.status(200).json({ success: true, pets });
	} catch (error) {
		console.error("Error fetching adopted pets", error);
		res.status(500).json({ success: false, message: "Failed to fetch adopted pets" });
	}
};
