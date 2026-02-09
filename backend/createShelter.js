import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { connectDB } from "./db/dbConfig.js";

dotenv.config();

const createShelter = async () => {
	try {
		await connectDB();
		
		// Check if shelter already exists
		const existingShelter = await User.findOne({ role: "shelter" });
		if (existingShelter) {
			console.log("Shelter account already exists:", existingShelter.email);
			process.exit(0);
		}

		// Shelter account details
		const shelterData = {
			email: "shelter@furadopt.com",
			password: "shelter123", // You should change this in production
			role: "shelter",
			shelterName: "FurAdopt Shelter",
			shelterAddress: "123 Pet Lane, Animal City, AC 12345",
			shelterPhone: "(555) 123-4567",
			shelterDescription: "A loving shelter dedicated to finding homes for pets in need. We provide care, medical attention, and love to all animals while they wait for their forever families.",
			isVerified: true,
		};

		// Hash password
		const hashedPassword = await bcryptjs.hash(shelterData.password, 10);

		// Create shelter account
		const shelter = new User({
			...shelterData,
			password: hashedPassword,
		});

		await shelter.save();

		console.log("Shelter account created successfully!");
		console.log("Email:", shelterData.email);
		console.log("Password:", shelterData.password);
		console.log("Shelter Name:", shelterData.shelterName);
		console.log("Please change the default password after first login.");
		
		process.exit(0);
	} catch (error) {
		console.error("Error creating shelter account:", error);
		process.exit(1);
	}
};

createShelter();