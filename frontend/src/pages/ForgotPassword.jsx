import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const ForgotPassword = () => {
	const { forgotPassword, isLoading, error, message } = useAuthStore();
	const [email, setEmail] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await forgotPassword(email);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<motion.section className="auth-panel narrow"
			initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
		>
			<div className="panel-header">
				<p className="eyebrow">Reset access</p>
				<h1>Forgot password</h1>
				<p className="muted">Enter your email to receive a reset link.</p>
			</div>
			<form className="card" onSubmit={handleSubmit}>
				<div className="field">
					<label htmlFor="email">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
				{error && <p className="error">{error}</p>}
				{message && <p className="success">{message}</p>}
				<button className="primary" type="submit" disabled={isLoading}>
					{isLoading ? "Sending..." : "Send reset link"}
				</button>
				<p className="muted center">
					Remembered it? <Link to="/login">Back to login</Link>
				</p>
			</form>
		</motion.section>
	);
};

export default ForgotPassword;
