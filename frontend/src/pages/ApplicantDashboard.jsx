import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Building2, Clock, CheckCircle, XCircle, LogOut } from "lucide-react";

const STATUS_CONFIG = {
	pending: {
		icon: <Clock size={52} color="#d97706" />,
		title: "Application Under Review",
		message:
			"Your shelter application has been received and is currently being reviewed by our admin team. We'll notify you once a decision has been made.",
		cls: "status-pending",
	},
	approved: {
		icon: <CheckCircle size={52} color="#16a34a" />,
		title: "Application Approved!",
		message:
			"Congratulations! Your shelter account has been created. You can now log in using your email and password to access the full shelter dashboard.",
		cls: "status-approved",
	},
	rejected: {
		icon: <XCircle size={52} color="#dc2626" />,
		title: "Application Not Approved",
		message: "Unfortunately your application was not approved at this time.",
		cls: "status-rejected",
	},
};

const ApplicantDashboard = () => {
	const { isApplicant, application, clearApplicantSession } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isApplicant || !application) {
			navigate("/login", { replace: true });
		}
	}, [isApplicant, application, navigate]);

	if (!isApplicant || !application) return null;

	const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.pending;

	const handleLogout = () => {
		clearApplicantSession();
		navigate("/login");
	};

	const handleGoLogin = () => {
		clearApplicantSession();
		navigate("/login");
	};

	return (
		<Motion.section
			className="auth-panel"
			style={{ maxWidth: 560 }}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
		>
			<div className="panel-header">
				<div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
					<Building2 size={22} color="var(--color-accent)" />
					<p className="eyebrow" style={{ margin: 0 }}>Shelter Application</p>
				</div>
				<h1>Application Status</h1>
				<p className="muted">Track the progress of your shelter partnership request.</p>
			</div>

			<div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
				{/* Status hero */}
				<div style={{ textAlign: "center", padding: "1rem 0 0.5rem" }}>
					{config.icon}
					<h2 style={{ marginTop: "0.75rem", fontSize: "1.25rem", fontWeight: 800 }}>{config.title}</h2>
					<p className="muted" style={{ marginTop: "0.4rem" }}>{config.message}</p>
					{application.status === "rejected" && application.rejectionReason && (
						<div
							style={{
								marginTop: "0.75rem",
								background: "#fee2e2",
								border: "1px solid #fecaca",
								borderRadius: "var(--radius-sm)",
								padding: "0.75rem 1rem",
								color: "#7f1d1d",
								fontSize: "0.875rem",
								textAlign: "left",
							}}
						>
							<strong>Reason:</strong> {application.rejectionReason}
						</div>
					)}
				</div>

				{/* Application details */}
				<div
					style={{
						background: "var(--color-bg-secondary)",
						borderRadius: "var(--radius-sm)",
						padding: "1rem",
						display: "flex",
						flexDirection: "column",
						gap: "0.5rem",
						fontSize: "0.875rem",
					}}
				>
					<p style={{ margin: 0 }}>
						<span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>Shelter: </span>
						{application.shelterName}
					</p>
					<p style={{ margin: 0 }}>
						<span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>Applicant: </span>
						{application.applicantName}
					</p>
					{application.shelterAddress && (
						<p style={{ margin: 0 }}>
							<span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>Address: </span>
							{application.shelterAddress}
						</p>
					)}
					{application.shelterPhone && (
						<p style={{ margin: 0 }}>
							<span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>Phone: </span>
							{application.shelterPhone}
						</p>
					)}
					<p style={{ margin: 0 }}>
						<span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>Submitted: </span>
						{new Date(application.createdAt).toLocaleDateString("en-PH", {
							year: "numeric",
							month: "long",
							day: "numeric",
						})}
					</p>
					{application.reviewedAt && (
						<p style={{ margin: 0 }}>
							<span style={{ color: "var(--color-text-secondary)", fontWeight: 600 }}>Reviewed: </span>
							{new Date(application.reviewedAt).toLocaleDateString("en-PH", {
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</p>
					)}
				</div>

				{/* Actions */}
				{application.status === "approved" ? (
					<button className="primary" onClick={handleGoLogin}>
						Go to Login →
					</button>
				) : (
					<button
						onClick={handleLogout}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "0.5rem",
							background: "none",
							border: "1px solid var(--color-border)",
							borderRadius: "var(--radius-sm)",
							padding: "0.75rem",
							cursor: "pointer",
							fontSize: "0.9375rem",
							color: "var(--color-text)",
							fontFamily: "inherit",
							fontWeight: 600,
						}}
					>
						<LogOut size={16} /> Sign out
					</button>
				)}
			</div>
		</Motion.section>
	);
};

export default ApplicantDashboard;
