import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import "./Chat.css";

const Chat = () => {
	const { chatId } = useParams();
	const [newMessage, setNewMessage] = useState("");
	const messagesEndRef = useRef(null);
	
	const { 
		currentChat, 
		fetchChatById, 
		sendMessage, 
		markMessagesAsRead,
		isLoading,
		error 
	} = useChatStore();
	
	const { user } = useAuthStore();

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
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const getOtherParticipant = () => {
		if (!currentChat || !user) return null;
		return currentChat.participants.find(p => p._id !== user._id);
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

	return (
		<div className="chat-container">
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

			<div className="chat-messages">
				{currentChat.messages.length === 0 ? (
					<div className="no-messages">
						<MessageCircle size={48} />
						<p>Start your conversation about the adoption</p>
					</div>
				) : (
					currentChat.messages.map((message, index) => (
						<div
							key={index}
							className={`message ${message.sender._id === user._id ? 'own' : 'other'}`}
						>
							<div className="message-content">
								<p>{message.content}</p>
								<span className="message-time">
									{formatMessageTime(message.timestamp)}
								</span>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			<form className="chat-input" onSubmit={handleSendMessage}>
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Type your message..."
					className="message-input"
				/>
				<button type="submit" className="send-btn" disabled={!newMessage.trim()}>
					<Send size={20} />
				</button>
			</form>
		</div>
	);
};

export default Chat;