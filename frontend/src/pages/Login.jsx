import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import InstallPrompt from "../components/InstallPrompt";

const Login = () => {
	const navigate = useNavigate();
	const { login, isLoading, error } = useAuthStore();
	const [form, setForm] = useState({ email: "", password: "" });

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const result = await login(form.email, form.password);
			// Redirect based on user role
			if (result?.user?.role === "shelter") {
				navigate("/shelter/dashboard");
			} else {
				navigate("/dashboard");
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<motion.section
			className="auth-panel"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="panel-header">
				<p className="eyebrow">Welcome back</p>
				<h1>Log in to continue</h1>
				<p className="muted">Pick up where you left off with your adoptions.</p>
			</div>
			<InstallPrompt />
			<form className="card" onSubmit={handleSubmit}>
				<div className="field">
					<label htmlFor="email">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						placeholder="you@example.com"
						value={form.email}
						onChange={handleChange}
					/>
				</div>
				<div className="field">
					<label htmlFor="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						placeholder="••••••••"
						value={form.password}
						onChange={handleChange}
					/>
				</div>
				{error && <p className="error">{error}</p>}
				<button type="submit" disabled={isLoading} className="primary">
					{isLoading ? "Signing in..." : "Sign in"}
				</button>
				<div className="row between">
					<Link to="/signup">Create account</Link>
					<Link to="/forgot-password">Forgot password?</Link>
				</div>
			</form>
		</motion.section>
	);
};

export default Login;
