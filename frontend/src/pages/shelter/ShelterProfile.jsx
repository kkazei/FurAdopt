import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";
import { Building, Mail, Phone, MapPin, Info, Camera } from "lucide-react";
import "./ShelterProfile.css";

const ShelterProfile = () => {
	const { user } = useAuthStore();
	const { profile, fetchProfile, updateProfile, uploadProfilePicture, isLoading, error, message } = useProfileStore();
	const [form, setForm] = useState({
		shelterName: "",
		shelterPhone: "",
		shelterAddress: "",
		shelterDescription: "",
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState(null);
	const [previewUrl, setPreviewUrl] = useState(null);

	const shelterData = profile || user;
	const avatarSrc = previewUrl || shelterData?.profilePicture || user?.profilePicture;

	useEffect(() => {
		fetchProfile();
	}, [fetchProfile]);

	useEffect(() => {
		if (shelterData) {
			setForm({
				shelterName: shelterData.shelterName || "",
				shelterPhone: shelterData.shelterPhone || "",
				shelterAddress: shelterData.shelterAddress || "",
				shelterDescription: shelterData.shelterDescription || "",
			});
		}
	}, [shelterData]);

	const openEditModal = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
		setIsModalOpen(true);
	};

	const closeEditModal = () => {
		setSelectedFile(null);
		setPreviewUrl(null);
		setIsModalOpen(false);
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
			await updateProfile(form);
			closeEditModal();
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<motion.div className="shelter-profile"
			initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
		>
			<div className="profile-header">
				<div className="profile-avatar">
					{avatarSrc ? (
						<img src={avatarSrc} alt={shelterData?.shelterName || "Shelter"} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
					) : (
						<Building size={48} />
					)}
				</div>
				<div>
					<h2>{shelterData?.shelterName}</h2>
					<p className="muted">Shelter Account</p>
					<div className="profile-actions">
						<button className="ghost" type="button" onClick={openEditModal}>
							Edit profile
						</button>
					</div>
				</div>
			</div>

			<div className="profile-content">
				{message && <p className="success">{message}</p>}
				{error && <p className="error">{error}</p>}
				<div className="profile-section">
					<h3>Contact Information</h3>
					<div className="info-grid">
						<div className="info-item">
							<Mail size={20} className="info-icon" />
							<div>
								<label>Email</label>
								<p>{shelterData?.email}</p>
							</div>
						</div>

						<div className="info-item">
							<Phone size={20} className="info-icon" />
							<div>
								<label>Phone</label>
								<p>{shelterData?.shelterPhone || "Not provided"}</p>
							</div>
						</div>

						<div className="info-item">
							<MapPin size={20} className="info-icon" />
							<div>
								<label>Address</label>
								<p>{shelterData?.shelterAddress || "Not provided"}</p>
							</div>
						</div>
					</div>
				</div>

				{shelterData?.shelterDescription && (
					<div className="profile-section">
						<h3>About</h3>
						<div className="info-item">
							<Info size={20} className="info-icon" />
							<div>
								<p>{shelterData.shelterDescription}</p>
							</div>
						</div>
					</div>
				)}

				<div className="profile-section">
					<h3>Account Details</h3>
					<div className="info-grid">
						<div className="info-item">
							<div>
								<label>Account Status</label>
								<p>
									<span className={`status-badge ${shelterData?.isVerified ? "verified" : "pending"}`}>
										{shelterData?.isVerified ? "Verified" : "Pending Verification"}
									</span>
								</p>
							</div>
						</div>

						<div className="info-item">
							<div>
								<label>Member Since</label>
								<p>{shelterData?.createdAt ? new Date(shelterData.createdAt).toLocaleDateString() : "N/A"}</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{isModalOpen && (
				<div className="modal-overlay" role="dialog" aria-modal="true">
					<div className="modal-card">
						<div className="modal-header">
							<div>
								<p className="eyebrow">Edit profile</p>
								<h3>Update shelter info</h3>
							</div>
							<button className="modal-close" type="button" onClick={closeEditModal} aria-label="Close">
								×
							</button>
						</div>
						<form className="modal-body" onSubmit={handleSubmit}>
							<div className="field">
								<label htmlFor="profilePicture">Profile picture</label>
								<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
									<div style={{ 
										width: "64px", 
										height: "64px", 
										borderRadius: "50%", 
										background: "var(--orange-light)",
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										overflow: "hidden"
									}}>
										{avatarSrc ? (
											<img 
												src={avatarSrc} 
												alt="Preview" 
												style={{ width: "100%", height: "100%", objectFit: "cover" }} 
											/>
										) : (
											<Building size={32} style={{ color: "var(--orange)" }} />
										)}
									</div>
									<div style={{ flex: 1 }}>
										<button 
											type="button" 
											className="btn-ghost" 
											onClick={() => document.getElementById("profilePicture").click()}
											style={{ marginBottom: "0.5rem" }}
										>
											<Camera size={18} />
											Choose image
										</button>
										{selectedFile && <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>{selectedFile.name}</p>}
										<input
											id="profilePicture"
											type="file"
											accept="image/*"
											style={{ display: "none" }}
											onChange={handleFileChange}
										/>
									</div>
								</div>
							</div>
							<div className="field">
								<label htmlFor="shelterName">Shelter name</label>
								<input
									id="shelterName"
									name="shelterName"
									value={form.shelterName}
									onChange={handleChange}
									required
								/>
							</div>
							<div className="field">
								<label htmlFor="shelterPhone">Phone</label>
								<input
									id="shelterPhone"
									name="shelterPhone"
									value={form.shelterPhone}
									onChange={handleChange}
									placeholder="(555) 123-4567"
								/>
							</div>
							<div className="field">
								<label htmlFor="shelterAddress">Address</label>
								<input
									id="shelterAddress"
									name="shelterAddress"
									value={form.shelterAddress}
									onChange={handleChange}
									placeholder="Street, City, Country"
								/>
							</div>
							<div className="field">
								<label htmlFor="shelterDescription">About</label>
								<textarea
									id="shelterDescription"
									name="shelterDescription"
									rows="3"
									value={form.shelterDescription}
									onChange={handleChange}
									placeholder="Mission, services, and how adopters can reach you"
								/>
							</div>
							{error && <p className="error">{error}</p>}
							{message && <p className="success">{message}</p>}
							<div className="modal-actions">
								<button className="ghost" type="button" onClick={() => setIsModalOpen(false)}>
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
		</motion.div>
	);
};

export default ShelterProfile;
