import { create } from "zustand";
import axios from "axios";
import { getSocket, disconnectSocket as baseDisconnectSocket } from "../utils/socketClient";
import { useAuthStore } from "./authStore";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/chat" : "/api/chat";

axios.defaults.withCredentials = true;

export const useChatStore = create((set, get) => ({
	chats: [],
	currentChat: null,
	isLoading: false,
	error: null,
	unreadCount: 0,
	socketInitialized: false,
	typingByChat: {},

	initSocket: () => {
		const { socketInitialized, fetchUnreadCount } = get();
		const currentUserId = useAuthStore.getState().user?._id;
		if (socketInitialized) return;

		const socket = getSocket();

			socket.on("chat:new-message", ({ chatId, message, lastMessage }) => {
			const currentUserIdInner = useAuthStore.getState().user?._id;
			set((state) => {
				const messageId = message?._id;
				const isOwn = message?.sender === currentUserIdInner || message?.sender?._id === currentUserIdInner;
				const chats = state.chats?.length ? [...state.chats] : [];

				// Dedupe in chats list
				const updatedChats = chats.some((c) => c._id === chatId)
					? chats.map((c) => {
						if (c._id !== chatId) return c;
						const existing = (c.messages || []).some((m) => m._id === messageId);
						return existing
							? { ...c, lastMessage }
							: { ...c, lastMessage, messages: [...(c.messages || []), message] };
					})
					: [{ _id: chatId, messages: [message], participants: [], lastMessage }, ...chats];

				let unreadCount = state.unreadCount;
				let currentChat = state.currentChat;

				if (currentChat && currentChat._id === chatId) {
					const alreadyInCurrent = currentChat.messages?.some((m) => m._id === messageId);
					if (!alreadyInCurrent) {
						currentChat = {
							...currentChat,
							messages: [...(currentChat.messages || []), message],
							lastMessage,
						};
					}
				} else if (!isOwn) {
					unreadCount += 1;
				}

				return { chats: updatedChats, currentChat, unreadCount };
			});
			fetchUnreadCount();
		});

		socket.on("chat:new-chat", ({ chat }) => {
			set((state) => {
				const exists = state.chats?.some((c) => c._id === chat._id);
				if (exists) return state;
				return { chats: [chat, ...(state.chats || [])] };
			});
			fetchUnreadCount();
		});

		socket.on("chat:read", ({ chatId, readerId, readAt }) => {
			set((state) => {
				const readTimestamp = readAt ? new Date(readAt) : new Date();
				let nextState = state;
				const updateMessages = (messages = []) => messages.map((msg) => {
					const senderId = typeof msg.sender === "string" ? msg.sender : msg.sender?._id;
					return senderId !== readerId
						? { ...msg, read: true, readAt: msg.readAt || readTimestamp, readBy: readerId }
						: msg;
				});

				if (state.currentChat && state.currentChat._id === chatId) {
					nextState = {
						...nextState,
						currentChat: {
							...state.currentChat,
							messages: updateMessages(state.currentChat.messages),
						},
					};
				}

				if (state.chats?.length) {
					nextState = {
						...nextState,
						chats: state.chats.map((chat) =>
							chat._id === chatId && chat.messages?.length
								? { ...chat, messages: updateMessages(chat.messages) }
								: chat
						),
					};
				}

				return nextState;
			});
		});

			socket.on("chat:typing", ({ chatId, from, isTyping }) => {
				const me = useAuthStore.getState().user?._id;
				if (from === me) return;
				set((state) => ({
					typingByChat: {
						...state.typingByChat,
						[chatId]: isTyping ? from : null,
					},
				}));
			});

		set({ socketInitialized: true });
	},

	disconnectSocket: () => {
		baseDisconnectSocket();
		set({ socketInitialized: false });
	},

	sendTyping: (chatId, participants, isTyping) => {
		const socket = getSocket();
		const to = (participants || []).map((p) => p._id || p).filter(Boolean);
		socket.emit("chat:typing", { chatId, to, isTyping });
	},

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
			const readerId = useAuthStore.getState().user?._id;
			const readAt = new Date();

			// Update current chat
			const { currentChat } = get();
			if (currentChat && currentChat._id === chatId) {
				const updatedMessages = currentChat.messages.map(message => {
					const senderId = typeof message.sender === "string" ? message.sender : message.sender?._id;
					return senderId !== readerId
						? { ...message, read: true, readAt: message.readAt || readAt, readBy: readerId }
						: message;
				});
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