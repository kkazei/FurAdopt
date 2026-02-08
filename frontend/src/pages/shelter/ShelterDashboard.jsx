import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useShelterStore } from "../../store/shelterStore";
import { PawPrint, CheckCircle, Clock, TrendingUp, Calendar } from "lucide-react";
import "./ShelterDashboard.css";

const ShelterDashboard = () => {
	const { user } = useAuthStore();
	const { pets, stats, fetchMyPets, fetchShelterStats } = useShelterStore();
	const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

	useEffect(() => {
		fetchMyPets();
		fetchShelterStats({ period: selectedPeriod });
	}, [fetchMyPets, fetchShelterStats, selectedPeriod]);

	const handlePeriodChange = (period) => {
		setSelectedPeriod(period);
		fetchShelterStats({ period });
	};

	const totalPets = stats.totalPets || pets.length;
	const availablePets = stats.availablePets || pets.filter(p => p.status === "available").length;
	const adoptedPets = stats.adoptedPets || pets.filter(p => p.status === "adopted").length;
	const adoptionsInPeriod = stats.adoptionsInPeriod || 0;
	const successRate = stats.successRate || (totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0);
	const recentPets = pets.slice(0, 5);

	return (
		<div className="shelter-dashboard">
			<div className="dashboard-header">
				<div>
					<h1>Shelter Dashboard</h1>
					<p className="muted">Welcome back, {user?.shelterName}!</p>
				</div>
				<div className="period-selector">
					<select 
						value={selectedPeriod} 
						onChange={(e) => handlePeriodChange(e.target.value)}
						className="period-select"
					>
						<option value="thisMonth">This Month</option>
						<option value="lastMonth">Last Month</option>
						<option value="last30Days">Last 30 Days</option>
						<option value="last7Days">Last 7 Days</option>
					</select>
				</div>
			</div>

			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon" style={{ background: "#eff6ff" }}>
						<PawPrint size={24} color="#2563eb" />
					</div>
					<div className="stat-content">
						<p className="stat-label">Total Pets</p>
						<p className="stat-value">{totalPets}</p>
						<p className="stat-sub">All pets in system</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon" style={{ background: "#d1fae5" }}>
						<CheckCircle size={24} color="#059669" />
					</div>
					<div className="stat-content">
						<p className="stat-label">Available</p>
						<p className="stat-value">{availablePets}</p>
						<p className="stat-sub">Ready for adoption</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon" style={{ background: "#fef3c7" }}>
						<Calendar size={24} color="#d97706" />
					</div>
					<div className="stat-content">
						<p className="stat-label">Adopted ({selectedPeriod.replace(/([A-Z])/g, ' $1').toLowerCase()})</p>
						<p className="stat-value">{adoptionsInPeriod}</p>
						<p className="stat-sub">In selected period</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon" style={{ background: "#fce7f3" }}>
						<TrendingUp size={24} color="#db2777" />
					</div>
					<div className="stat-content">
						<p className="stat-label">Success Rate</p>
						<p className="stat-value">{successRate}%</p>
						<p className="stat-sub">Overall adoption rate</p>
					</div>
				</div>
			</div>

			<div className="dashboard-section">
				<div className="section-header">
					<h2>Recent Pets</h2>
					<Link to="/shelter/pets" className="view-all">View all →</Link>
				</div>

				{recentPets.length > 0 ? (
					<div className="recent-pets-list">
						{recentPets.map((pet) => (
							<div key={pet._id} className="recent-pet-item">
								<div className="pet-info">
									<h3>{pet.name}</h3>
									<p className="muted">{pet.breed} • {pet.age} {pet.age === 1 ? 'year' : 'years'} • {pet.size}</p>
								</div>
								<span className={`status-badge ${pet.status}`}>
									{pet.status === "available" ? "Available" : "Adopted"}
								</span>
							</div>
						))}
					</div>
				) : (
					<div className="empty-message">
						<p>No pets added yet. <Link to="/shelter/pets">Add your first pet →</Link></p>
					</div>
				)}
			</div>

			<div className="dashboard-actions">
				<Link to="/shelter/pets" className="action-card">
					<h3>Manage Pets</h3>
					<p>Add, edit, or remove pets from your shelter</p>
				</Link>
				<Link to="/chat" className="action-card">
					<h3>Chat with Adopters</h3>
					<p>Communicate with potential pet adopters</p>
				</Link>
				<Link to="/shelter/profile" className="action-card">
					<h3>Update Profile</h3>
					<p>Keep your shelter information current</p>
				</Link>
			</div>
		</div>
	);
};

export default ShelterDashboard;
