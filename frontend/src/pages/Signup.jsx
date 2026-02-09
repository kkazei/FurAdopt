import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Signup = () => {
	const navigate = useNavigate();
	const { signup, isLoading, error } = useAuthStore();
	const [form, setForm] = useState({ 
		name: "", 
		email: "", 
		password: ""
	});

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await signup(form.email, form.password, form.name);
			navigate("/verify");
		} catch (error) {
			// surfaced via store state; log for dev visibility
			console.error(error);
		}
	};

	return (
		<section className="auth-panel">
			<div className="panel-header">
				<p className="eyebrow">Join the community</p>
				<h1>Create your account</h1>
				<p className="muted">Adopt, foster, or support pets in need of a loving home.</p>
			</div>

			<form className="card" onSubmit={handleSubmit}>
				<div className="field">
					<label htmlFor="name">Name</label>
					<input
						id="name"
						name="name"
						type="text"
						required
						placeholder="Alex Doe"
						value={form.name}
						onChange={handleChange}
					/>
				</div>
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
						minLength={6}
						placeholder="••••••••"
						value={form.password}
						onChange={handleChange}
					/>
				</div>
				{error && <p className="error">{error}</p>}
				<button type="submit" disabled={isLoading} className="primary">
					{isLoading ? "Creating..." : "Create account"}
				</button>
				<p className="muted center">
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</section>
	);
};

export default Signup;
