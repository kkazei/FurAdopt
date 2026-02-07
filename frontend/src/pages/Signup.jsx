import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Signup = () => {
	const navigate = useNavigate();
	const { signup, isLoading, error } = useAuthStore();
	const [role, setRole] = useState("user");
	const [form, setForm] = useState({ 
		name: "", 
		email: "", 
		password: "",
		shelterName: "",
		shelterAddress: "",
		shelterPhone: "",
		shelterDescription: ""
	});

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleRoleSwitch = (newRole) => {
		setRole(newRole);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (role === "shelter") {
				await signup(
					form.email, 
					form.password, 
					null, 
					role, 
					form.shelterName,
					form.shelterAddress,
					form.shelterPhone,
					form.shelterDescription
				);
			} else {
				await signup(form.email, form.password, form.name, role);
			}
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
				<p className="muted">Adopt, foster, or support pets with a verified profile.</p>
			</div>
			
			{/* Role Toggle */}
			<div className="role-toggle" style={{ marginBottom: "1.5rem", textAlign: "center" }}>
				<div style={{ 
					display: "inline-flex", 
					gap: "0.5rem", 
					background: "#f5f5f5", 
					padding: "0.25rem", 
					borderRadius: "8px" 
				}}>
					<button
						type="button"
						onClick={() => handleRoleSwitch("user")}
						style={{
							padding: "0.5rem 1.5rem",
							border: "none",
							borderRadius: "6px",
							background: role === "user" ? "#4f46e5" : "transparent",
							color: role === "user" ? "white" : "#666",
							cursor: "pointer",
							fontWeight: role === "user" ? "600" : "400",
							transition: "all 0.2s"
						}}
					>
						User
					</button>
					<button
						type="button"
						onClick={() => handleRoleSwitch("shelter")}
						style={{
							padding: "0.5rem 1.5rem",
							border: "none",
							borderRadius: "6px",
							background: role === "shelter" ? "#4f46e5" : "transparent",
							color: role === "shelter" ? "white" : "#666",
							cursor: "pointer",
							fontWeight: role === "shelter" ? "600" : "400",
							transition: "all 0.2s"
						}}
					>
						Shelter
					</button>
				</div>
			</div>

			<form className="card" onSubmit={handleSubmit}>
				{role === "user" ? (
					<>
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
					</>
				) : (
					<>
						<div className="field">
							<label htmlFor="shelterName">Shelter Name</label>
							<input
								id="shelterName"
								name="shelterName"
								type="text"
								required
								placeholder="Happy Paws Shelter"
								value={form.shelterName}
								onChange={handleChange}
							/>
						</div>
						<div className="field">
							<label htmlFor="email">Shelter Email</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								placeholder="contact@shelter.com"
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
						<div className="field">
							<label htmlFor="shelterAddress">Address (Optional)</label>
							<input
								id="shelterAddress"
								name="shelterAddress"
								type="text"
								placeholder="123 Main Street, City, State"
								value={form.shelterAddress}
								onChange={handleChange}
							/>
						</div>
						<div className="field">
							<label htmlFor="shelterPhone">Phone (Optional)</label>
							<input
								id="shelterPhone"
								name="shelterPhone"
								type="tel"
								placeholder="(555) 123-4567"
								value={form.shelterPhone}
								onChange={handleChange}
							/>
						</div>
						<div className="field">
							<label htmlFor="shelterDescription">Description (Optional)</label>
							<textarea
								id="shelterDescription"
								name="shelterDescription"
								rows="3"
								placeholder="Tell us about your shelter..."
								value={form.shelterDescription}
								onChange={handleChange}
								style={{ resize: "vertical" }}
							/>
						</div>
					</>
				)}
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
