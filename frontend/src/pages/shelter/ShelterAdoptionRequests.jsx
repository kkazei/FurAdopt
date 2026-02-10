import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useShelterAdoptionStore } from "../../store/shelterAdoptionStore";
import { useChatStore } from "../../store/chatStore";
import { User, Calendar, CheckCircle, XCircle, Clock, MapPin, Mail, MessageCircle } from "lucide-react";
import "./ShelterAdoptionRequests.css";

const ShelterAdoptionRequests = () => {
	const navigate = useNavigate();
	const { requests, isLoading, error, fetchShelterRequests, updateRequestStatus, clearError } =
		useShelterAdoptionStore();
	const { createOrGetChat } = useChatStore();
	const [activeTab, setActiveTab] = useState("pending");
	const [selectedRequest, setSelectedRequest] = useState(null);
	const [visitDate, setVisitDate] = useState("");
	const [chatLoading, setChatLoading] = useState(null);

	useEffect(() => {
		fetchShelterRequests();
	}, [fetchShelterRequests]);

	const filteredRequests = requests.filter((req) => req.status === activeTab);
	const pendingCount = requests.filter((r) => r.status === "pending").length;
	const approvedCount = requests.filter((r) => r.status === "approved").length;
	const rejectedCount = requests.filter((r) => r.status === "rejected").length;

	const handleApprove = async (requestId) => {
		if (!visitDate) {
			alert("Please select a visit date");
			return;
		}
		try {
			await updateRequestStatus(requestId, "approved", visitDate);
			setSelectedRequest(null);
			setVisitDate("");
		} catch (error) {
			console.error("Error approving request:", error);
		}
	};

	const handleReject = async (requestId) => {
		if (window.confirm("Are you sure you want to reject this adoption request?")) {
			try {
				await updateRequestStatus(requestId, "rejected");
				setSelectedRequest(null);
			} catch (error) {
				console.error("Error rejecting request:", error);
			}
		}
	};

	const openReviewModal = (request) => {
		setSelectedRequest(request);
		setVisitDate("");
	};

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
		<motion.div className="shelter-adoption-requests"
			initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
		>
			<div className="section-header">
				<div>
					<h2>Adoption Requests</h2>
					<p className="muted">Review and manage adoption requests from potential adopters</p>
				</div>
			</div>

			{error && (
				<div className="alert alert-error">
					{error}
					<button onClick={clearError} className="alert-close">
						×
					</button>
				</div>
			)}

			<div className="tabs-container">
				<button
					className={`tab-button ${activeTab === "pending" ? "active" : ""}`}
					onClick={() => setActiveTab("pending")}
				>
					<Clock size={18} />
					Pending ({pendingCount})
				</button>
				<button
					className={`tab-button ${activeTab === "approved" ? "active" : ""}`}
					onClick={() => setActiveTab("approved")}
				>
					<CheckCircle size={18} />
					Approved ({approvedCount})
				</button>
				<button
					className={`tab-button ${activeTab === "rejected" ? "active" : ""}`}
					onClick={() => setActiveTab("rejected")}
				>
					<XCircle size={18} />
					Rejected ({rejectedCount})
				</button>
			</div>

			{isLoading && requests.length === 0 ? (
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading requests...</p>
				</div>
			) : filteredRequests.length === 0 ? (
				<div className="empty-state">
					<Clock size={64} className="empty-icon" />
					<h3>No {activeTab} requests</h3>
					<p>You don't have any {activeTab} adoption requests at the moment</p>
				</div>
			) : (
				<div className="requests-list">
					{filteredRequests.map((request) => (
						<div key={request._id} className="request-card">
							<div className="request-header">
								<div className="pet-info">
									<h3>{request.pet?.name}</h3>
									<p className="muted">
										{request.pet?.breed} • {request.pet?.age} years • {request.pet?.type}
									</p>
								</div>
								<span className={`status-badge ${request.status}`}>
									{request.status}
								</span>
							</div>

							<div className="adopter-info">
								<div className="info-row">
									<User size={18} className="info-icon" />
									<div>
										<label>Adopter</label>
										<p>{request.user?.name}</p>
									</div>
								</div>

								<div className="info-row">
									<Mail size={18} className="info-icon" />
									<div>
										<label>Email</label>
										<p>{request.user?.email}</p>
									</div>
								</div>

								{request.user?.location && (
									<div className="info-row">
										<MapPin size={18} className="info-icon" />
										<div>
											<label>Location</label>
											<p>{request.user.location}</p>
										</div>
									</div>
								)}

								{request.user?.age && (
									<div className="info-row">
										<User size={18} className="info-icon" />
										<div>
											<label>Age</label>
											<p>{request.user.age} years</p>
										</div>
									</div>
								)}

								{request.user?.bio && (
									<div className="bio-section">
										<label>About the Adopter</label>
										<p>{request.user.bio}</p>
									</div>
								)}

								{request.note && (
									<div className="note-section">
										<label>Adoption Note</label>
										<p>{request.note}</p>
									</div>
								)}

								{request.visitDate && (
									<div className="info-row">
										<Calendar size={18} className="info-icon" />
										<div>
											<label>Visit Date</label>
											<p>{new Date(request.visitDate).toLocaleDateString()}</p>
										</div>
									</div>
								)}
							</div>

							{request.status === "pending" && (
								<div className="request-actions">
									<button
										className="btn-review"
										onClick={() => openReviewModal(request)}
									>
										Review Details
									</button>
								<button
									className="btn-chat"
									onClick={() => handleStartChat(request)}
									disabled={chatLoading === request._id}
								>
									<MessageCircle size={16} />
									{chatLoading === request._id ? "Starting..." : "Start Chat"}
								</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{selectedRequest && (
				<div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
					<div className="review-modal" onClick={(e) => e.stopPropagation()}>
						<h3>Review Adoption Request</h3>
						<div className="modal-content">
							<div className="review-pet-info">
								<h4>{selectedRequest.pet?.name}</h4>
								<p>{selectedRequest.pet?.breed}</p>
							</div>

							<div className="review-adopter-info">
								<h4>Adopter: {selectedRequest.user?.name}</h4>
								<p>Email: {selectedRequest.user?.email}</p>
								{selectedRequest.user?.location && <p>Location: {selectedRequest.user.location}</p>}
								{selectedRequest.user?.bio && (
									<div className="bio-box">
										<strong>About:</strong>
										<p>{selectedRequest.user.bio}</p>
									</div>
								)}
							</div>

							<div className="visit-date-section">
								<label htmlFor="visitDate">Schedule Visit Date *</label>
								<input
									id="visitDate"
									type="date"
									value={visitDate}
									onChange={(e) => setVisitDate(e.target.value)}
									min={new Date().toISOString().split('T')[0]}
								/>
							</div>
						</div>

						<div className="modal-actions">
							<button
								className="btn-secondary"
								onClick={() => setSelectedRequest(null)}
							>
								Cancel
							</button>
							<button
								className="btn-reject"
								onClick={() => handleReject(selectedRequest._id)}
								disabled={isLoading}
							>
								Reject
							</button>
							<button
								className="btn-approve"
								onClick={() => handleApprove(selectedRequest._id)}
								disabled={isLoading || !visitDate}
							>
								{isLoading ? "Approving..." : "Approve"}
							</button>
						</div>
					</div>
				</div>
			)}
		</motion.div>
	);
};

export default ShelterAdoptionRequests;
