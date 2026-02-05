import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { usePetStore } from "../store/petStore";
import { useAdoptionStore } from "../store/adoptionStore";

const Dashboard = () => {
	const { user } = useAuthStore();
	const { stats, fetchStats } = usePetStore();
	const { fetchRequests, requests } = useAdoptionStore();

	useEffect(() => {
		fetchStats();
		fetchRequests();
	}, [fetchStats, fetchRequests]);

	const pendingCount = requests.filter((r) => r.status === "pending").length;
	const approvedCount = requests.filter((r) => r.status === "approved").length;

	return (
		<section className="dashboard">
			<div className="panel-header">
				<p className="eyebrow">Welcome</p>
				<h1>Hi {user?.name || user?.email} 👋</h1>
				<p className="muted">Track your adoptions and discover new friends.</p>
			</div>
			<div className="card grid">
				<div>
					<h3>Available pets</h3>
					<p className="highlight">{stats.totalAvailable ?? 0}</p>
					<p className="muted small">Ready for adoption</p>
				</div>
				<div>
					<h3>Pending requests</h3>
					<p className="highlight">{pendingCount}</p>
					<p className="muted small">Awaiting shelter review</p>
				</div>
				<div>
					<h3>Approved</h3>
					<p className="highlight">{approvedCount}</p>
					<p className="muted small">Next step: schedule visit</p>
				</div>
			</div>
		</section>
	);
};

export default Dashboard;
