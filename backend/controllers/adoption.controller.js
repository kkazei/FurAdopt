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

// Shelter-specific controllers
export const getShelterRequests = async (req, res) => {
	try {
		const userId = req.userId;
		
		// Find all pets owned by this shelter
		const shelterPets = await Pet.find({ owner: userId }).select('_id');
		const petIds = shelterPets.map(pet => pet._id);
		
		// Find all adoption requests for these pets
		const requests = await AdoptionRequest.find({ pet: { $in: petIds } })
			.sort({ createdAt: -1 })
			.populate('pet')
			.populate('user', 'name email age location bio');
		
		res.status(200).json({ success: true, requests });
	} catch (error) {
		console.error("Error fetching shelter requests", error);
		res.status(500).json({ success: false, message: "Failed to fetch requests" });
	}
};

export const updateRequestStatus = async (req, res) => {
	try {
		const { requestId } = req.params;
		const { status, visitDate } = req.body;
		const userId = req.userId;
		
		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({ success: false, message: "Invalid status" });
		}
		
		const request = await AdoptionRequest.findById(requestId).populate('pet');
		if (!request) {
			return res.status(404).json({ success: false, message: "Request not found" });
		}
		
		// Verify the pet belongs to this shelter
		if (request.pet.owner.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Not authorized" });
		}
		
		request.status = status;
		if (status === 'approved' && visitDate) {
			request.visitDate = new Date(visitDate);
		}
		
		// If approved, update pet status
		if (status === 'approved') {
			const pet = await Pet.findById(request.pet._id);
			pet.status = 'adopted';
			pet.adoptedBy = request.user;
			await pet.save();
			
			// Reject all other pending requests for this pet
			await AdoptionRequest.updateMany(
				{ pet: request.pet._id, _id: { $ne: requestId }, status: 'pending' },
				{ status: 'rejected' }
			);
		}
		
		await request.save();
		
		// Populate user details before sending response
		await request.populate('user', 'name email age location bio');
		
		res.status(200).json({ success: true, request, message: `Request ${status}` });
	} catch (error) {
		console.error("Error updating request status", error);
		res.status(500).json({ success: false, message: "Failed to update request" });
	}
};

export const getShelterAdoptedPets = async (req, res) => {
	try {
		const userId = req.userId;
		
		// Find all adopted pets owned by this shelter
		const adoptedPets = await Pet.find({ owner: userId, status: 'adopted' })
			.sort({ updatedAt: -1 })
			.populate('adoptedBy', 'name email');
		
		res.status(200).json({ success: true, pets: adoptedPets });
	} catch (error) {
		console.error("Error fetching shelter adopted pets", error);
		res.status(500).json({ success: false, message: "Failed to fetch adopted pets" });
	}
};
