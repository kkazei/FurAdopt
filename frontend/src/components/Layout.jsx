import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import NotificationPrompt from "./NotificationPrompt";

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

	const handleNavClick = () => {
		setMobileMenuOpen(false);
	};

	if (isLanding) {
		return <div className="landing-shell">{children}</div>;
	}

	return (
		<div className="app-shell">
			<header className="topbar">
				<div className="brand" onClick={() => { navigate(isAuthenticated ? dashboardPath : "/"); setMobileMenuOpen(false); }}>FurAdopt</div>
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
				{isAuthenticated && (
					<button 
						className="mobile-menu-toggle" 
						onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				)}
			</header>
			{isAuthenticated && <NotificationPrompt />}
			{isAuthenticated && (
				<nav className={`subnav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
					{isAdmin ? (
						<>
							<Link to="/admin/dashboard" className={location.pathname === "/admin/dashboard" ? "active" : ""} onClick={handleNavClick}>
								Dashboard
							</Link>
							<Link to="/admin/users" className={location.pathname === "/admin/users" ? "active" : ""} onClick={handleNavClick}>
								User Management
							</Link>
							<Link to="/admin/pets" className={location.pathname === "/admin/pets" ? "active" : ""} onClick={handleNavClick}>
								Pet Management
							</Link>
							<Link to="/admin/adoptions" className={location.pathname === "/admin/adoptions" ? "active" : ""} onClick={handleNavClick}>
								Adoption Requests
							</Link>
						</>
					) : isShelter ? (
						<>
							<Link to="/shelter/dashboard" className={location.pathname === "/shelter/dashboard" ? "active" : ""} onClick={handleNavClick}>
								Dashboard
							</Link>
							<Link to="/shelter/pets" className={location.pathname === "/shelter/pets" ? "active" : ""} onClick={handleNavClick}>
								Pet Management
							</Link>
							<Link to="/shelter/requests" className={location.pathname === "/shelter/requests" ? "active" : ""} onClick={handleNavClick}>
								Adoption Requests
							</Link>
							<Link to="/shelter/adopted" className={location.pathname === "/shelter/adopted" ? "active" : ""} onClick={handleNavClick}>
								Adopted Pets
							</Link>
							<Link to="/chat" className={location.pathname.startsWith("/chat") ? "active" : ""} onClick={handleNavClick}>
								Chat
							</Link>
							<Link to="/shelter/profile" className={location.pathname === "/shelter/profile" ? "active" : ""} onClick={handleNavClick}>
								Profile
							</Link>
						</>
					) : (
						<>
							<Link to="/dashboard" className={location.pathname === "/dashboard" ? "active" : ""} onClick={handleNavClick}>
								Dashboard
							</Link>
							<Link to="/pets" className={location.pathname === "/pets" ? "active" : ""} onClick={handleNavClick}>
								Pets
							</Link>
							<Link to="/requests" className={location.pathname === "/requests" ? "active" : ""} onClick={handleNavClick}>
								Requests
							</Link>
							<Link to="/adopted" className={location.pathname === "/adopted" ? "active" : ""} onClick={handleNavClick}>
								Adopted Pets
							</Link>
							<Link to="/chat" className={location.pathname.startsWith("/chat") ? "active" : ""} onClick={handleNavClick}>
								Chat
							</Link>
							<Link to="/profile" className={location.pathname === "/profile" ? "active" : ""} onClick={handleNavClick}>
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
