import { useEffect, useState } from "react";
import { useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";

const Profile = () => {
	const { profile, fetchProfile, updateProfile, isLoading, error, message } = useProfileStore();
	const { user } = useAuthStore();
	const [form, setForm] = useState({ name: "", location: "", age: "", bio: "" });

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	useEffect(() => {
		if (profile) {
			setForm({
				name: profile.name || "",
				location: profile.location || "",
				age: profile.age || "",
				bio: profile.bio || "",
			});
		}
	}, [profile]);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await updateProfile({ ...form, age: form.age ? Number(form.age) : undefined });
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<section className="dashboard">
			<div className="panel-header">
				<p className="eyebrow">Your profile</p>
				<h1>Keep your info current</h1>
				<p className="muted">Share a short bio to help shelters know you better.</p>
			</div>
			<form className="card" onSubmit={handleSubmit}>
				<div className="field">
					<label htmlFor="name">Name</label>
					<input id="name" name="name" value={form.name} onChange={handleChange} required />
				</div>
				<div className="field">
					<label htmlFor="location">Location</label>
					<input id="location" name="location" value={form.location} onChange={handleChange} placeholder="City, Country" />
				</div>
				<div className="field">
					<label htmlFor="age">Age</label>
					<input id="age" name="age" type="number" min="0" value={form.age} onChange={handleChange} />
				</div>
				<div className="field">
					<label htmlFor="bio">Bio</label>
					<textarea
						id="bio"
						name="bio"
						rows="3"
						value={form.bio}
						onChange={handleChange}
						placeholder="Tell shelters about your home, other pets, and experience"
					/>
				</div>
				{error && <p className="error">{error}</p>}
				{message && <p className="success">{message}</p>}
				<button className="primary" type="submit" disabled={isLoading}>
					{isLoading ? "Saving..." : "Save profile"}
				</button>
				<p className="muted small">Account email: {user?.email}</p>
			</form>
		</section>
	);
};

export default Profile;
