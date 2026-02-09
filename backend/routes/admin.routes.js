import express from "express";
import {
	getDashboardStats,
	getAllUsers,
	getAllPets,
	getAllAdoptionRequests,
	deleteUser,
	deletePet,
	updateUserRole,
	createShelter,
} from "../controllers/admin.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { User } from "../models/user.model.js";

const router = express.Router();

// Middleware to check if user is admin
const verifyAdmin = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(401).json({ 
				success: false, 
				message: "User not found" 
			});
		}
		
		if (user.role !== "admin") {
			return res.status(403).json({ 
				success: false, 
				message: "Access denied. Admin role required." 
			});
		}
		
		req.user = user;
		next();
	} catch (error) {
		console.error("Error in verifyAdmin middleware:", error);
		return res.status(500).json({ 
			success: false, 
			message: "Server error" 
		});
	}
};

// Apply token verification and admin check to all routes
router.use(verifyToken);
router.use(verifyAdmin);

// Dashboard statistics
router.get("/dashboard-stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUser);
router.put("/users/:userId/role", updateUserRole);router.post("/shelters", createShelter);
// Pet management
router.get("/pets", getAllPets);
router.delete("/pets/:petId", deletePet);

// Adoption management
router.get("/adoption-requests", getAllAdoptionRequests);

export default router;