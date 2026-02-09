import { useState } from "react";
import { X, Edit, Trash2, Calendar, Stethoscope, Info, Users, Baby, MapPin, Dog, Cat } from "lucide-react";
import PropTypes from "prop-types";
import "./ShelterPetDetailsModal.css";

const ShelterPetDetailsModal = ({ isOpen, onClose, pet, onEdit, onDelete }) => {
	const [currentImageIndex, setCurrentImageIndex] = useState(0);

	if (!isOpen || !pet) return null;

	const nextImage = () => {
		if (pet.images && pet.images.length > 1) {
			setCurrentImageIndex((prev) => (prev + 1) % pet.images.length);
		}
	};

	const prevImage = () => {
		if (pet.images && pet.images.length > 1) {
			setCurrentImageIndex((prev) => (prev - 1 + pet.images.length) % pet.images.length);
		}
	};

	const getPetIcon = (type) => {
		return type === "dog" ? <Dog size={20} /> : <Cat size={20} />;
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="shelter-pet-details-modal" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="shelter-pet-details-header">
					<div className="pet-details-title">
						<div className="title-with-icon">
							{getPetIcon(pet.type)}
							<div>
								<h2>{pet.name || "Unnamed Pet"}</h2>
								<p className="pet-breed">{pet.breed}</p>
							</div>
						</div>
						<div className="status-section">
							<span className={`status-badge ${pet.status}`}>
								{pet.status === "available" ? "Available" : "Adopted"}
							</span>
						</div>
					</div>
					<div className="header-actions">
						<button 
							className="action-btn edit"
							onClick={() => {
								onEdit(pet);
								onClose();
							}}
						>
							<Edit size={18} />
						</button>
						<button 
							className="action-btn delete"
							onClick={() => {
								onDelete(pet);
								onClose();
							}}
						>
							<Trash2 size={18} />
						</button>
						<button className="modal-close" onClick={onClose} aria-label="Close">
							<X size={24} />
						</button>
					</div>
				</div>

				{/* Image Gallery */}
				<div className="pet-image-gallery">
					{pet.images && pet.images.length > 0 ? (
						<>
							<div className="main-image-container">
								<img 
									src={`http://localhost:5000${pet.images[currentImageIndex]}`} 
									alt={pet.name || "Pet"} 
									className="main-pet-image"
								/>
								{pet.images.length > 1 && (
									<>
										<button className="image-nav prev" onClick={prevImage}>‹</button>
										<button className="image-nav next" onClick={nextImage}>›</button>
									</>
								)}
								<div className="image-badges">
									<span className={`pet-type-badge ${pet.type}`}>{pet.type}</span>
									<span className={`pet-size-badge ${pet.size}`}>{pet.size}</span>
								</div>
							</div>
							{pet.images.length > 1 && (
								<div className="image-thumbnails">
									{pet.images.map((image, index) => (
										<img
											key={index}
											src={`http://localhost:5000${image}`}
											alt={`${pet.name || "Pet"} ${index + 1}`}
											className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
											onClick={() => setCurrentImageIndex(index)}
										/>
									))}
								</div>
							)}
						</>
					) : (
						<div className="pet-placeholder-large">
							{getPetIcon(pet.type)}
						</div>
					)}
				</div>

				{/* Pet Information */}
				<div className="shelter-pet-details-content">
					{/* Basic Info */}
					<div className="info-section">
						<h3>Basic Information</h3>
						<div className="info-grid">
							<div className="info-item">
								<Calendar size={18} />
								<div>
									<span className="label">Age</span>
									<span className="value">{pet.age} {pet.age === 1 ? 'year' : 'years'} old</span>
								</div>
							</div>
							<div className="info-item">
								<Stethoscope size={18} />
								<div>
									<span className="label">Health Status</span>
									<span className="value">{pet.healthStatus}</span>
								</div>
							</div>
							<div className="info-item">
								<Info size={18} />
								<div>
									<span className="label">Size Category</span>
									<span className="value capitalize">{pet.size}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Personality Traits */}
					{(pet.petFriendly || pet.childFriendly) && (
						<div className="info-section">
							<h3>Personality & Compatibility</h3>
							<div className="traits-grid">
								{pet.petFriendly && (
									<div className="trait-item good">
										<Users size={18} />
										<span>Pet Friendly</span>
									</div>
								)}
								{pet.childFriendly && (
									<div className="trait-item good">
										<Baby size={18} />
										<span>Child Friendly</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Description */}
					{pet.description && (
						<div className="info-section">
							<h3>About {pet.name || "This Pet"}</h3>
							<p className="pet-description-full">{pet.description}</p>
						</div>
					)}

					{/* Adoption Info */}
					{pet.adoptedBy && (
						<div className="info-section adoption-info">
							<h3>Adoption Information</h3>
							<div className="adopter-card">
								<div className="adopter-header">
									<Users size={20} />
									<span>Adopted by</span>
								</div>
								<div className="adopter-details">
									<p><strong>Name:</strong> {pet.adoptedBy.name}</p>
									<p><strong>Email:</strong> {pet.adoptedBy.email}</p>
									<p><strong>Adoption Date:</strong> {new Date(pet.updatedAt).toLocaleDateString()}</p>
								</div>
							</div>
						</div>
					)}

					{/* Management Actions */}
					<div className="management-actions">
						<button
							className="edit-button primary"
							onClick={() => {
								onEdit(pet);
								onClose();
							}}
						>
							<Edit size={18} />
							Edit Pet Information
						</button>
						<button
							className="delete-button danger"
							onClick={() => {
								onDelete(pet);
								onClose();
							}}
						>
							<Trash2 size={18} />
							Remove Pet
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

ShelterPetDetailsModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	pet: PropTypes.object,
	onEdit: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired
};

export default ShelterPetDetailsModal;