import { User } from "../models/user.model.js";
import { Pet } from "../models/pet.model.js";
import { AdoptionRequest } from "../models/adoptionRequest.model.js";
import bcryptjs from "bcryptjs";
import { sendVerificationEmail } from "../mailer/emails.js";

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
	try {
		const totalUsers = await User.countDocuments({ role: "user" });
		const totalShelters = await User.countDocuments({ role: "shelter" });
		const totalPets = await Pet.countDocuments();
		const totalAdoptions = await AdoptionRequest.countDocuments({ status: "approved" });

		res.status(200).json({
			success: true,
			stats: {
				totalUsers,
				totalShelters,
				totalPets,
				totalAdoptions,
			},
		});
	} catch (error) {
		console.error("Error in getDashboardStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all users
export const getAllUsers = async (req, res) => {
	try {
		const users = await User.find({})
			.select("-password -verificationToken -resetPasswordToken")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			users,
		});
	} catch (error) {
		console.error("Error in getAllUsers:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all pets with shelter information
export const getAllPets = async (req, res) => {
	try {
		const pets = await Pet.find({})
			.populate("shelterId", "shelterName")
			.sort({ createdAt: -1 });

		// Add shelter name to pets
		const petsWithShelterName = pets.map(pet => ({
			...pet.toObject(),
			shelterName: pet.shelterId?.shelterName || "Unknown Shelter"
		}));

		res.status(200).json({
			success: true,
			pets: petsWithShelterName,
		});
	} catch (error) {
		console.error("Error in getAllPets:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all adoption requests with detailed information
export const getAllAdoptionRequests = async (req, res) => {
	try {
		const requests = await AdoptionRequest.find({})
			.populate("userId", "name email")
			.populate("petId", "name breed images")
			.populate("shelterId", "shelterName")
			.sort({ createdAt: -1 });

		// Format requests with additional information
		const formattedRequests = requests.map(request => ({
			...request.toObject(),
			applicantName: request.userId?.name || "Unknown User",
			applicantEmail: request.userId?.email || "Unknown Email",
			petName: request.petId?.name || "Unknown Pet",
			petBreed: request.petId?.breed || "Unknown Breed",
			petImage: request.petId?.images?.[0] || null,
			shelterName: request.shelterId?.shelterName || "Unknown Shelter"
		}));

		res.status(200).json({
			success: true,
			requests: formattedRequests,
		});
	} catch (error) {
		console.error("Error in getAllAdoptionRequests:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete a user
export const deleteUser = async (req, res) => {
	try {
		const { userId } = req.params;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// If deleting a shelter, also delete their pets and related adoption requests
		if (user.role === "shelter") {
			const pets = await Pet.find({ shelterId: userId });
			const petIds = pets.map(pet => pet._id);

			// Delete adoption requests for these pets
			await AdoptionRequest.deleteMany({ petId: { $in: petIds } });

			// Delete pets
			await Pet.deleteMany({ shelterId: userId });
		}

		// Delete adoption requests where user is the applicant
		await AdoptionRequest.deleteMany({ userId: userId });

		// Delete the user
		await User.findByIdAndDelete(userId);

		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.error("Error in deleteUser:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete a pet
export const deletePet = async (req, res) => {
	try {
		const { petId } = req.params;

		const pet = await Pet.findById(petId);
		if (!pet) {
			return res.status(404).json({ success: false, message: "Pet not found" });
		}

		// Delete related adoption requests
		await AdoptionRequest.deleteMany({ petId: petId });

		// Delete the pet
		await Pet.findByIdAndDelete(petId);

		res.status(200).json({
			success: true,
			message: "Pet deleted successfully",
		});
	} catch (error) {
		console.error("Error in deletePet:", error);
		res.status(500).json({ success: false, message: "Server error" });	}
};

// Update user role
export const updateUserRole = async (req, res) => {
	try {
		const { userId } = req.params;
		const { role } = req.body;

		if (!["user", "shelter", "admin"].includes(role)) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid role. Must be 'user', 'shelter', or 'admin'" 
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		user.role = role;
		await user.save();

		res.status(200).json({
			success: true,
			message: "User role updated successfully",
			user: {
				_id: user._id,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		console.error("Error in updateUserRole:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Create a new shelter account (admin only)
export const createShelter = async (req, res) => {
	try {
		const { email, password, shelterName, shelterAddress, shelterPhone, shelterDescription } = req.body;

		// Validate required fields
		if (!email || !password || !shelterName) {
			return res.status(400).json({ 
				success: false, 
				message: "Email, password, and shelter name are required" 
			});
		}

		// Check if shelter with email already exists
		const existingShelter = await User.findOne({ email });
		if (existingShelter) {
			return res.status(400).json({ 
				success: false, 
				message: "A user with this email already exists" 
			});
		}

		// Hash password
		const hashedPassword = await bcryptjs.hash(password, 10);
		const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

		// Create shelter user
		const shelter = new User({
			email,
			password: hashedPassword,
			role: "shelter",
			shelterName,
			shelterAddress: shelterAddress || "",
			shelterPhone: shelterPhone || "",
			shelterDescription: shelterDescription || "",
			verificationToken,
			verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
			isVerified: false
		});

		await shelter.save();

		// Send verification email
		await sendVerificationEmail(shelter.email, verificationToken);

		res.status(201).json({
			success: true,
			message: "Shelter account created successfully. Verification email sent.",
			user: {
				_id: shelter._id,
				email: shelter.email,
				role: shelter.role,
				shelterName: shelter.shelterName,
				shelterAddress: shelter.shelterAddress,
				shelterPhone: shelter.shelterPhone,
				shelterDescription: shelter.shelterDescription,
			},
		});
	} catch (error) {
		console.error("Error in createShelter:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};