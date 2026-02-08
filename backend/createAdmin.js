import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { connectDB } from "./db/dbConfig.js";

dotenv.config();

const createAdmin = async () => {
	try {
		await connectDB();
		
		// Check if admin already exists
		const existingAdmin = await User.findOne({ role: "admin" });
		if (existingAdmin) {
			console.log("Admin user already exists:", existingAdmin.email);
			process.exit(0);
		}

		// Admin user details
		const adminData = {
			email: "admin@furadopt.com",
			password: "admin123", // You should change this in production
			name: "Admin User",
			role: "admin",
			isVerified: true,
		};

		// Hash password
		const hashedPassword = await bcryptjs.hash(adminData.password, 10);

		// Create admin user
		const admin = new User({
			...adminData,
			password: hashedPassword,
		});

		await admin.save();

		console.log("Admin user created successfully!");
		console.log("Email:", adminData.email);
		console.log("Password:", adminData.password);
		console.log("Please change the default password after first login.");
		
		process.exit(0);
	} catch (error) {
		console.error("Error creating admin user:", error);
		process.exit(1);
	}
};

createAdmin();