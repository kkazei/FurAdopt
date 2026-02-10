import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Dog, Cat } from "lucide-react";
import { getImageUrl } from "../../utils/imageUrl";
import { useShelterStore } from "../../store/shelterStore";
import PetModal from "../../components/PetModal";
import ShelterPetDetailsModal from "./ShelterPetDetailsModal";
import "./PetManagement.css";

const PetManagement = () => {
	const { pets, isLoading, error, fetchMyPets, createPet, updatePet, deletePet, clearError } =
		useShelterStore();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingPet, setEditingPet] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);
	const [selectedPet, setSelectedPet] = useState(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);

	useEffect(() => {
		fetchMyPets();
	}, [fetchMyPets]);

	const handleAddPet = () => {
		setEditingPet(null);
		setIsModalOpen(true);
	};

	const handleEditPet = (pet) => {
		setEditingPet(pet);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setEditingPet(null);
	};

	const handleSubmit = async (petData) => {
		try {
			if (editingPet) {
				await updatePet(editingPet._id, petData);
			} else {
				await createPet(petData);
			}
			handleModalClose();
		} catch (error) {
			console.error("Error saving pet:", error);
		}
	};

	const handleDeleteClick = (pet) => {
		setDeleteConfirm(pet);
	};

	const handleDeleteConfirm = async () => {
		if (deleteConfirm) {
			try {
				await deletePet(deleteConfirm._id);
				setDeleteConfirm(null);
			} catch (error) {
				console.error("Error deleting pet:", error);
			}
		}
	};

	const handlePetClick = (pet) => {
		setSelectedPet(pet);
		setShowDetailsModal(true);
	};

	const closeDetailsModal = () => {
		setShowDetailsModal(false);
		setSelectedPet(null);
	};

	const getPetIcon = (type) => {
		return type === "dog" ? <Dog size={20} /> : <Cat size={20} />;
	};

	return (
		<div className="pet-management">
			<div className="section-header">
				<div>
					<h2>Manage Your Pets</h2>
					<p className="muted">Add, edit, or remove pets from your shelter</p>
				</div>
				<button className="btn-add-pet" onClick={handleAddPet}>
					<Plus size={20} />
					Add Pet
				</button>
			</div>

			{error && (
				<div className="alert alert-error">
					{error}
					<button onClick={clearError} className="alert-close">
						×
					</button>
				</div>
			)}

			{isLoading && pets.length === 0 ? (
				<div className="loading-state">
					<div className="spinner"></div>
					<p>Loading pets...</p>
				</div>
			) : pets.length === 0 ? (
				<div className="empty-state">
					<Dog size={64} className="empty-icon" />
					<h3>No pets yet</h3>
					<p>Start by adding your first pet to the system</p>
					<button className="btn-primary" onClick={handleAddPet}>
						<Plus size={20} />
						Add Your First Pet
					</button>
				</div>
			) : (
				<div className="pets-grid modern">
					{pets.map((pet) => (
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
										{getPetIcon(pet.type)}
									</div>
								)}
								<div className="pet-badges">
									<span className={`pet-type-badge ${pet.type}`}>{pet.type}</span>
									<span className={`pet-size-badge ${pet.size}`}>{pet.size}</span>
								</div>
								<div className="action-overlay">
									<button
										className="action-btn edit"
										onClick={(e) => {
											e.stopPropagation();
											handleEditPet(pet);
										}}
										aria-label="Edit pet"
									>
										<Edit size={18} />
									</button>
									<button
										className="action-btn delete"
										onClick={(e) => {
											e.stopPropagation();
											handleDeleteClick(pet);
										}}
										aria-label="Delete pet"
									>
										<Trash2 size={18} />
									</button>
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

								<div className="pet-status">
									<span className={`status-badge ${pet.status}`}>
										{pet.status === "available" ? "Available" : "Adopted"}
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<PetModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onSubmit={handleSubmit}
				pet={editingPet}
				isLoading={isLoading}
			/>

			<ShelterPetDetailsModal
				isOpen={showDetailsModal}
				onClose={closeDetailsModal}
				pet={selectedPet}
				onEdit={handleEditPet}
				onDelete={handleDeleteClick}
			/>

			{deleteConfirm && (
				<div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
					<div className="delete-modal" onClick={(e) => e.stopPropagation()}>
						<h3>Delete Pet</h3>
						<p>
							Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This
							action cannot be undone.
						</p>
						<div className="delete-actions">
							<button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
								Cancel
							</button>
							<button className="btn-danger" onClick={handleDeleteConfirm}>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PetManagement;
