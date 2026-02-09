import { Chat } from "../models/chat.model.js";
import { AdoptionRequest } from "../models/adoptionRequest.model.js";
import { io as getIO } from "../socket.js";

// Get all chats for current user
export const getUserChats = async (req, res) => {
	try {
		const userId = req.userId;
		
		const chats = await Chat.find({
			participants: userId
		})
		.populate('participants', 'name email role shelterName')
		.populate('adoptionRequest', 'status')
		.sort({ 'lastMessage.timestamp': -1 });
		
		res.status(200).json({ success: true, chats });
	} catch (error) {
		console.error("Error fetching chats", error);
		res.status(500).json({ success: false, message: "Failed to fetch chats" });
	}
};

// Get specific chat by ID
export const getChatById = async (req, res) => {
	try {
		const { chatId } = req.params;
		const userId = req.userId;
		
		const chat = await Chat.findOne({
			_id: chatId,
			participants: userId
		})
		.populate('participants', 'name email role shelterName')
		.populate({
			path: 'adoptionRequest',
			populate: { path: 'pet', select: 'name breed images type size healthStatus owner shelterName' }
		})
		.populate('messages.sender', 'name role shelterName');
		
		if (!chat) {
			return res.status(404).json({ success: false, message: "Chat not found" });
		}
		
		res.status(200).json({ success: true, chat });
	} catch (error) {
		console.error("Error fetching chat", error);
		res.status(500).json({ success: false, message: "Failed to fetch chat" });
	}
};

// Create a new chat or get existing chat for adoption request
export const createOrGetChat = async (req, res) => {
	try {
		const { adoptionRequestId } = req.body;
		const userId = req.userId;
		
		// Get adoption request details
		const adoptionRequest = await AdoptionRequest.findById(adoptionRequestId)
			.populate('pet')
			.populate('user');
		
		if (!adoptionRequest) {
			return res.status(404).json({ success: false, message: "Adoption request not found" });
		}
		
		// Determine participants (user and shelter owner)
		const participants = [adoptionRequest.user._id, adoptionRequest.pet.owner];
		
		// Check if user is authorized (either the requester or the shelter owner)
		if (!participants.some(p => p.toString() === userId)) {
			return res.status(403).json({ success: false, message: "Not authorized" });
		}
		
		// Check if chat already exists
		let chat = await Chat.findOne({
			adoptionRequest: adoptionRequestId,
			participants: { $all: participants }
		})
		.populate('participants', 'name email role shelterName')
		.populate({
			path: 'adoptionRequest',
			populate: { path: 'pet', select: 'name breed images type size healthStatus owner shelterName' }
		});
		
		if (chat) {
			return res.status(200).json({ success: true, chat, existed: true });
		}
		
		// Create new chat
		chat = new Chat({
			participants,
			adoptionRequest: adoptionRequestId,
			messages: [],
			lastMessage: {
				content: "Chat started",
				timestamp: new Date(),
				sender: userId
			}
		});
		
		await chat.save();
		await chat.populate('participants', 'name email role shelterName');
		await chat.populate({
			path: 'adoptionRequest',
			populate: { path: 'pet', select: 'name breed images type size healthStatus owner shelterName' }
		});

		const socket = getIO();
		if (socket) {
			participants.forEach((participantId) => {
				socket.to(participantId.toString()).emit("chat:new-chat", { chat });
			});
		}
		
		res.status(201).json({ success: true, chat, existed: false });
	} catch (error) {
		console.error("Error creating chat", error);
		res.status(500).json({ success: false, message: "Failed to create chat" });
	}
};

// Send a message
export const sendMessage = async (req, res) => {
	try {
		const { chatId } = req.params;
		const { content } = req.body;
		const userId = req.userId;
		
		const chat = await Chat.findOne({
			_id: chatId,
			participants: userId
		});
		
		if (!chat) {
			return res.status(404).json({ success: false, message: "Chat not found" });
		}
		
		const newMessage = {
			sender: userId,
			content,
			timestamp: new Date(),
			read: false
		};
		
		chat.messages.push(newMessage);
		chat.lastMessage = {
			content,
			timestamp: new Date(),
			sender: userId
		};
		
		await chat.save();
		
		// Populate sender info for response
		await chat.populate('messages.sender', 'name role shelterName');
		const populatedMessage = chat.messages[chat.messages.length - 1];

		const socket = getIO();
		if (socket) {
			chat.participants.forEach((participantId) => {
				socket.to(participantId.toString()).emit("chat:new-message", {
					chatId: chat._id.toString(),
					message: populatedMessage,
					lastMessage: chat.lastMessage,
				});
			});
		}
		
		res.status(201).json({ 
			success: true, 
			message: populatedMessage,
			chat: { _id: chat._id, lastMessage: chat.lastMessage }
		});
	} catch (error) {
		console.error("Error sending message", error);
		res.status(500).json({ success: false, message: "Failed to send message" });
	}
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
	try {
		const { chatId } = req.params;
		const userId = req.userId;
		
		const chat = await Chat.findOne({
			_id: chatId,
			participants: userId
		});
		
		if (!chat) {
			return res.status(404).json({ success: false, message: "Chat not found" });
		}
		
		const readAt = new Date();
		let updatedAny = false;

		// Mark all unread messages from other participants as read
		chat.messages.forEach(message => {
			if (message.sender.toString() !== userId && (!message.read || !message.readBy)) {
				message.read = true;
				message.readAt = message.readAt || readAt;
				message.readBy = message.readBy || userId;
				updatedAny = true;
			}
		});

		if (updatedAny) {
			await chat.save();
			const socket = getIO();
			if (socket) {
				chat.participants.forEach((participantId) => {
					socket.to(participantId.toString()).emit("chat:read", {
						chatId: chat._id.toString(),
						readerId: userId,
						readAt,
					});
				});
			}
		}
		
		res.status(200).json({ success: true, message: "Messages marked as read" });
	} catch (error) {
		console.error("Error marking messages as read", error);
		res.status(500).json({ success: false, message: "Failed to mark messages as read" });
	}
};

// Get unread message count
export const getUnreadCount = async (req, res) => {
	try {
		const userId = req.userId;
		
		const chats = await Chat.find({
			participants: userId
		});
		
		let unreadCount = 0;
		chats.forEach(chat => {
			chat.messages.forEach(message => {
				if (message.sender.toString() !== userId && !message.read) {
					unreadCount++;
				}
			});
		});
		
		res.status(200).json({ success: true, unreadCount });
	} catch (error) {
		console.error("Error getting unread count", error);
		res.status(500).json({ success: false, message: "Failed to get unread count" });
	}
};