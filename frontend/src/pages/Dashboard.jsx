import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePetStore } from "../store/petStore";
import { useAdoptionStore } from "../store/adoptionStore";

const Dashboard = () => {
	const { user } = useAuthStore();
	const { stats, fetchStats, pets, fetchPets } = usePetStore();
	const { fetchRequests, requests } = useAdoptionStore();

	// Redirect shelter users to their dashboard
	if (user?.role === "shelter") {
		return <Navigate to="/shelter/dashboard" replace />;
	}

	useEffect(() => {
		fetchStats();
		fetchRequests();
		fetchPets();
	}, [fetchStats, fetchRequests, fetchPets]);

	const pendingCount = requests.filter((r) => r.status === "pending").length;
	const approvedCount = requests.filter((r) => r.status === "approved").length;
	const featuredPets = pets.slice(0, 3);

	return (
		<section className="dashboard">
			<div className="card dash-hero">
				<div>
					<p className="eyebrow">Welcome back</p>
					<h1>Hi {user?.name || user?.email}</h1>
					<p className="muted">Track your adoptions and meet new friends waiting for home.</p>
					<div className="row gap-sm">
						<Link className="btn btn-primary" to="/pets">Browse pets</Link>
						<Link className="btn btn-secondary" to="/requests">View requests</Link>							<Link className="btn btn-secondary" to="/adopted">My pets</Link>
							<Link className="btn btn-secondary" to="/chat">Chat</Link>					</div>
				</div>
				<div className="stat-row">
					<div className="stat-tile">
						<p className="stat-label">Available pets</p>
						<p className="highlight">{stats.totalAvailable ?? 0}</p>
						<p className="muted small">Ready for adoption</p>
					</div>
					<div className="stat-tile">
						<p className="stat-label">Pending requests</p>
						<p className="highlight">{pendingCount}</p>
						<p className="muted small">Awaiting review</p>
					</div>
					<div className="stat-tile">
						<p className="stat-label">Approved</p>
						<p className="highlight">{approvedCount}</p>
						<p className="muted small">Schedule your visit</p>
					</div>
				</div>
			</div>

			<div className="card featured-card">
				<div className="row between">
					<div>
						<p className="eyebrow">Quick picks</p>
						<h3>Pets you can meet today</h3>
					</div>
					<Link className="ghost" to="/pets">See all pets</Link>
				</div>
				<div className="pet-grid featured">
					{featuredPets.length === 0 && <p className="muted">No pets available yet.</p>}
					{featuredPets.map((pet) => (
						<div key={pet._id} className="pet-card showcase">
							<div className="pet-pill-row">
								<span className="pill subtle">{pet.size}</span>
								<span className="pill subtle">{pet.type}</span>
							</div>
							<h4>{pet.breed}</h4>
							<p className="muted small clamp">{pet.description}</p>
							<div className="row between">
								<p className="muted small">Health: {pet.healthStatus}</p>
								<Link className="btn btn-secondary" to="/pets">
									Open profile
								</Link>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default Dashboard;
