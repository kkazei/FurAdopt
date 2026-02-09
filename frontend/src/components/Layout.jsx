import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import NotificationPrompt from "./NotificationPrompt";
import Sidebar from "./Sidebar";
import "./Sidebar.css";

const Layout = ({ children, isCheckingAuth }) => {
	const { isAuthenticated, user, logout, isLoading } = useAuthStore();
	const location = useLocation();
	const navigate = useNavigate();
	const isLanding = location.pathname === "/";
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const showAuthLinks = ["/login", "/signup", "/forgot-password", "/verify"].includes(
		location.pathname
	);

	const handleLogout = async () => {
		try {
			await logout();
			setMobileMenuOpen(false);
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
				<div className="topbar-left">
					{isAuthenticated && (
						<button 
							className="mobile-menu-toggle" 
							onClick={() => setMobileMenuOpen(true)}
							aria-label="Open menu"
						>
							<Menu size={24} />
						</button>
					)}
					<div className="brand" onClick={() => { navigate(isAuthenticated ? dashboardPath : "/"); }}>FurAdopt</div>
				</div>
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
			{isAuthenticated && <NotificationPrompt />}
			<div className="layout-container">
				{isAuthenticated && (
					<Sidebar 
						isOpen={mobileMenuOpen} 
						onClose={() => setMobileMenuOpen(false)} 
					/>
				)}
				<main className="content" aria-busy={isCheckingAuth}>{children}</main>
			</div>
		</div>
	);
};

export default Layout;
