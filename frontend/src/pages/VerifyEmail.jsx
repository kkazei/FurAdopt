import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";

const VerifyEmail = () => {
	const { verifyEmail, isLoading, error } = useAuthStore();
	const [code, setCode] = useState("");
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const result = await verifyEmail(code);
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
		<motion.section className="auth-panel narrow"
			initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
		>
			<div className="panel-header">
				<p className="eyebrow">Step 2</p>
				<h1>Verify your email</h1>
				<p className="muted">Enter the 6-digit code we just sent you.</p>
			</div>
			<form className="card" onSubmit={handleSubmit}>
				<div className="field">
					<label htmlFor="code">Verification code</label>
					<input
						id="code"
						name="code"
						type="text"
						inputMode="numeric"
						pattern="[0-9]{6}"
						required
						placeholder="123456"
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>
				</div>
				{error && <p className="error">{error}</p>}
				<button className="primary" type="submit" disabled={isLoading}>
					{isLoading ? "Verifying..." : "Verify"}
				</button>
			</form>
		</motion.section>
	);
};

export default VerifyEmail;
