import { useEffect, useState } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAdminStore } from "../../store/adminStore";
import { Building2, CheckCircle, XCircle, Clock } from "lucide-react";
import "./AdminShelterApplications.css";

const STATUS_TABS = ["All", "pending", "approved", "rejected"];

const StatusBadge = ({ status }) => {
	const map = {
		pending: { label: "Pending", cls: "status-pending", icon: <Clock size={13} /> },
		approved: { label: "Approved", cls: "status-approved", icon: <CheckCircle size={13} /> },
		rejected: { label: "Rejected", cls: "status-rejected", icon: <XCircle size={13} /> },
	};
	const s = map[status] || map.pending;
	return (
		<span className={`status-badge ${s.cls}`}>
			{s.icon} {s.label}
		</span>
	);
};

const AdminShelterApplications = () => {
	const { shelterApplications, getShelterApplications, approveShelterApplication, rejectShelterApplication, isLoading } =
		useAdminStore();

	const [activeTab, setActiveTab] = useState("All");
	const [rejectModal, setRejectModal] = useState(null); // { id, name }
	const [rejectReason, setRejectReason] = useState("");
	const [actionLoading, setActionLoading] = useState(null);
	const [expandedId, setExpandedId] = useState(null);

	useEffect(() => {
		getShelterApplications();
	}, [getShelterApplications]);

	const filtered =
		activeTab === "All" ? shelterApplications : shelterApplications.filter((a) => a.status === activeTab);

	const counts = {
		All: shelterApplications.length,
		pending: shelterApplications.filter((a) => a.status === "pending").length,
		approved: shelterApplications.filter((a) => a.status === "approved").length,
		rejected: shelterApplications.filter((a) => a.status === "rejected").length,
	};

	const handleApprove = async (id) => {
		setActionLoading(id + "_approve");
		await approveShelterApplication(id);
		setActionLoading(null);
	};

	const openRejectModal = (app) => {
		setRejectModal({ id: app._id, name: app.shelterName || app.applicantName });
		setRejectReason("");
	};

	const handleReject = async () => {
		if (!rejectModal) return;
		setActionLoading(rejectModal.id + "_reject");
		await rejectShelterApplication(rejectModal.id, rejectReason);
		setRejectModal(null);
		setRejectReason("");
		setActionLoading(null);
	};

	return (
		<Motion.div
			className="shelter-applications"
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
		>
			<div className="sa-header">
				<div>
					<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
						<Building2 size={22} color="var(--color-accent)" />
						<h1>Shelter Applications</h1>
					</div>
					<p>Review and manage shelter partnership applications</p>
				</div>
			</div>

			{/* Tab Filters */}
			<div className="sa-tabs">
				{STATUS_TABS.map((tab) => (
					<button
						key={tab}
						className={`sa-tab ${activeTab === tab ? "active" : ""}`}
						onClick={() => setActiveTab(tab)}
					>
						{tab.charAt(0).toUpperCase() + tab.slice(1)}
						<span className="sa-tab-count">{counts[tab]}</span>
					</button>
				))}
			</div>

			{isLoading ? (
				<div className="sa-loading">Loading applications...</div>
			) : filtered.length === 0 ? (
				<div className="sa-empty">
					<Building2 size={40} color="var(--color-text-secondary)" />
					<p>No {activeTab === "All" ? "" : activeTab} applications yet.</p>
				</div>
			) : (
				<div className="sa-list">
					{filtered.map((app) => (
						<div key={app._id} className="sa-card">
							<div className="sa-card-top">
								<div className="sa-avatar">{(app.shelterName || app.applicantName || "?")[0].toUpperCase()}</div>
								<div className="sa-info">
									<p className="sa-shelter-name">{app.shelterName || "—"}</p>
									<p className="sa-applicant">
										{app.applicantName} &bull; {app.email}
									</p>
									{app.shelterPhone && <p className="sa-detail">{app.shelterPhone}</p>}
									{app.shelterAddress && <p className="sa-detail">{app.shelterAddress}</p>}
								</div>
								<div className="sa-card-right">
									<StatusBadge status={app.status} />
									<p className="sa-date">{new Date(app.createdAt).toLocaleDateString()}</p>
								</div>
							</div>

							{app.shelterDescription && (
								<>
									<button
										className="sa-toggle-desc"
										onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}
									>
										{expandedId === app._id ? "Hide description ▲" : "Show description ▼"}
									</button>
									<AnimatePresence>
										{expandedId === app._id && (
											<Motion.p
												className="sa-description"
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												exit={{ opacity: 0, height: 0 }}
												transition={{ duration: 0.2 }}
											>
												{app.shelterDescription}
											</Motion.p>
										)}
									</AnimatePresence>
								</>
							)}

							{app.status === "rejected" && app.rejectionReason && (
								<p className="sa-rejection-note">
									<XCircle size={14} /> Rejection reason: {app.rejectionReason}
								</p>
							)}

							{app.status === "pending" && (
								<div className="sa-actions">
									<button
										className="sa-btn approve"
										disabled={actionLoading === app._id + "_approve"}
										onClick={() => handleApprove(app._id)}
									>
										{actionLoading === app._id + "_approve" ? "Approving..." : "Approve"}
									</button>
									<button
										className="sa-btn reject"
										disabled={actionLoading === app._id + "_reject"}
										onClick={() => openRejectModal(app)}
									>
										Reject
									</button>
								</div>
							)}
						</div>
					))}
				</div>
			)}

			{/* Reject Modal */}
			<AnimatePresence>
				{rejectModal && (
					<Motion.div
						className="sa-modal-overlay"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={() => setRejectModal(null)}
					>
						<Motion.div
							className="sa-modal"
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							onClick={(e) => e.stopPropagation()}
						>
							<h2>Reject Application</h2>
							<p>
								You are rejecting <strong>{rejectModal.name}</strong>. Provide an optional reason:
							</p>
							<textarea
								rows={3}
								placeholder="Reason for rejection (optional)"
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
								className="sa-modal-textarea"
							/>
							<div className="sa-modal-actions">
								<button className="sa-btn reject" onClick={handleReject} disabled={!!actionLoading}>
									{actionLoading ? "Rejecting..." : "Confirm Reject"}
								</button>
								<button className="sa-btn cancel" onClick={() => setRejectModal(null)}>
									Cancel
								</button>
							</div>
						</Motion.div>
					</Motion.div>
				)}
			</AnimatePresence>
		</Motion.div>
	);
};

export default AdminShelterApplications;
