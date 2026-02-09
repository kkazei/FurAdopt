import { Pet } from "../models/pet.model.js";

export const createPet = async (req, res) => {
	try {
		const { name, type, breed, age, size, healthStatus, description, petFriendly, childFriendly } = req.body;
		const userId = req.userId; // from verifyToken middleware

		if (!name || !type || !breed || age === undefined || !size || !healthStatus) {
			return res.status(400).json({ success: false, message: "All required fields must be provided" });
		}

		// Handle image files
		const imageUrls = [];
		if (req.files && req.files.length > 0) {
			req.files.forEach(file => {
				// Store the relative path that can be served as static files
				imageUrls.push(`/uploads/pets/${file.filename}`);
			});
		}

		const pet = new Pet({
			name,
			type: type.toLowerCase(),
			breed,
			age: Number(age),
			size: size.toLowerCase(),
			healthStatus,
			description: description || "",
			petFriendly: petFriendly === 'true' || petFriendly === true,
			childFriendly: childFriendly === 'true' || childFriendly === true,
			owner: userId,
			images: imageUrls,
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
		const { name, type, breed, age, size, healthStatus, description, petFriendly, childFriendly, existingImages } = req.body;
		const userId = req.userId;

		const pet = await Pet.findById(id);
		if (!pet) {
			return res.status(404).json({ success: false, message: "Pet not found" });
		}

		// Check if the user is the owner
		if (pet.owner.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Not authorized to update this pet" });
		}

		// Handle image updates
		let imageUrls = [];
		
		// Add existing images that weren't removed
		if (existingImages) {
			if (Array.isArray(existingImages)) {
				imageUrls = [...existingImages];
			} else {
				imageUrls = [existingImages];
			}
		}
		
		// Add new uploaded images
		if (req.files && req.files.length > 0) {
			req.files.forEach(file => {
				imageUrls.push(`/uploads/pets/${file.filename}`);
			});
		}

		// Update fields
		if (name) pet.name = name;
		if (type) pet.type = type.toLowerCase();
		if (breed) pet.breed = breed;
		if (age !== undefined) pet.age = Number(age);
		if (size) pet.size = size.toLowerCase();
		if (healthStatus) pet.healthStatus = healthStatus;
		if (description !== undefined) pet.description = description;
		pet.petFriendly = petFriendly === 'true' || petFriendly === true;
		pet.childFriendly = childFriendly === 'true' || childFriendly === true;
		pet.images = imageUrls;

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
			petFriendly,
			childFriendly,
			status = "available",
		} = req.query;

		const filter = {};
		if (type) filter.type = type.toLowerCase();
		if (breed) filter.breed = { $regex: breed, $options: "i" };
		if (size) filter.size = size.toLowerCase();
		if (healthStatus) filter.healthStatus = { $regex: healthStatus, $options: "i" };
		if (status) filter.status = status;
		if (petFriendly !== undefined) filter.petFriendly = petFriendly === 'true';
		if (childFriendly !== undefined) filter.childFriendly = childFriendly === 'true';
		if (ageMin || ageMax) {
			filter.age = {};
			if (ageMin) filter.age.$gte = Number(ageMin);
			if (ageMax) filter.age.$lte = Number(ageMax);
		}

		// Exclude pets owned by the current user (if authenticated) to prevent self-adoption
		if (req.userId) {
			filter.owner = { $ne: req.userId };
		}

		const pets = await Pet.find(filter).populate('owner', 'shelterName').sort({ createdAt: -1 });
		res.status(200).json({ success: true, pets });
	} catch (error) {
		console.error("Error listing pets", error);
		res.status(500).json({ success: false, message: "Failed to fetch pets" });
	}
};

export const getPetStats = async (_req, res) => {
	try {
		const totalAvailable = await Pet.countDocuments({ status: "available" });
		const totalAdopted = await Pet.countDocuments({ status: "adopted" });
		const totalRescued = totalAvailable + totalAdopted;
		
		// Recent adoptions (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		const recentAdoptions = await Pet.countDocuments({ 
			status: "adopted", 
			updatedAt: { $gte: thirtyDaysAgo } 
		});

		// Weekly stats for trend
		const weekAgo = new Date();
		weekAgo.setDate(weekAgo.getDate() - 7);
		const weeklyAdoptions = await Pet.countDocuments({ 
			status: "adopted", 
			updatedAt: { $gte: weekAgo } 
		});

		res.status(200).json({ 
			success: true, 
			stats: { 
				totalAvailable,
				totalAdopted,
				totalRescued,
				recentAdoptions,
				weeklyAdoptions
			} 
		});
	} catch (error) {
		console.error("Error fetching pet stats", error);
		res.status(500).json({ success: false, message: "Failed to fetch stats" });
	}
};

// Enhanced shelter statistics
export const getShelterStats = async (req, res) => {
	try {
		const userId = req.userId;
		const { startDate, endDate, period } = req.query;

		// Basic stats
		const totalPets = await Pet.countDocuments({ owner: userId });
		const availablePets = await Pet.countDocuments({ owner: userId, status: "available" });
		const adoptedPets = await Pet.countDocuments({ owner: userId, status: "adopted" });

		// Date-based adoption statistics
		let dateFilter = { owner: userId, status: "adopted" };
		
		if (startDate && endDate) {
			dateFilter.updatedAt = {
				$gte: new Date(startDate),
				$lte: new Date(endDate)
			};
		} else if (period) {
			const now = new Date();
			let start;
			
			switch (period) {
				case 'thisMonth':
					start = new Date(now.getFullYear(), now.getMonth(), 1);
					break;
				case 'lastMonth':
					start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
					const end = new Date(now.getFullYear(), now.getMonth(), 0);
					dateFilter.updatedAt = { $gte: start, $lte: end };
					break;
				case 'last30Days':
					start = new Date(now.setDate(now.getDate() - 30));
					break;
				case 'last7Days':
					start = new Date(now.setDate(now.getDate() - 7));
					break;
				default:
					start = new Date(now.getFullYear(), now.getMonth(), 1);
			}

			if (!dateFilter.updatedAt) {
				dateFilter.updatedAt = { $gte: start };
			}
		}

		const adoptionsInPeriod = await Pet.countDocuments(dateFilter);

		// Adoption trends by month (last 6 months)
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
		
		const adoptionTrends = await Pet.aggregate([
			{ $match: { owner: userId, status: "adopted", updatedAt: { $gte: sixMonthsAgo } } },
			{
				$group: {
					_id: {
						year: { $year: "$updatedAt" },
						month: { $month: "$updatedAt" }
					},
					count: { $sum: 1 }
				}
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } }
		]);

		// Pet type breakdown
		const petTypeStats = await Pet.aggregate([
			{ $match: { owner: userId } },
			{ $group: { _id: "$type", count: { $sum: 1 } } }
		]);

		// Recent activities (last 10 adoptions)
		const recentAdoptions = await Pet.find({ 
			owner: userId, 
			status: "adopted" 
		})
		.populate('adoptedBy', 'name email')
		.sort({ updatedAt: -1 })
		.limit(10);

		res.status(200).json({
			success: true,
			stats: {
				totalPets,
				availablePets,
				adoptedPets,
				adoptionsInPeriod,
				successRate: totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0,
				adoptionTrends,
				petTypeStats,
				recentAdoptions
			}
		});
	} catch (error) {
		console.error("Error fetching shelter stats", error);
		res.status(500).json({ success: false, message: "Failed to fetch shelter stats" });
	}
};

// Get featured pets for landing page
export const getFeaturedPets = async (_req, res) => {
	try {
		const featuredPets = await Pet.find({ status: "available" })
			.populate('owner', 'shelterName')
			.sort({ createdAt: -1 })
			.limit(6);

		res.status(200).json({ success: true, pets: featuredPets });
	} catch (error) {
		console.error("Error fetching featured pets", error);
		res.status(500).json({ success: false, message: "Failed to fetch featured pets" });
	}
};

// Get recent success stories for landing page
export const getSuccessStories = async (_req, res) => {
	try {
		const successStories = await Pet.find({ status: "adopted" })
			.populate('owner', 'shelterName')
			.populate('adoptedBy', 'name')
			.sort({ updatedAt: -1 })
			.limit(3);

		const stories = successStories.map(pet => ({
			id: pet._id,
			name: pet.name,
			type: pet.type,
			breed: pet.breed,
			age: pet.age,
			size: pet.size,
			images: pet.images,
			description: pet.description,
			shelterName: pet.owner?.shelterName,
			adopter: pet.adoptedBy?.name,
			adoptedAt: pet.updatedAt,
			petFriendly: pet.petFriendly,
			childFriendly: pet.childFriendly
		}));

		res.status(200).json({ success: true, stories });
	} catch (error) {
		console.error("Error fetching success stories", error);
		res.status(500).json({ success: false, message: "Failed to fetch success stories" });
	}
};
