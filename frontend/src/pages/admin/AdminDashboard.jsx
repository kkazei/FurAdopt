import { useEffect } from "react";
import { useAdminStore } from "../../store/adminStore";
import "./AdminDashboard.css";

const AdminDashboard = () => {
	const { stats, getDashboardStats, isLoading, error } = useAdminStore();

	useEffect(() => {
		getDashboardStats();
	}, [getDashboardStats]);

	if (isLoading) {
		return <div className="loader">Loading dashboard...</div>;
	}

	if (error) {
		return <div className="error">Error: {error}</div>;
	}

	return (
		<div className="admin-dashboard">
			<div className="admin-header">
				<h1>Admin Dashboard</h1>
				<p>Welcome to the FurAdopt Administration Panel</p>
			</div>

			<div className="stats-grid">
				<div className="stat-card">
					<div className="stat-icon">👥</div>
					<div className="stat-info">
						<h3>Total Users</h3>
						<p className="stat-number">{stats.totalUsers}</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">🏠</div>
					<div className="stat-info">
						<h3>Total Shelters</h3>
						<p className="stat-number">{stats.totalShelters}</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">🐕</div>
					<div className="stat-info">
						<h3>Total Pets</h3>
						<p className="stat-number">{stats.totalPets}</p>
					</div>
				</div>

				<div className="stat-card">
					<div className="stat-icon">❤️</div>
					<div className="stat-info">
						<h3>Total Adoptions</h3>
						<p className="stat-number">{stats.totalAdoptions}</p>
					</div>
				</div>
			</div>

			<div className="admin-actions">
				<div className="action-section">
					<h2>Quick Actions</h2>
					<div className="action-buttons">
						<button 
							className="action-btn users"
							onClick={() => window.location.href = '/admin/users'}
						>
							<span>👥</span>
							Manage Users
						</button>
						<button 
							className="action-btn pets"
							onClick={() => window.location.href = '/admin/pets'}
						>
							<span>🐕</span>
							Manage Pets
						</button>
						<button 
							className="action-btn requests"
							onClick={() => window.location.href = '/admin/adoptions'}
						>
							<span>📋</span>
							Adoption Requests
						</button>
						<button 
							className="action-btn shelters"
							onClick={() => window.location.href = '/admin/users'}
						>
							<span>🏠</span>
							Manage Shelters
						</button>
					</div>
				</div>
			</div>

			<div className="recent-activity">
				<h2>System Overview</h2>
				<div className="overview-grid">
					<div className="overview-item">
						<h4>User Management</h4>
						<p>Manage user accounts, roles, and permissions</p>
					</div>
					<div className="overview-item">
						<h4>Pet Management</h4>
						<p>Oversee pet listings and shelter management</p>
					</div>
					<div className="overview-item">
						<h4>Adoption Oversight</h4>
						<p>Monitor adoption requests and success rates</p>
					</div>
					<div className="overview-item">
						<h4>System Health</h4>
						<p>Monitor platform usage and performance</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;