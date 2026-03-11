import { Link, useLocation } from "react-router-dom";
import { X, Home, Users, Heart, MessageCircle, User, Settings, PawPrint, FileText, Building2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const Sidebar = ({ isOpen, onClose }) => {
	const { user } = useAuthStore();
	const location = useLocation();
	
	const isShelter = user?.role === "shelter";
	const isAdmin = user?.role === "admin";

	const handleNavClick = () => {
		onClose();
	};

	const getNavItems = () => {
		if (isAdmin) {
			return [
				{
					path: "/admin/dashboard",
					label: "Dashboard",
					icon: <Home size={20} />
				},
				{
					path: "/admin/users",
					label: "User Management",
					icon: <Users size={20} />
				},
				{
					path: "/admin/pets",
					label: "Pet Management",
					icon: <PawPrint size={20} />
				},
				{
					path: "/admin/shelter-applications",
					label: "Shelter Applications",
					icon: <Building2 size={20} />
				},
				{
					path: "/admin/adoptions",
					label: "Adoption Requests",
					icon: <FileText size={20} />
				}
			];
		} else if (isShelter) {
			return [
				{
					path: "/shelter/dashboard",
					label: "Dashboard",
					icon: <Home size={20} />
				},
				{
					path: "/shelter/pets",
					label: "Pet Management",
					icon: <PawPrint size={20} />
				},
				{
					path: "/shelter/requests",
					label: "Adoption Requests",
					icon: <FileText size={20} />
				},
				{
					path: "/shelter/adopted",
					label: "Adopted Pets",
					icon: <Heart size={20} />
				},
				{
					path: "/chat",
					label: "Chat",
					icon: <MessageCircle size={20} />
				},
				{
					path: "/shelter/profile",
					label: "Profile",
					icon: <User size={20} />
				}
			];
		} else {
			return [
				{
					path: "/dashboard",
					label: "Dashboard",
					icon: <Home size={20} />
				},
				{
					path: "/pets",
					label: "Pets",
					icon: <PawPrint size={20} />
				},
				{
					path: "/requests",
					label: "Requests",
					icon: <FileText size={20} />
				},
				{
					path: "/adopted",
					label: "Adopted Pets",
					icon: <Heart size={20} />
				},
				{
					path: "/chat",
					label: "Chat",
					icon: <MessageCircle size={20} />
				},
				{
					path: "/profile",
					label: "Profile",
					icon: <User size={20} />
				}
			];
		}
	};

	const navItems = getNavItems();

	return (
		<>
			{/* Mobile Overlay */}
			{isOpen && <div className="sidebar-overlay" onClick={onClose} />}
			
			{/* Sidebar */}
			<aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
				<div className="sidebar-header">
					<div className="sidebar-brand">
						FurAdopt
					</div>
					<button 
						className="sidebar-close" 
						onClick={onClose}
						aria-label="Close menu"
					>
						<X size={20} />
					</button>
				</div>
				
				<nav className="sidebar-nav">
					{navItems.map((item) => {
						const isActive = item.path === "/chat" 
							? location.pathname.startsWith("/chat")
							: location.pathname === item.path;
							
						return (
							<Link
								key={item.path}
								to={item.path}
								className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
								onClick={handleNavClick}
							>
								{item.icon}
								<span>{item.label}</span>
							</Link>
						);
					})}
				</nav>
			</aside>
		</>
	);
};

export default Sidebar;