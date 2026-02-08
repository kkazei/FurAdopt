import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, adminOnly = false }) => {
	const { isAuthenticated, isCheckingAuth, user } = useAuthStore();
	const location = useLocation();

	if (isCheckingAuth) {
		return <div className="loader">Checking session…</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// Check for admin-only routes
	if (location.pathname.startsWith('/admin')) {
		if (user?.role !== 'admin') {
			return <Navigate to="/dashboard" replace />;
		}
	}

	// Check for shelter-only routes
	if (location.pathname.startsWith('/shelter')) {
		if (user?.role !== 'shelter') {
			return <Navigate to="/dashboard" replace />;
		}
	}

	return children;
};

export default ProtectedRoute;
