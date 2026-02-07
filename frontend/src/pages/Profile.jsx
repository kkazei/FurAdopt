import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";
import { useAdoptionStore } from "../store/adoptionStore";

const Profile = () => {
	const { profile, fetchProfile, updateProfile, isLoading, error, message } = useProfileStore();
	const { user } = useAuthStore();
	const {
		adoptedPets,
		fetchAdoptedPets,
		isLoading: adoptionLoading,
		error: adoptionError,
	} = useAdoptionStore();
	const [form, setForm] = useState({ name: "", location: "", age: "", bio: "" });

	useEffect(() => {
		fetchProfile();
		fetchAdoptedPets();
	}, [fetchProfile, fetchAdoptedPets]);

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

	const initial = (profile?.name || user?.name || user?.email || "U").charAt(0).toUpperCase();

	return (
		<section className="dashboard profile-page">
			<div className="card profile-hero">
				<div className="avatar" aria-hidden>
					{initial}
				</div>
				<div>
					<p className="eyebrow">Your profile</p>
					<h1>Keep your info current</h1>
					<p className="muted">Share a short bio to help shelters know you better.</p>
					<div className="profile-meta">
						<span className="chip subtle">{profile?.location || "Location not set"}</span>
						<span className="chip subtle">Age: {profile?.age || "--"}</span>
						<span className="chip subtle">{user?.email}</span>
					</div>
				</div>
				<div className="stat-stack">
					<div className="stat-tile">
						<p className="stat-label">Adopted pets</p>
						<p className="highlight">{adoptedPets.length}</p>
					</div>
					<div className="stat-tile">
						<p className="stat-label">Profile status</p>
						<p className="muted small">{profile ? "Saved" : "Loading..."}</p>
					</div>
				</div>
			</div>

			<div className="profile-grid">
				<form className="card profile-form" onSubmit={handleSubmit}>
					<div className="row between">
						<div>
							<p className="eyebrow">Details</p>
							<h3>Profile settings</h3>
						</div>
						<p className="muted small">Keeps shelters informed</p>
					</div>
					<div className="field">
						<label htmlFor="name">Name</label>
						<input id="name" name="name" value={form.name} onChange={handleChange} required />
					</div>
					<div className="field">
						<label htmlFor="location">Location</label>
						<input
							id="location"
							name="location"
							value={form.location}
							onChange={handleChange}
							placeholder="City, Country"
						/>
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
				</form>

				<div className="card adopted-card">
					<div className="row between">
						<div>
							<p className="eyebrow">Your adoptions</p>
							<h3>Adopted pets</h3>
						</div>
						<Link className="ghost" to="/pets">Find another pet</Link>
					</div>
					{adoptionError && <p className="error">{adoptionError}</p>}
					<div className="pet-grid compact">
						{adoptedPets.length === 0 && !adoptionLoading && (
							<p className="muted">No adopted pets yet. Start with a new request.</p>
						)}
						{adoptedPets.map((pet) => (
							<div key={pet._id} className="pet-card compact">
								<div>
									<p className="eyebrow">{pet.type}</p>
									<h4>{pet.breed}</h4>
									<p className="muted small">Age: {pet.age} • Health: {pet.healthStatus}</p>
								</div>
								<span className="pill positive">Adopted</span>
							</div>
						))}
						{adoptionLoading && <p className="muted">Loading adopted pets...</p>}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Profile;
