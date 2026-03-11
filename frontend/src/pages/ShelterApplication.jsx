import { useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import axios from "axios";
import { Building2, CheckCircle } from "lucide-react";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

const ShelterApplication = () => {
	const [form, setForm] = useState({
		applicantName: "",
		email: "",
		password: "",
		shelterName: "",
		shelterAddress: "",
		shelterPhone: "",
		shelterDescription: "",
	});
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);
		try {
			await axios.post(`${API_URL}/apply-shelter`, form, { withCredentials: false });
			setSubmitted(true);
		} catch (err) {
			setError(err.response?.data?.message || "Failed to submit application. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	if (submitted) {
		return (
			<Motion.section
				className="auth-panel"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				<div className="panel-header">
					<CheckCircle size={48} color="#16a34a" style={{ marginBottom: "1rem" }} />
					<h1>Application Submitted!</h1>
					<p className="muted">
						Thank you for applying. Our admin team will review your shelter application and
						get back to you. Once approved, you can log in with your email and password.
					</p>
				</div>
				<div className="card" style={{ textAlign: "center" }}>
					<Link to="/login" className="primary" style={{ display: "inline-block", padding: "0.75rem 2rem" }}>
						Back to Login
					</Link>
				</div>
			</Motion.section>
		);
	}

	return (
		<Motion.section
			className="auth-panel"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="panel-header">
				<div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
					<Building2 size={28} color="var(--color-accent)" />
					<p className="eyebrow" style={{ margin: 0 }}>Partner with us</p>
				</div>
				<h1>Shelter Application</h1>
				<p className="muted">Fill in your details to apply as a shelter partner. Admin will review and approve your application.</p>
			</div>

			<form className="card" onSubmit={handleSubmit}>
				<p className="eyebrow" style={{ marginBottom: "0.5rem" }}>Your Information</p>

				<div className="field">
					<label htmlFor="applicantName">Full Name</label>
					<input
						id="applicantName"
						name="applicantName"
						type="text"
						required
						placeholder="Juan Dela Cruz"
						value={form.applicantName}
						onChange={handleChange}
					/>
				</div>

				<div className="field">
					<label htmlFor="email">Email Address</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						placeholder="shelter@example.com"
						value={form.email}
						onChange={handleChange}
					/>
				</div>

				<div className="field">
					<label htmlFor="password">Password (for your future shelter account)</label>
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

				<p className="eyebrow" style={{ marginTop: "1rem", marginBottom: "0.5rem" }}>Shelter Information</p>

				<div className="field">
					<label htmlFor="shelterName">Shelter Name</label>
					<input
						id="shelterName"
						name="shelterName"
						type="text"
						required
						placeholder="Paws &amp; Claws Shelter"
						value={form.shelterName}
						onChange={handleChange}
					/>
				</div>

				<div className="field">
					<label htmlFor="shelterAddress">Address</label>
					<input
						id="shelterAddress"
						name="shelterAddress"
						type="text"
						placeholder="123 Main St, City, Province"
						value={form.shelterAddress}
						onChange={handleChange}
					/>
				</div>

				<div className="field">
					<label htmlFor="shelterPhone">Phone Number</label>
					<input
						id="shelterPhone"
						name="shelterPhone"
						type="tel"
						placeholder="+63 912 345 6789"
						value={form.shelterPhone}
						onChange={handleChange}
					/>
				</div>

				<div className="field">
					<label htmlFor="shelterDescription">About your shelter</label>
					<textarea
						id="shelterDescription"
						name="shelterDescription"
						rows={4}
						maxLength={1000}
						placeholder="Tell us about your shelter, how many animals you care for, your mission, etc."
						value={form.shelterDescription}
						onChange={handleChange}
						style={{ resize: "vertical" }}
					/>
				</div>

				{error && <p className="error">{error}</p>}

				<button type="submit" disabled={isLoading} className="primary">
					{isLoading ? "Submitting..." : "Submit Application"}
				</button>

				<p className="muted center" style={{ marginTop: "0.5rem" }}>
					Already have an account? <Link to="/login">Login</Link>
				</p>
			</form>
		</Motion.section>
	);
};

export default ShelterApplication;
