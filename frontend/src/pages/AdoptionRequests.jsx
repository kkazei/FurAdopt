import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdoptionStore } from "../store/adoptionStore";
import { useChatStore } from "../store/chatStore";
import { MessageCircle } from "lucide-react";

const statusColors = {
	pending: "pill subtle",
	approved: "pill positive",
	rejected: "pill danger",
};

const AdoptionRequests = () => {
	const navigate = useNavigate();
	const { requests, fetchRequests, isLoading, error } = useAdoptionStore();
	const { createOrGetChat } = useChatStore();
	const [chatLoading, setChatLoading] = useState(null);

	useEffect(() => {
		fetchRequests();
	}, [fetchRequests]);

	const handleStartChat = async (request) => {
		setChatLoading(request._id);
		try {
			const chat = await createOrGetChat(request._id);
			navigate(`/chat/${chat._id}`);
		} catch (error) {
			console.error("Error creating chat:", error);
			alert("Failed to start chat. Please try again.");
		} finally {
			setChatLoading(null);
		}
	};

	return (
		<section className="dashboard">
			<div className="panel-header">
				<p className="eyebrow">Your progress</p>
				<h1>Adoption requests</h1>
				<p className="muted">Track pending, approved, or rejected requests.</p>
			</div>
			<div className="card">
				{error && <p className="error">{error}</p>}
				{requests.length === 0 && !isLoading && <p className="muted">No requests yet.</p>}
				<div className="request-list">
					{requests.map((req) => (
						<div key={req._id} className="request-row enhanced">
							<div className="request-info">
								<p className="muted small">{new Date(req.createdAt).toLocaleDateString()}</p>
								<h4>{req.pet?.name || req.pet?.breed}</h4>
								<p className="breed-info">{req.pet?.breed} • {req.pet?.type} • {req.pet?.age} {req.pet?.age === 1 ? 'year' : 'years'}</p>
								<p className="muted small">Size: {req.pet?.size} • Health: {req.pet?.healthStatus}</p>
								{req.pet?.petFriendly && <span className="trait-tag">🐾 Pet Friendly</span>}
								{req.pet?.childFriendly && <span className="trait-tag">👶 Child Friendly</span>}
								{req.visitDate && req.status === 'approved' && (
									<p className="visit-date">Visit scheduled: {new Date(req.visitDate).toLocaleDateString()}</p>
								)}
							</div>
							<div className="request-actions">
								<span className={statusColors[req.status] || "pill subtle"}>{req.status}</span>
								{req.status === 'pending' && (
									<button
										className="btn-chat-small"
										onClick={() => handleStartChat(req)}
										disabled={chatLoading === req._id}
									>
										<MessageCircle size={14} />
										{chatLoading === req._id ? "Starting..." : "Chat"}
									</button>
								)}
							</div>
						</div>
					))}
				</div>
				{isLoading && <p className="muted">Loading...</p>}
			</div>
		</section>
	);
};

export default AdoptionRequests;
