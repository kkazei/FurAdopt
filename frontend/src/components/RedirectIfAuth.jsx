import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const RedirectIfAuth = ({ children }) => {
	const { isAuthenticated, isCheckingAuth, user } = useAuthStore();

	if (isCheckingAuth) return null;
	if (isAuthenticated) {
		if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
		if (user?.role === "shelter") return <Navigate to="/shelter/dashboard" replace />;
		return <Navigate to="/dashboard" replace />;
	}

	return children;
};

export default RedirectIfAuth;
