import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ResetPassword = () => {
	const { resetPassword, isLoading, error, message } = useAuthStore();
	const [password, setPassword] = useState("");
	const { token } = useParams();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await resetPassword(token, password);
			setPassword("");
			setTimeout(() => navigate("/login"), 600);
		} catch (_) {
			// handled in store
		}
	};

	return (
		<section className="auth-panel narrow">
			<div className="panel-header">
				<p className="eyebrow">Create a new password</p>
				<h1>Reset password</h1>
				<p className="muted">Use at least 6 characters for a stronger account.</p>
			</div>
			<form className="card" onSubmit={handleSubmit}>
				<div className="field">
					<label htmlFor="password">New password</label>
					<input
						id="password"
						name="password"
						type="password"
						minLength={6}
						required
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				{error && <p className="error">{error}</p>}
				{message && <p className="success">{message}</p>}
				<button className="primary" type="submit" disabled={isLoading}>
					{isLoading ? "Updating..." : "Update password"}
				</button>
			</form>
		</section>
	);
};

export default ResetPassword;
