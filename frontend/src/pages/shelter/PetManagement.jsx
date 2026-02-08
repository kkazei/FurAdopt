import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Dog, Cat } from "lucide-react";
import { useShelterStore } from "../../store/shelterStore";
import PetModal from "../../components/PetModal";
import "./PetManagement.css";

const PetManagement = () => {
	const { pets, isLoading, error, fetchMyPets, createPet, updatePet, deletePet, clearError } =
		useShelterStore();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingPet, setEditingPet] = useState(null);
	const [deleteConfirm, setDeleteConfirm] = useState(null);

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
				<div className="pets-grid">
					{pets.map((pet) => (
						<div key={pet._id} className="pet-card">
							<div className="pet-card-header">
								<div className="pet-type-badge">
									{getPetIcon(pet.type)}
									<span>{pet.type}</span>
								</div>
								<div className="pet-actions">
									<button
										className="action-btn edit"
										onClick={() => handleEditPet(pet)}
										aria-label="Edit pet"
									>
										<Edit size={18} />
									</button>
									<button
										className="action-btn delete"
										onClick={() => handleDeleteClick(pet)}
										aria-label="Delete pet"
									>
										<Trash2 size={18} />
									</button>
								</div>
							</div>

							<div className="pet-card-body">
								{pet.images && pet.images.length > 0 && (
									<div className="pet-image">
										<img src={`http://localhost:5000${pet.images[0]}`} alt={pet.name} />
									</div>
								)}
								<h3>{pet.name}</h3>
								<div className="pet-info">
									<span className="info-item">
										<strong>Breed:</strong> {pet.breed}
									</span>
									<span className="info-item">
										<strong>Age:</strong> {pet.age} {pet.age === 1 ? "year" : "years"}
									</span>
									<span className="info-item">
										<strong>Size:</strong> {pet.size}
									</span>
									<span className="info-item">
										<strong>Health:</strong> {pet.healthStatus}
									</span>
								</div>
								<div className="pet-traits">
									{pet.petFriendly && (
										<span className="trait-badge">🐾 Pet Friendly</span>
									)}
									{pet.childFriendly && (
										<span className="trait-badge">👶 Child Friendly</span>
									)}
								</div>
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
