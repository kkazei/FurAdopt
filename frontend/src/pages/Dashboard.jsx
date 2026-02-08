import { useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Heart } from "lucide-react";
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
		<section className="dashboard compact">
			<div className="card dash-hero compact">
				<div className="hero-content">
					<div className="welcome-text">
						<p className="eyebrow">Welcome back</p>
						<h1>Hi {user?.name || user?.email}</h1>
						<p className="muted">Track your adoptions and meet new friends waiting for home.</p>
					</div>
					<div className="stat-row compact">
						<div className="stat-tile">
							<div className="stat-number">{stats.totalAvailable ?? 0}</div>
							<p className="stat-label">Available pets</p>
						</div>
						<div className="stat-tile">
							<div className="stat-number">{pendingCount}</div>
							<p className="stat-label">Pending requests</p>
						</div>
						<div className="stat-tile">
							<div className="stat-number">{approvedCount}</div>
							<p className="stat-label">Approved</p>
						</div>
					</div>
				</div>
			</div>

			<div className="card featured-card compact">
				<div className="section-header">
					<h3>Featured pets</h3>
					<Link className="btn ghost small" to="/pets">View all</Link>
				</div>
				<div className="pet-grid featured compact">
					{featuredPets.length === 0 ? (
						<p className="muted">No pets available yet.</p>
					) : (
						featuredPets.map((pet) => (
							<div key={pet._id} className="pet-card showcase compact">
								<div className="pet-image">
									{pet.images && pet.images.length > 0 ? (
										<img src={`http://localhost:5000${pet.images[0]}`} alt={pet.name || pet.breed} />
									) : (
										<div className="pet-placeholder">
											<Heart size={24} />
										</div>
									)}
								</div>
								<div className="pet-content">
									<div className="pet-header">
										<h4>{pet.name || pet.breed}</h4>
										<div className="pet-pills">
											<span className="pill small">{pet.size}</span>
											<span className="pill small">{pet.type}</span>
										</div>
									</div>
									<button className="btn primary small">Adopt</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</section>
	);
};

export default Dashboard;
