import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const ALLOWED_ORIGINS = ["http://localhost:5173", "http://localhost:5174"]; // add client origin below if provided
if (process.env.CLIENT_URL) {
	ALLOWED_ORIGINS.push(process.env.CLIENT_URL);
}

let ioInstance = null;

const extractToken = (cookieHeader = "") => {
	const tokenPair = cookieHeader
		.split(";")
		.map((c) => c.trim())
		.find((c) => c.startsWith("token="));
	if (!tokenPair) return null;
	return decodeURIComponent(tokenPair.split("=")[1]);
};

export const initSocket = (server) => {
	ioInstance = new Server(server, {
		cors: {
			origin: ALLOWED_ORIGINS,
			credentials: true,
		},
	});

	ioInstance.use((socket, next) => {
		try {
			const token = extractToken(socket.handshake.headers.cookie);
			if (!token) return next(new Error("Unauthorized"));
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			socket.userId = decoded.userId;
			next();
		} catch (err) {
			next(new Error("Unauthorized"));
		}
	});

	ioInstance.on("connection", (socket) => {
		const userId = socket.userId;
		socket.join(userId);

		socket.emit("connected", { userId });

		socket.on("chat:typing", ({ chatId, to, isTyping }) => {
			if (!Array.isArray(to)) return;
			to.forEach((recipientId) => {
				ioInstance.to(recipientId).emit("chat:typing", {
					chatId,
					from: userId,
					isTyping: Boolean(isTyping),
				});
			});
		});

		socket.on("disconnect", () => {
			// Room cleanup handled by socket.io; no extra state kept server-side
		});
	});

	return ioInstance;
};

export const io = () => ioInstance;
