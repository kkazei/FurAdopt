import { Pet } from "../models/pet.model.js";

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
