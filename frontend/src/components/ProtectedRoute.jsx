import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, adminOnly = false, shelterOnly = false }) => {
	const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
	const location = useLocation();

	if (isCheckingAuth) {
		return <div className="loader">Checking session…</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	const path = location.pathname;
	const wantsAdmin = adminOnly || path.startsWith('/admin');
	const wantsShelter = shelterOnly || path.startsWith('/shelter');
	const wantsUserDashboard = path === '/dashboard';

	if (wantsAdmin && user?.role !== 'admin') {
		return <Navigate to="/dashboard" replace />;
	}

	if (wantsShelter && user?.role !== 'shelter') {
		return <Navigate to="/dashboard" replace />;
	}

	if (wantsUserDashboard) {
		if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
		if (user?.role === 'shelter') return <Navigate to="/shelter/dashboard" replace />;
	}

	return children;
};

export default ProtectedRoute;
