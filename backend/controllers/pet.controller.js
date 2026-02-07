import { Pet } from "../models/pet.model.js";

export const createPet = async (req, res) => {
	try {
		const { name, type, breed, age, size, healthStatus, description, images } = req.body;
		const userId = req.userId; // from verifyToken middleware

		if (!name || !type || !breed || age === undefined || !size || !healthStatus) {
			return res.status(400).json({ success: false, message: "All required fields must be provided" });
		}

		const pet = new Pet({
			name,
			type: type.toLowerCase(),
			breed,
			age,
			size: size.toLowerCase(),
			healthStatus,
			description: description || "",
			owner: userId,
			images: images || [],
		});

		await pet.save();
		res.status(201).json({ success: true, pet, message: "Pet created successfully" });
	} catch (error) {
		console.error("Error creating pet", error);
		res.status(500).json({ success: false, message: "Failed to create pet" });
	}
};

export const updatePet = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, type, breed, age, size, healthStatus, description, images } = req.body;
		const userId = req.userId;

		const pet = await Pet.findById(id);
		if (!pet) {
			return res.status(404).json({ success: false, message: "Pet not found" });
		}

		// Check if the user is the owner
		if (pet.owner.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Not authorized to update this pet" });
		}

		// Update fields
		if (name) pet.name = name;
		if (type) pet.type = type.toLowerCase();
		if (breed) pet.breed = breed;
		if (age !== undefined) pet.age = age;
		if (size) pet.size = size.toLowerCase();
		if (healthStatus) pet.healthStatus = healthStatus;
		if (description !== undefined) pet.description = description;
		if (images) pet.images = images;

		await pet.save();
		res.status(200).json({ success: true, pet, message: "Pet updated successfully" });
	} catch (error) {
		console.error("Error updating pet", error);
		res.status(500).json({ success: false, message: "Failed to update pet" });
	}
};

export const deletePet = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		const pet = await Pet.findById(id);
		if (!pet) {
			return res.status(404).json({ success: false, message: "Pet not found" });
		}

		// Check if the user is the owner
		if (pet.owner.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Not authorized to delete this pet" });
		}

		await Pet.findByIdAndDelete(id);
		res.status(200).json({ success: true, message: "Pet deleted successfully" });
	} catch (error) {
		console.error("Error deleting pet", error);
		res.status(500).json({ success: false, message: "Failed to delete pet" });
	}
};

export const getShelterPets = async (req, res) => {
	try {
		const userId = req.userId;
		const pets = await Pet.find({ owner: userId }).sort({ createdAt: -1 });
		res.status(200).json({ success: true, pets });
	} catch (error) {
		console.error("Error fetching shelter pets", error);
		res.status(500).json({ success: false, message: "Failed to fetch pets" });
	}
};

export const listPets = async (req, res) => {
	try {
		const {
			type,
			breed,
			size,
			healthStatus,
			ageMin,
			ageMax,
			status = "available",
		} = req.query;

		const filter = {};
		if (type) filter.type = type.toLowerCase();
		if (breed) filter.breed = { $regex: breed, $options: "i" };
		if (size) filter.size = size.toLowerCase();
		if (healthStatus) filter.healthStatus = { $regex: healthStatus, $options: "i" };
		if (status) filter.status = status;
		if (ageMin || ageMax) {
			filter.age = {};
			if (ageMin) filter.age.$gte = Number(ageMin);
			if (ageMax) filter.age.$lte = Number(ageMax);
		}

		const pets = await Pet.find(filter).sort({ createdAt: -1 });
		res.status(200).json({ success: true, pets });
	} catch (error) {
		console.error("Error listing pets", error);
		res.status(500).json({ success: false, message: "Failed to fetch pets" });
	}
};

export const getPetStats = async (_req, res) => {
	try {
		const totalAvailable = await Pet.countDocuments({ status: "available" });
		res.status(200).json({ success: true, stats: { totalAvailable } });
	} catch (error) {
		console.error("Error fetching pet stats", error);
		res.status(500).json({ success: false, message: "Failed to fetch stats" });
	}
};
