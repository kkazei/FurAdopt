import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { useAdoptionStore } from "../store/adoptionStore";
import { MessageCircle, Send, ArrowLeft, Heart } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "../utils/imageUrl";
import "./Chat.css";

const Chat = () => {
	const { chatId } = useParams();
	const [newMessage, setNewMessage] = useState("");
	const [requestLoading, setRequestLoading] = useState(false);
	const [requestDone, setRequestDone] = useState(false);
	const messagesEndRef = useRef(null);
	
	const { 
		currentChat, 
		fetchChatById, 
		sendMessage, 
		markMessagesAsRead,
		sendTyping,
		typingByChat,
		isLoading,
		error 
	} = useChatStore();
	
	const { user } = useAuthStore();
	const { ensureRequestForPet } = useAdoptionStore();

	useEffect(() => {
		if (chatId) {
			fetchChatById(chatId);
		}
	}, [chatId, fetchChatById]);

	useEffect(() => {
		if (currentChat && chatId) {
			markMessagesAsRead(chatId);
		}
	}, [currentChat, chatId, markMessagesAsRead]);

	useEffect(() => {
		if (!currentChat || !user) return;
		const lastMessage = currentChat.messages?.[currentChat.messages.length - 1];
		if (lastMessage && lastMessage.sender._id !== user._id && !lastMessage.read) {
			markMessagesAsRead(chatId);
		}
	}, [currentChat?.messages, user, chatId, markMessagesAsRead, currentChat]);

	useEffect(() => {
		scrollToBottom();
	}, [currentChat?.messages]);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!newMessage.trim()) return;

		try {
			await sendMessage(chatId, newMessage.trim());
			setNewMessage("");
			sendTyping(chatId, currentChat?.participants, false);
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleTyping = (value) => {
		setNewMessage(value);
		if (!currentChat) return;
		sendTyping(chatId, currentChat.participants, Boolean(value));
	};

	const getOtherParticipant = () => {
		if (!currentChat || !user) return null;
		return currentChat.participants.find(p => p._id !== user._id);
	};

	const pet = currentChat?.adoptionRequest?.pet || currentChat?.pet;

	const hasAdoptionRequest = Boolean(currentChat?.adoptionRequest);

	const handleRequestAdoption = async () => {
		if (!pet) return;
		setRequestLoading(true);
		try {
			await ensureRequestForPet(pet._id);
			setRequestDone(true);
		} catch (error) {
			console.error("Failed to request adoption:", error);
		} finally {
			setRequestLoading(false);
		}
	};

	const formatMessageTime = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

		if (messageDate.getTime() === today.getTime()) {
			return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		} else {
			return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
		}
	};

	if (isLoading) {
		return <div className="chat-loading">Loading chat...</div>;
	}

	if (error) {
		return <div className="chat-error">Error: {error}</div>;
	}

	if (!currentChat) {
		return <div className="chat-empty">Chat not found</div>;
	}

	const otherParticipant = getOtherParticipant();
	const typingFrom = typingByChat?.[chatId];
	const showTyping = typingFrom && typingFrom !== user?._id;

	const getStatus = (message) => {
		const senderId = message?.sender?._id || message?.sender;
		const readById = typeof message?.readBy === "string" ? message.readBy : message?.readBy?._id;
		const fromSelf = senderId === user?._id;
		const seen = Boolean(fromSelf && message?.read && readById && readById !== user?._id);
		return {
			fromSelf,
			seen,
			statusText: fromSelf ? (seen ? "Seen" : "Sent") : null,
			timeValue: seen ? (message?.readAt || message?.timestamp) : message?.timestamp,
		};
	};

	return (
		<Motion.div 
			className="chat-container"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -8 }}
			transition={{ duration: 0.2 }}
		>
			<div className="chat-header">
				<button 
					className="back-btn"
					onClick={() => window.history.back()}
				>
					<ArrowLeft size={20} />
				</button>
				<div className="chat-info">
					<h3>
						{otherParticipant?.role === 'shelter' 
							? otherParticipant.shelterName 
							: otherParticipant?.name
						}
					</h3>
					<span className="chat-status">
						{otherParticipant?.role === 'shelter' ? 'Shelter' : 'Adopter'}
					</span>
				</div>
				<MessageCircle size={24} className="chat-icon" />
			</div>

			{pet && (
				<div className="chat-context">
					<div className="chat-context-image">
						{pet.images?.length ? (
							<img src={getImageUrl(pet.images[0])} alt={pet.name || "Pet"} />
						) : (
							<div className="chat-context-placeholder">
								<MessageCircle size={28} />
							</div>
						)}
					</div>
					<div className="chat-context-details">
						<p className="label">Inquiring about</p>
						<h4>{pet.name || "Pet"}</h4>
						<div className="context-tags">
							{pet.type && <span className="chip">{pet.type}</span>}
							{pet.breed && <span className="chip muted">{pet.breed}</span>}
						</div>
					</div>
					{!hasAdoptionRequest && otherParticipant?.role === 'shelter' && (
						<button
							className={`adopt-btn-context ${requestDone ? 'done' : ''}`}
							onClick={handleRequestAdoption}
							disabled={requestLoading || requestDone}
						>
							<Heart size={15} />
							{requestLoading ? "Requesting..." : requestDone ? "Requested ✓" : "Request Adoption"}
						</button>
					)}
				</div>
			)}

			<div className="chat-messages">
				{currentChat.messages.length === 0 ? (
					<div className="no-messages">
						<MessageCircle size={48} />
						<p>Start your conversation about the adoption</p>
					</div>
				) : (
					<AnimatePresence initial={false}>
						{currentChat.messages.map((message, index) => {
							const { fromSelf, seen, statusText, timeValue } = getStatus(message);
							return (
								<Motion.div
									key={message._id || index}
									className={`message ${fromSelf ? 'own' : 'other'}`}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.18 }}
								>
									<Motion.div 
										className="message-content"
										layout
									>
										<p>{message.content}</p>
										<div className="message-meta">
											{statusText && (
												<span className={`message-status ${seen ? 'seen' : 'sent'}`}>
													{statusText}
												</span>
											)}
											<span className="message-time">
												{formatMessageTime(timeValue)}
											</span>
										</div>
									</Motion.div>
								</Motion.div>
							);
						})}
					</AnimatePresence>
				)}
				<div ref={messagesEndRef} />
				{showTyping && (
					<div className="typing-indicator">
						<div className="typing-dot" />
						<div className="typing-dot" />
						<div className="typing-dot" />
					</div>
				)}
			</div>

			<form className="chat-input" onSubmit={handleSendMessage}>
				<input
					type="text"
					value={newMessage}
					onChange={(e) => handleTyping(e.target.value)}
					placeholder="Type your message..."
					className="message-input"
				/>
				<button type="submit" className="send-btn" disabled={!newMessage.trim()}>
					<Send size={20} />
				</button>
			</form>
		</Motion.div>
	);
};

export default Chat;