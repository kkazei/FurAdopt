import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { useProfileStore } from "../store/profileStore";
import { useAuthStore } from "../store/authStore";
import { useAdoptionStore } from "../store/adoptionStore";

const Profile = () => {
	const { profile, fetchProfile, updateProfile, uploadProfilePicture, isLoading, error, message } = useProfileStore();
	const { user } = useAuthStore();
	const {
		adoptedPets,
		fetchAdoptedPets,
		isLoading: adoptionLoading,
		error: adoptionError,
	} = useAdoptionStore();
	const [form, setForm] = useState({ name: "", location: "", age: "", bio: "" });
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	// Redirect shelter users to their shelter profile page
	if (user?.role === "shelter") {
		return <Navigate to="/shelter/profile" replace />;
	}

	useEffect(() => {
		fetchProfile();
		fetchAdoptedPets();
	}, [fetchProfile, fetchAdoptedPets]);

	useEffect(() => {
		if (profile || user) {
			const source = profile || user;
			setForm({
				name: source.name || "",
				location: source.location || "",
				age: source.age || "",
				bio: source.bio || "",
			});
		}
	}, [profile, user]);

	const openEditModal = () => {
		const source = profile || user;
		setForm({
			name: source?.name || "",
			location: source?.location || "",
			age: source?.age || "",
			bio: source?.bio || "",
		});
		setSelectedFile(null);
		setPreviewUrl(null);
		setIsModalOpen(true);
	};

	const closeEditModal = () => {
		setIsModalOpen(false);
		setSelectedFile(null);
		setPreviewUrl(null);
	};

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleFileChange = (e) => {
		const file = e.target.files?.[0];
		if (file) {
			setSelectedFile(file);
			const reader = new FileReader();
			reader.onloadend = () => setPreviewUrl(reader.result);
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			// Upload profile picture first if selected
			if (selectedFile) {
				await uploadProfilePicture(selectedFile);
			}
			// Then update other profile fields
			await updateProfile({ ...form, age: form.age ? Number(form.age) : undefined });
			setIsModalOpen(false);
		} catch (err) {
			console.error(err);
		}
	};

	const initial = (profile?.name || user?.name || user?.email || "U").charAt(0).toUpperCase();
	const avatarSrc = previewUrl || profile?.profilePicture || user?.profilePicture;

	return (
		<motion.section className="dashboard profile-page"
			initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
		>
			<div className="card profile-hero">
				<div className="avatar" aria-hidden>
					{avatarSrc ? (
						<img src={avatarSrc} alt={profile?.name || user?.name || "Profile"} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
					) : (
						initial
					)}
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
					<button className="ghost" type="button" onClick={openEditModal}>
						Edit profile
					</button>
				</div>
			</div>

			<div className="profile-grid">
				<div className="card profile-summary">
					<div className="row between">
						<div>
							<p className="eyebrow">Details</p>
							<h3>Profile settings</h3>
							<p className="muted small">Keeps shelters informed</p>
						</div>
						<button className="ghost" type="button" onClick={openEditModal}>
							Edit profile
						</button>
					</div>
					<div className="info-grid">
						<div className="info-item">
							<div>
								<label>Name</label>
								<p>{profile?.name || "Not provided"}</p>
							</div>
						</div>
						<div className="info-item">
							<div>
								<label>Location</label>
								<p>{profile?.location || "Location not set"}</p>
							</div>
						</div>
						<div className="info-item">
							<div>
								<label>Age</label>
								<p>{profile?.age ?? "--"}</p>
							</div>
						</div>
						<div className="info-item">
							<div>
								<label>Bio</label>
								<p className="clamp">{profile?.bio || "Share a bit about your home and experience."}</p>
							</div>
						</div>
					</div>
					{message && <p className="success">{message}</p>}
					{error && <p className="error">{error}</p>}
				</div>

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

			{isModalOpen && (
				<div className="modal-overlay" role="dialog" aria-modal="true">
					<div className="modal-card">
						<div className="modal-header">
							<div>
								<p className="eyebrow">Edit profile</p>
								<h3>Update your details</h3>
							</div>
							<button className="modal-close" type="button" onClick={closeEditModal} aria-label="Close">
								×
							</button>
						</div>
						<form onSubmit={handleSubmit} className="modal-body">
							<div className="field">					<label htmlFor="profilePicture">Profile picture</label>
							<div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
								<div className="avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>
									{avatarSrc ? (
										<img
											src={avatarSrc}
											alt="Preview"
											style={{ width: '100%', height: '100%', objectFit: 'cover' }}
										/>
									) : (
										initial
									)}
								</div>
								<label htmlFor="file-upload" className="ghost" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
									<Camera size={16} />
									{selectedFile ? selectedFile.name : 'Choose photo'}
								</label>
								<input
									id="file-upload"
									type="file"
									accept="image/*"
									onChange={handleFileChange}
									style={{ display: 'none' }}
								/>
							</div>
						</div>
						<div className="field">								<label htmlFor="name">Name</label>
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
							<div className="modal-actions">
								<button className="ghost" type="button" onClick={closeEditModal}>
									Cancel
								</button>
								<button className="primary" type="submit" disabled={isLoading}>
									{isLoading ? "Saving..." : "Save changes"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</motion.section>
	);
};

export default Profile;
