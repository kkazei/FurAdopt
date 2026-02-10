import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useShelterAdoptionStore } from "../../store/shelterAdoptionStore";
import { Heart, User, Mail, Calendar } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";
import ShelterPetDetailsModal from "./ShelterPetDetailsModal";
import "./ShelterAdoptedPets.css";

const ShelterAdoptedPets = () => {
	const { adoptedPets, isLoading, error, fetchShelterAdoptedPets, clearError } =
		useShelterAdoptionStore();
	const [selectedPet, setSelectedPet] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	useEffect(() => {
		fetchShelterAdoptedPets();
	}, [fetchShelterAdoptedPets]);

	const handlePetClick = (pet) => {
		setSelectedPet(pet);
		setShowDetailsModal(true);
	};

	const closeDetailsModal = () => {
		setShowDetailsModal(false);
		setSelectedPet(null);
	};

	// Disabled edit and delete for adopted pets
	const handleEdit = () => {};
	const handleDelete = () => {};

	return (
		<motion.div className="shelter-adopted-pets"
			initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
		>
			<div className="section-header">
				<div>
					<h2>Adopted Pets</h2>
					<p className="muted">Pets that have found their forever homes</p>
				</div>
			</div>

			{error && (
				<div className="alert alert-error">
					{error}
					<button onClick={clearError} className="alert-close">
						×
					</button>
				</div>
			)}

			{isLoading ? (
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading adopted pets...</p>
				</div>
			) : adoptedPets.length === 0 ? (
				<div className="empty-state">
					<Heart size={64} className="empty-icon" />
					<h3>No adopted pets yet</h3>
					<p>Pets that have been adopted will appear here</p>
				</div>
			) : (
				<div className="pets-grid modern">
					{adoptedPets.map((pet) => (
						<div 
							key={pet._id} 
							className="pet-card modern clickable"
							onClick={() => handlePetClick(pet)}
							role="button"
							tabIndex={0}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									handlePetClick(pet);
								}
							}}
						>
							<div className="pet-card-image">
								{pet.images && pet.images.length > 0 ? (
									<img src={getImageUrl(pet.images[0])} alt={pet.name} />
								) : (
									<div className="pet-placeholder">
										<Heart size={48} />
									</div>
								)}
								<div className="pet-badges">
									<span className={`pet-type-badge ${pet.type}`}>{pet.type}</span>
									<span className={`pet-size-badge ${pet.size}`}>{pet.size}</span>
								</div>
								<div className="adoption-badge">
									<Heart size={16} />
									<span>Adopted</span>
								</div>
							</div>

							<div className="pet-card-content">
								<div className="pet-header">
									<h3>{pet.name || pet.breed}</h3>
									{pet.name && <p className="breed-info">{pet.breed}</p>}
								</div>

								<div className="pet-details">
									<div className="detail-item">
										<span className="detail-label">Age</span>
										<span className="detail-value">{pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
									</div>
									<div className="detail-item">
										<span className="detail-label">Health</span>
										<span className="detail-value">{pet.healthStatus}</span>
									</div>
								</div>

								{(pet.petFriendly || pet.childFriendly) && (
									<div className="pet-traits">
										{pet.petFriendly && <span className="trait-tag">🐾 Pet Friendly</span>}
										{pet.childFriendly && <span className="trait-tag">👶 Kid Friendly</span>}
									</div>
								)}

								{pet.description && (
									<p className="pet-description">{pet.description}</p>
								)}

								{pet.adoptedBy && (
									<div className="adopter-info">
										<div className="adopter-item">
											<User size={16} />
											<span>{pet.adoptedBy.name}</span>
										</div>
										<div className="adoption-date">
											{new Date(pet.updatedAt).toLocaleDateString()}
										</div>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			{adoptedPets.length > 0 && (
				<div className="success-summary">
					<div className="summary-card">
						<Heart size={32} className="summary-icon" />
						<div>
							<h3>{adoptedPets.length}</h3>
							<p>Pets Found Homes</p>
						</div>
					</div>
				</div>
			)}

			<ShelterPetDetailsModal
				isOpen={showDetailsModal}
				onClose={closeDetailsModal}
				pet={selectedPet}
				onEdit={handleEdit}
				onDelete={handleDelete}
			/>
		</motion.div>
	);
};

export default ShelterAdoptedPets;
