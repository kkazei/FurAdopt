import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Login = () => {
	const navigate = useNavigate();
	const { login, isLoading, error } = useAuthStore();
	const [form, setForm] = useState({ email: "", password: "" });

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await login(form.email, form.password);
			navigate("/dashboard");
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<section className="auth-panel">
			<div className="panel-header">
				<p className="eyebrow">Welcome back</p>
				<h1>Log in to continue</h1>
				<p className="muted">Pick up where you left off with your adoptions.</p>
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
		</section>
	);
};

export default Login;
