import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Layout = ({ children, isCheckingAuth }) => {
	const { isAuthenticated, user, logout, isLoading } = useAuthStore();
	const location = useLocation();
	const navigate = useNavigate();

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
			<main className="content" aria-busy={isCheckingAuth}>{children}</main>
		</div>
	);
};

export default Layout;
