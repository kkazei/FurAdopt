import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";
let socket = null;

export const getSocket = () => {
	if (!socket) {
		socket = io(SOCKET_URL, {
			withCredentials: true,
			transports: ["websocket"],
		});
	}
	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};
