import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShelterAdoptionStore } from "../../store/shelterAdoptionStore";
import { useChatStore } from "../../store/chatStore";
import { User, Calendar, CheckCircle, XCircle, Clock, MapPin, Mail, MessageCircle } from "lucide-react";
import "./ShelterAdoptionRequests.css";

const TABS = [
	{ key: "pending", label: "Schedule Requests", icon: <Clock size={16} /> },
	{ key: "visit_scheduled", label: "Visit Scheduled", icon: <Calendar size={16} /> },
	{ key: "approved", label: "Approved", icon: <CheckCircle size={16} /> },
	{ key: "rejected", label: "Rejected", icon: <XCircle size={16} /> },
];

const ShelterAdoptionRequests = () => {
	const navigate = useNavigate();
	const { requests, isLoading, error, fetchShelterRequests, updateRequestStatus, scheduleVisit, clearError } =
		useShelterAdoptionStore();
	const { createOrGetChat } = useChatStore();
	const [activeTab, setActiveTab] = useState("pending");
	const [scheduleModal, setScheduleModal] = useState(null); // request object
	const [visitDate, setVisitDate] = useState("");
	const [chatLoading, setChatLoading] = useState(null);
	const [actionLoading, setActionLoading] = useState(null);

	useEffect(() => {
		fetchShelterRequests();
	}, [fetchShelterRequests]);

	const counts = {
		pending: requests.filter((r) => r.status === "pending").length,
		visit_scheduled: requests.filter((r) => r.status === "visit_scheduled").length,
		approved: requests.filter((r) => r.status === "approved").length,
		rejected: requests.filter((r) => r.status === "rejected").length,
	};

	const filteredRequests = requests.filter((req) => req.status === activeTab);

	const handleSetVisitDate = async () => {
		if (!visitDate || !scheduleModal) return;
		setActionLoading(scheduleModal._id + "_schedule");
		try {
			await scheduleVisit(scheduleModal._id, visitDate);
			setScheduleModal(null);
			setVisitDate("");
		} catch (err) {
			console.error("Error scheduling visit:", err);
		} finally {
			setActionLoading(null);
		}
	};

	const handleApprove = async (requestId) => {
		if (!window.confirm("Confirm adoption approval? This will mark the pet as adopted.")) return;
		setActionLoading(requestId + "_approve");
		try {
			await updateRequestStatus(requestId, "approved");
		} catch (err) {
			console.error("Error approving:", err);
		} finally {
			setActionLoading(null);
		}
	};

	const handleReject = async (requestId) => {
		if (!window.confirm("Are you sure you want to reject this request?")) return;
		setActionLoading(requestId + "_reject");
		try {
			await updateRequestStatus(requestId, "rejected");
		} catch (err) {
			console.error("Error rejecting:", err);
		} finally {
			setActionLoading(null);
		}
	};

	const handleStartChat = async (request) => {
		setChatLoading(request._id);
		try {
			const chat = await createOrGetChat(request._id);
			navigate(`/chat/${chat._id}`);
		} catch (err) {
			console.error("Error creating chat:", err);
			alert("Failed to start chat. Please try again.");
		} finally {
			setChatLoading(null);
		}
	};

	return (
		<div className="shelter-adoption-requests">
			<div className="section-header">
				<div>
					<h2>Adoption Requests</h2>
					<p className="muted">Review schedule requests, set visit dates, then approve after meeting the adopter.</p>
				</div>
			</div>

			{error && (
				<div className="alert alert-error">
					{error}
					<button onClick={clearError} className="alert-close">×</button>
				</div>
			)}

			<div className="tabs-container">
				{TABS.map((tab) => (
					<button
						key={tab.key}
						className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
						onClick={() => setActiveTab(tab.key)}
					>
						{tab.icon}
						{tab.label}
						<span className="tab-count">{counts[tab.key]}</span>
					</button>
				))}
			</div>

			{isLoading && requests.length === 0 ? (
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading requests...</p>
				</div>
			) : filteredRequests.length === 0 ? (
				<div className="empty-state">
					<Clock size={64} className="empty-icon" />
					<h3>No {TABS.find((t) => t.key === activeTab)?.label.toLowerCase()} yet</h3>
					<p>Nothing here at the moment.</p>
				</div>
			) : (
				<div className="requests-list">
					{filteredRequests.map((request) => (
						<div key={request._id} className="request-card">
							<div className="request-header">
								<div className="pet-info">
									<div className="pet-info-text">
										<h3>{request.pet?.name}</h3>
										<p className="pet-breed muted">
											{request.pet?.breed} &bull; {request.pet?.type}
										</p>
									</div>
								</div>
								<span className={`status-badge ${request.status === "visit_scheduled" ? "reviewing" : request.status}`}>
									{request.status === "visit_scheduled" ? "Visit Scheduled" : request.status}
								</span>
							</div>

							<div className="adopter-info">
								<div className="info-grid">
									<div className="info-row">
										<User size={16} />
										<span>{request.user?.name}</span>
									</div>
									<div className="info-row">
										<Mail size={16} />
										<span>{request.user?.email}</span>
									</div>
									{request.user?.location && (
										<div className="info-row">
											<MapPin size={16} />
											<span>{request.user.location}</span>
										</div>
									)}
									{request.visitDate && (
										<div className="info-row">
											<Calendar size={16} />
											<span>
												Visit: <strong>{new Date(request.visitDate).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</strong>
											</span>
										</div>
									)}
								</div>
								{request.user?.bio && (
									<div className="bio-section" style={{ marginTop: "0.75rem" }}>
										<h4>About the Adopter</h4>
										<p>{request.user.bio}</p>
									</div>
								)}
							</div>

							<div className="request-actions">
								{/* Pending: set visit date or reject */}
								{request.status === "pending" && (
									<>
										<button
											className="btn-review"
											onClick={() => { setScheduleModal(request); setVisitDate(""); }}
										>
											<Calendar size={15} /> Set Visit Date
										</button>
										<button
											className="btn-chat"
											onClick={() => handleStartChat(request)}
											disabled={chatLoading === request._id}
										>
											<MessageCircle size={15} />
											{chatLoading === request._id ? "Starting..." : "Chat"}
										</button>
										<button
											className="btn-reject"
											onClick={() => handleReject(request._id)}
											disabled={actionLoading === request._id + "_reject"}
										>
											<XCircle size={15} />
											{actionLoading === request._id + "_reject" ? "Rejecting..." : "Reject"}
										</button>
									</>
								)}

								{/* Visit Scheduled: approve after visit or reject */}
								{request.status === "visit_scheduled" && (
									<>
										<button
											className="btn-approve"
											onClick={() => handleApprove(request._id)}
											disabled={actionLoading === request._id + "_approve"}
										>
											<CheckCircle size={15} />
											{actionLoading === request._id + "_approve" ? "Approving..." : "Approve Adoption"}
										</button>
										<button
											className="btn-chat"
											onClick={() => handleStartChat(request)}
											disabled={chatLoading === request._id}
										>
											<MessageCircle size={15} />
											{chatLoading === request._id ? "Starting..." : "Chat"}
										</button>
										<button
											className="btn-reject"
											onClick={() => handleReject(request._id)}
											disabled={actionLoading === request._id + "_reject"}
										>
											<XCircle size={15} />
											{actionLoading === request._id + "_reject" ? "Rejecting..." : "Reject"}
										</button>
									</>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Schedule Visit Modal */}
			{scheduleModal && (
				<div className="modal-overlay" onClick={() => setScheduleModal(null)}>
					<div className="review-modal" onClick={(e) => e.stopPropagation()}>
						<h3>Set Visit Date</h3>
						<div className="modal-content">
							<div className="review-pet-info">
								<h4>{scheduleModal.pet?.name}</h4>
								<p>{scheduleModal.pet?.breed}</p>
							</div>
							<div className="review-adopter-info">
								<h4>Adopter: {scheduleModal.user?.name}</h4>
								<p>Email: {scheduleModal.user?.email}</p>
							</div>
							<div className="visit-date-section">
								<label htmlFor="visitDate">Visit Date *</label>
								<input
									id="visitDate"
									type="date"
									value={visitDate}
									onChange={(e) => setVisitDate(e.target.value)}
									min={new Date().toISOString().split("T")[0]}
								/>
							</div>
						</div>
						<div className="modal-actions">
							<button className="btn-secondary" onClick={() => setScheduleModal(null)}>Cancel</button>
							<button
								className="btn-approve"
								onClick={handleSetVisitDate}
								disabled={!visitDate || !!actionLoading}
							>
								{actionLoading ? "Scheduling..." : "Confirm Visit Date"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ShelterAdoptionRequests;
