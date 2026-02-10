import { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useChatStore } from "../store/chatStore";
import { useAuthStore } from "../store/authStore";
import { MessageCircle, Clock } from "lucide-react";

const ChatList = () => {
	const { chats, fetchChats, unreadCount, fetchUnreadCount, isLoading } = useChatStore();
	const { user } = useAuthStore();

	useEffect(() => {
		fetchChats();
		fetchUnreadCount();
	}, [fetchChats, fetchUnreadCount]);

	const formatLastMessageTime = (timestamp) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffTime = Math.abs(now - date);
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 1) {
			return "Today";
		} else if (diffDays === 2) {
			return "Yesterday";
		} else if (diffDays <= 7) {
			return `${diffDays - 1} days ago`;
		} else {
			return date.toLocaleDateString();
		}
	};

	const getOtherParticipant = (chat) => {
		if (!user) return null;
		return chat.participants.find(p => p._id !== user._id);
	};

	const getUnreadMessagesForChat = (chat) => {
		if (!user) return 0;
		return chat.messages?.filter(m => {
			const senderId = m.sender?._id || m.sender;
			return senderId !== user._id && !m.read;
		}).length || 0;
	};

	const formatPreview = (chat) => {
		const last = chat.lastMessage;
		if (!last) return "No messages yet";
		const senderId = last.sender?._id || last.sender;
		const fromYou = senderId === user?._id;
		const prefix = fromYou ? "You: " : "";
		return `${prefix}${last.content}`;
	};

	if (isLoading) {
		return <div className="loader">Loading chats...</div>;
	}

	return (
		<motion.section className="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
			<div className="panel-header">
				<div className="row between">
					<div>
						<p className="eyebrow">Messages</p>
						<h1>Chat</h1>
						<p className="muted">Communicate with shelters and adopters</p>
					</div>
					{unreadCount > 0 && (
						<div className="notification-badge">
							{unreadCount} unread
						</div>
					)}
				</div>
			</div>

			{chats.length === 0 ? (
				<div className="empty-state">
					<div className="empty-content">
						<MessageCircle size={64} color="#9ca3af" />
						<h3>No chats yet</h3>
						<p>Your conversations with shelters and adopters will appear here.</p>
						<Link to="/pets" className="btn btn-primary">Browse Pets</Link>
					</div>
				</div>
			) : (
				<div className="card">
					<div className="chat-list">
						{chats.map((chat) => {
							const otherParticipant = getOtherParticipant(chat);
							const unreadForChat = getUnreadMessagesForChat(chat);
							
							return (
								<Link
									key={chat._id}
									to={`/chat/${chat._id}`}
									className="chat-item"
								>
									<div className="chat-avatar">
										<MessageCircle size={24} />
									</div>
									
									<div className="chat-content">
										<div className="chat-header">
											<h3 className="chat-name">
												{otherParticipant?.role === 'shelter'
													? otherParticipant.shelterName
													: otherParticipant?.name
												}
											</h3>
											<span className="chat-time">
												<Clock size={14} />
												{chat.lastMessage?.timestamp && 
													formatLastMessageTime(chat.lastMessage.timestamp)
												}
											</span>
										</div>
										
										<div className="chat-preview">
											<p className="last-message">
												{formatPreview(chat)}
											</p>
											{unreadForChat > 0 && (
												<span className="unread-count">{unreadForChat}</span>
											)}
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				</div>
			)}
		</motion.section>
	);
};

export default ChatList;