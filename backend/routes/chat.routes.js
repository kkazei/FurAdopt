import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
	getUserChats, 
	getChatById, 
	createOrGetChat, 
	createOrGetChatByPet,
	sendMessage, 
	markMessagesAsRead, 
	getUnreadCount 
} from "../controllers/chat.controller.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

router.get("/", getUserChats);
router.get("/unread-count", getUnreadCount);
router.get("/:chatId", getChatById);
router.post("/create", createOrGetChat);
router.post("/create-by-pet", createOrGetChatByPet);
router.post("/:chatId/messages", sendMessage);
router.put("/:chatId/read", markMessagesAsRead);

export default router;