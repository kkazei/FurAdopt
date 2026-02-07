import { useAuthStore } from "../../store/authStore";
import { Building, Mail, Phone, MapPin, Info } from "lucide-react";
import "./ShelterProfile.css";

const ShelterProfile = () => {
	const { user } = useAuthStore();

	return (
		<div className="shelter-profile">
			<div className="profile-header">
				<div className="profile-avatar">
					<Building size={48} />
				</div>
				<div>
					<h2>{user?.shelterName}</h2>
					<p className="muted">Shelter Account</p>
				</div>
			</div>

			<div className="profile-content">
				<div className="profile-section">
					<h3>Contact Information</h3>
					<div className="info-grid">
						<div className="info-item">
							<Mail size={20} className="info-icon" />
							<div>
								<label>Email</label>
								<p>{user?.email}</p>
							</div>
						</div>

						<div className="info-item">
							<Phone size={20} className="info-icon" />
							<div>
								<label>Phone</label>
								<p>{user?.shelterPhone || "Not provided"}</p>
							</div>
						</div>

						<div className="info-item">
							<MapPin size={20} className="info-icon" />
							<div>
								<label>Address</label>
								<p>{user?.shelterAddress || "Not provided"}</p>
							</div>
						</div>
					</div>
				</div>

				{user?.shelterDescription && (
					<div className="profile-section">
						<h3>About</h3>
						<div className="info-item">
							<Info size={20} className="info-icon" />
							<div>
								<p>{user.shelterDescription}</p>
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
									<span className={`status-badge ${user?.isVerified ? "verified" : "pending"}`}>
										{user?.isVerified ? "Verified" : "Pending Verification"}
									</span>
								</p>
							</div>
						</div>

						<div className="info-item">
							<div>
								<label>Member Since</label>
								<p>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ShelterProfile;
