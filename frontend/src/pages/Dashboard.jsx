import { useAuthStore } from "../store/authStore";

const Dashboard = () => {
	const { user } = useAuthStore();

	return (
		<section className="dashboard">
			<div className="panel-header">
				<p className="eyebrow">Welcome</p>
				<h1>Hi {user?.name || user?.email} 👋</h1>
				<p className="muted">You're authenticated. Explore pets, manage your profile, or start fostering.</p>
			</div>
			<div className="card grid">
				<div>
					<h3>Account</h3>
					<p className="muted small">Email: {user?.email}</p>
					<p className="muted small">Verified: {user?.isVerified ? "Yes" : "Pending"}</p>
				</div>
				<div>
					<h3>Next steps</h3>
					<ul className="bullets">
						<li>Complete your profile</li>
						<li>Browse nearby shelters</li>
						<li>Share your foster availability</li>
					</ul>
				</div>
			</div>
		</section>
	);
};

export default Dashboard;
