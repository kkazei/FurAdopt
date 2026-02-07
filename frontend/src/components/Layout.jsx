import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Layout = ({ children, isCheckingAuth }) => {
	const { isAuthenticated, user, logout, isLoading } = useAuthStore();
	const location = useLocation();
	const navigate = useNavigate();
	const isLanding = location.pathname === "/";

	const showAuthLinks = ["/login", "/signup", "/forgot-password", "/verify"].includes(
		location.pathname
	);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/login");
		} catch (error) {
			// Silently fail to avoid blocking UI; errors are handled in store.
		}
	};

	if (isLanding) {
		return <div className="landing-shell">{children}</div>;
	}

	return (
		<div className="app-shell">
			<header className="topbar">
				<div className="brand" onClick={() => navigate(isAuthenticated ? "/dashboard" : "/")}>FurAdopt</div>
				<nav className="nav-actions">
					{isAuthenticated ? (
						<>
							<span className="user-chip">{user?.name || user?.email}</span>
							<button className="ghost" onClick={handleLogout} disabled={isLoading}>
								Logout
							</button>
						</>
					) : showAuthLinks ? (
						<>
							<Link to="/login">Login</Link>
							<Link className="pill" to="/signup">
								Create account
							</Link>
						</>
					) : null}
				</nav>
			</header>
			{isAuthenticated && (
				<nav className="subnav">
					<Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
						Dashboard
					</Link>
					<Link to="/pets" className={location.pathname === "/pets" ? "active" : ""}>
						Pets
					</Link>
					<Link to="/requests" className={location.pathname === "/requests" ? "active" : ""}>
						Requests
					</Link>
					<Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>
						Profile
					</Link>
				</nav>
			)}
			<main className="content" aria-busy={isCheckingAuth}>{children}</main>
		</div>
	);
};

export default Layout;
