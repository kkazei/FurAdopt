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

	const isShelter = user?.role === "shelter";
	const isAdmin = user?.role === "admin";
	const dashboardPath = isAdmin ? "/admin/dashboard" : isShelter ? "/shelter/dashboard" : "/dashboard";

	if (isLanding) {
		return <div className="landing-shell">{children}</div>;
	}

	return (
		<div className="app-shell">
			<header className="topbar">
				<div className="brand" onClick={() => navigate(isAuthenticated ? dashboardPath : "/")}>FurAdopt</div>
				<nav className="nav-actions">
					{isAuthenticated ? (
						<>
							<span className="user-chip">{user?.shelterName || user?.name || user?.email}</span>
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
					{isAdmin ? (
						<>
							<Link to="/admin/dashboard" className={location.pathname === "/admin/dashboard" ? "active" : ""}>
								Dashboard
							</Link>
							<Link to="/admin/users" className={location.pathname === "/admin/users" ? "active" : ""}>
								User Management
							</Link>
							<Link to="/admin/pets" className={location.pathname === "/admin/pets" ? "active" : ""}>
								Pet Management
							</Link>
							<Link to="/admin/adoptions" className={location.pathname === "/admin/adoptions" ? "active" : ""}>
								Adoption Requests
							</Link>
						</>
					) : isShelter ? (
						<>
							<Link to="/shelter/dashboard" className={location.pathname === "/shelter/dashboard" ? "active" : ""}>
								Dashboard
							</Link>
							<Link to="/shelter/pets" className={location.pathname === "/shelter/pets" ? "active" : ""}>
								Pet Management
							</Link>
							<Link to="/shelter/requests" className={location.pathname === "/shelter/requests" ? "active" : ""}>
								Adoption Requests
							</Link>
							<Link to="/shelter/adopted" className={location.pathname === "/shelter/adopted" ? "active" : ""}>
								Adopted Pets
							</Link>
							<Link to="/chat" className={location.pathname.startsWith("/chat") ? "active" : ""}>
								Chat
							</Link>
							<Link to="/shelter/profile" className={location.pathname === "/shelter/profile" ? "active" : ""}>
								Profile
							</Link>
						</>
					) : (
						<>
							<Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""}>
								Dashboard
							</Link>
							<Link to="/pets" className={location.pathname === "/pets" ? "active" : ""}>
								Pets
							</Link>
							<Link to="/requests" className={location.pathname === "/requests" ? "active" : ""}>
								Requests
							</Link>						<Link to="/adopted" className={location.pathname === "/adopted" ? "active" : ""}>
							Adopted Pets
						</Link>
						<Link to="/chat" className={location.pathname.startsWith("/chat") ? "active" : ""}>
							Chat
						</Link>							<Link to="/profile" className={location.pathname === "/profile" ? "active" : ""}>
								Profile
							</Link>
						</>
					)}
				</nav>
			)}
			<main className="content" aria-busy={isCheckingAuth}>{children}</main>
		</div>
	);
};

export default Layout;
