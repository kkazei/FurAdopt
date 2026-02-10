import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";
import bcryptjs from "bcryptjs";

import { connectDB } from "./db/dbConfig.js";
import { User } from "./models/user.model.js";

import authRoutes from "./routes/auth.routes.js";
import petRoutes from "./routes/pet.routes.js";
import adoptionRoutes from "./routes/adoption.routes.js";
import userRoutes from "./routes/user.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { initSocket } from "./socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Ensure a default admin exists on startup
const ensureDefaultAdmin = async () => {
	try {
		const existingAdmin = await User.findOne({ role: "admin" });
		if (existingAdmin) {
			console.log(`[bootstrap] Admin exists: ${existingAdmin.email}`);
			return;
		}

		const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@furadopt.com";
		const password = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";
		const name = process.env.DEFAULT_ADMIN_NAME || "Admin User";

		const hashedPassword = await bcryptjs.hash(password, 10);

		await User.create({
			email,
			password: hashedPassword,
			name,
			role: "admin",
			isVerified: true,
		});

		console.log(`[bootstrap] Created default admin -> ${email} / ${password}`);
	} catch (err) {
		console.error("[bootstrap] Failed to ensure default admin", err);
	}
};

app.use(cors({ 
	origin: ["http://localhost:5173", "http://localhost:5174"], 
	credentials: true 
}));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

// Images are now served from Cloudinary — no local static file serving needed

app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/adoption-requests", adoptionRoutes);
app.use("/api/profile", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);

// Initialize websockets
initSocket(server);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get(/.*/, (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

const startServer = async () => {
	try {
		await connectDB();
		await ensureDefaultAdmin();

		server.listen(PORT, () => {
			console.log("Server is running on port: ", PORT);
		});
	} catch (err) {
		console.error("Failed to start server", err);
		process.exit(1);
	}
};

startServer();