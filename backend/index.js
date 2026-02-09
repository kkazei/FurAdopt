import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import http from "http";

import { connectDB } from "./db/dbConfig.js";

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

app.use(cors({ 
	origin: ["http://localhost:5173", "http://localhost:5174"], 
	credentials: true 
}));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'backend/uploads')));

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

server.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port: ", PORT);
});