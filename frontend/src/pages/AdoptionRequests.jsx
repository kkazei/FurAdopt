import { useEffect } from "react";
import { useAdoptionStore } from "../store/adoptionStore";

const statusColors = {
	pending: "pill subtle",
	approved: "pill positive",
	rejected: "pill danger",
};

const AdoptionRequests = () => {
	const { requests, fetchRequests, isLoading, error } = useAdoptionStore();

	useEffect(() => {
		fetchRequests();
	}, [fetchRequests]);

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
						<div key={req._id} className="request-row">
							<div>
								<p className="muted small">{new Date(req.createdAt).toLocaleDateString()}</p>
								<h4>{req.pet?.breed}</h4>
								<p className="muted small">Type: {req.pet?.type}</p>
							</div>
							<span className={statusColors[req.status] || "pill subtle"}>{req.status}</span>
						</div>
					))}
				</div>
				{isLoading && <p className="muted">Loading...</p>}
			</div>
		</section>
	);
};

export default AdoptionRequests;
