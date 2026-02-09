import { create } from "zustand";
import axios from "axios";
import { getSocket, disconnectSocket as baseDisconnectSocket } from "../utils/socketClient";
import { useAuthStore } from "./authStore";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/chat" : "/api/chat";

axios.defaults.withCredentials = true;

const normalizeId = (value) => {
	if (!value) return value;
	try { return value.toString(); } catch (e) { return value; }
};

const normalizeSender = (sender) => {
	if (!sender) return sender;
	if (typeof sender === "object") {
		const id = normalizeId(sender._id ?? sender.id ?? sender);
		return { ...sender, _id: id };
	}
	return normalizeId(sender);
};

const normalizeMessage = (message) => {
	if (!message) return message;
	return {
		...message,
		_id: normalizeId(message._id ?? message.id),
		sender: normalizeSender(message.sender),
		readBy: normalizeSender(message.readBy),
	};
};

const normalizeChat = (chat) => {
	if (!chat) return chat;
	return {
		...chat,
		_id: normalizeId(chat._id ?? chat.id),
		participants: (chat.participants || []).map(normalizeSender),
		messages: (chat.messages || []).map(normalizeMessage),
	};
};

const dedupeMessages = (messages = []) => {
	const seen = new Map();
	const result = [];
	messages.forEach((msg) => {
		const id = normalizeId(msg?._id);
		const senderId = typeof msg?.sender === "object" ? msg?.sender?._id : msg?.sender;
		const key = id || `${senderId || ""}-${msg?.timestamp || ""}-${msg?.content || ""}`;
		if (seen.has(key)) return;
		seen.set(key, true);
		result.push(msg);
	});
	return result;
};

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
			const normalizedMessage = normalizeMessage(message);
			const messageId = normalizeId(normalizedMessage?._id);
			const currentUserIdInner = useAuthStore.getState().user?._id;
			const isOwn = normalizedMessage?.sender === currentUserIdInner || normalizedMessage?.sender?._id === currentUserIdInner;
			const normalizedLast = lastMessage ? { ...lastMessage, sender: normalizeSender(lastMessage.sender) } : lastMessage;

			set((state) => {
				const chats = state.chats?.length ? [...state.chats] : [];

				const updatedChats = chats.some((c) => normalizeId(c._id) === chatId)
					? chats.map((c) => {
						if (normalizeId(c._id) !== chatId) return c;
						const mergedMessages = dedupeMessages([...(c.messages || []).map(normalizeMessage), normalizedMessage]);
						return { ...c, lastMessage: normalizedLast, messages: mergedMessages };
					})
					: [{ _id: chatId, messages: dedupeMessages([normalizedMessage]), participants: [], lastMessage: normalizedLast }, ...chats];

				let unreadCount = state.unreadCount;
				let currentChat = state.currentChat;

				if (currentChat && normalizeId(currentChat._id) === chatId) {
					const mergedMessages = dedupeMessages([...(currentChat.messages || []).map(normalizeMessage), normalizedMessage]);
					currentChat = {
						...currentChat,
						messages: mergedMessages,
						lastMessage: normalizedLast,
					};
				} else if (!isOwn) {
					unreadCount += 1;
				}

				return { chats: updatedChats, currentChat, unreadCount };
			});
			fetchUnreadCount();
		});

		socket.on("chat:new-chat", ({ chat }) => {
			set((state) => {
				const normalizedChat = normalizeChat(chat);
				const exists = state.chats?.some((c) => normalizeId(c._id) === normalizeId(normalizedChat._id));
				if (exists) return state;
				return { chats: [normalizedChat, ...(state.chats || [])] };
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

				if (state.currentChat && normalizeId(state.currentChat._id) === normalizeId(chatId)) {
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
							normalizeId(chat._id) === normalizeId(chatId) && chat.messages?.length
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
			const chats = (response.data.chats || []).map(normalizeChat);
			set({ chats, isLoading: false });
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
			const normalized = normalizeChat(response.data.chat);
			set({ currentChat: normalized, isLoading: false });
			return normalized;
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
			const normalizedChat = normalizeChat(response.data.chat);
			set({ currentChat: normalizedChat, isLoading: false });
			
			// Add to chats list if it's a new chat
			if (!response.data.existed) {
				const { chats } = get();
				set({ chats: [normalizedChat, ...chats.map(normalizeChat)] });
			}
			
			return normalizedChat;
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
			const normalizedMessage = normalizeMessage(response.data.message);
			const normalizedChatMeta = response.data.chat?.lastMessage
				? { ...response.data.chat.lastMessage, sender: normalizeSender(response.data.chat.lastMessage.sender) }
				: response.data.chat?.lastMessage;
			
			// Update current chat with new message
			const { currentChat, chats } = get();
			if (currentChat && currentChat._id === chatId) {
				set({
					currentChat: {
						...currentChat,
						messages: dedupeMessages([...(currentChat.messages || []).map(normalizeMessage), normalizedMessage]),
						lastMessage: normalizedChatMeta
					}
				});
			}
			
			// Update chats list with new last message
			const updatedChats = chats.map(chat => 
				chat._id === chatId 
					? { ...chat, lastMessage: normalizedChatMeta }
					: chat
			);
			set({ chats: updatedChats });
			
			return normalizedMessage;
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