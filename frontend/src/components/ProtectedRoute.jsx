import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, isCheckingAuth } = useAuthStore();

	if (isCheckingAuth) {
		return <div className="loader">Checking session…</div>;
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	return children;
};

export default ProtectedRoute;
