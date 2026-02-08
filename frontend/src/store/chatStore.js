import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/chat" : "/api/chat";

axios.defaults.withCredentials = true;

export const useChatStore = create((set, get) => ({
	chats: [],
	currentChat: null,
	isLoading: false,
	error: null,
	unreadCount: 0,

	// Fetch all chats for current user
	fetchChats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(API_URL);
			set({ chats: response.data.chats, isLoading: false });
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Failed to fetch chats", 
				isLoading: false 
			});
		}
	},

	// Fetch specific chat by ID
	fetchChatById: async (chatId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/${chatId}`);
			set({ currentChat: response.data.chat, isLoading: false });
			return response.data.chat;
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Failed to fetch chat", 
				isLoading: false 
			});
			throw error;
		}
	},

	// Create or get existing chat for adoption request
	createOrGetChat: async (adoptionRequestId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/create`, { 
				adoptionRequestId 
			});
			set({ currentChat: response.data.chat, isLoading: false });
			
			// Add to chats list if it's a new chat
			if (!response.data.existed) {
				const { chats } = get();
				set({ chats: [response.data.chat, ...chats] });
			}
			
			return response.data.chat;
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Failed to create chat", 
				isLoading: false 
			});
			throw error;
		}
	},

	// Send message to chat
	sendMessage: async (chatId, content) => {
		try {
			const response = await axios.post(`${API_URL}/${chatId}/messages`, { 
				content 
			});
			
			// Update current chat with new message
			const { currentChat, chats } = get();
			if (currentChat && currentChat._id === chatId) {
				set({
					currentChat: {
						...currentChat,
						messages: [...currentChat.messages, response.data.message],
						lastMessage: response.data.chat.lastMessage
					}
				});
			}
			
			// Update chats list with new last message
			const updatedChats = chats.map(chat => 
				chat._id === chatId 
					? { ...chat, lastMessage: response.data.chat.lastMessage }
					: chat
			);
			set({ chats: updatedChats });
			
			return response.data.message;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to send message" });
			throw error;
		}
	},

	// Mark messages as read
	markMessagesAsRead: async (chatId) => {
		try {
			await axios.put(`${API_URL}/${chatId}/read`);
			
			// Update current chat
			const { currentChat } = get();
			if (currentChat && currentChat._id === chatId) {
				const updatedMessages = currentChat.messages.map(message => ({
					...message,
					read: true
				}));
				set({
					currentChat: {
						...currentChat,
						messages: updatedMessages
					}
				});
			}
			
			// Refresh unread count
			get().fetchUnreadCount();
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to mark messages as read" });
		}
	},

	// Get unread message count
	fetchUnreadCount: async () => {
		try {
			const response = await axios.get(`${API_URL}/unread-count`);
			set({ unreadCount: response.data.unreadCount });
		} catch (error) {
			console.error("Failed to fetch unread count:", error);
		}
	},

	// Clear current chat
	clearCurrentChat: () => {
		set({ currentChat: null });
	},

	// Clear error
	clearError: () => {
		set({ error: null });
	}
}));