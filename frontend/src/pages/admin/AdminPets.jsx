import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/adminStore";
import "./AdminPets.css";
import { getImageUrl } from "../../utils/imageUrl";

const AdminPets = () => {
	const { 
		pets, 
		getAllPets, 
		deletePet, 
		isLoading, 
		error, 
		clearError 
	} = useAdminStore();
	
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");
	const [selectedSpecies, setSelectedSpecies] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [petToDelete, setPetToDelete] = useState(null);

	useEffect(() => {
		getAllPets();
	}, [getAllPets]);

	const filteredPets = pets.filter(pet => {
		const matchesSearch = pet.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			pet.breed?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = selectedStatus === "" || pet.status === selectedStatus;
		const matchesSpecies = selectedSpecies === "" || pet.species === selectedSpecies;
		
		return matchesSearch && matchesStatus && matchesSpecies;
	});

	const handleDeleteClick = (pet) => {
		setPetToDelete(pet);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (petToDelete) {
			try {
				await deletePet(petToDelete._id);
				setShowDeleteModal(false);
				setPetToDelete(null);
			} catch (error) {
				console.error("Failed to delete pet:", error);
			}
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "adopted": return "#27ae60";
			case "pending": return "#f39c12";
			case "available": return "#3498db";
			default: return "#95a5a6";
		}
	};

	const getAgeString = (age) => {
		if (age < 12) return `${age} months`;
		const years = Math.floor(age / 12);
		const months = age % 12;
		return months > 0 ? `${years}y ${months}m` : `${years} years`;
	};

	if (isLoading) {
		return <div className="loader">Loading pets...</div>;
	}

	return (
		<div className="admin-pets">
			<div className="pets-header">
				<h1>Pet Management</h1>
				<p>Manage all pets across all shelters</p>
			</div>

			{error && (
				<div className="error-banner">
					{error}
					<button onClick={clearError} className="close-error">×</button>
				</div>
			)}

			<div className="pets-controls">
				<div className="search-container">
					<input
						type="text"
						placeholder="Search pets by name or breed..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
					/>
				</div>
				
				<div className="filter-container">
					<select
						value={selectedSpecies}
						onChange={(e) => setSelectedSpecies(e.target.value)}
						className="species-filter"
					>
						<option value="">All Species</option>
						<option value="dog">Dogs</option>
						<option value="cat">Cats</option>
						<option value="bird">Birds</option>
						<option value="rabbit">Rabbits</option>
						<option value="other">Other</option>
					</select>
				</div>

				<div className="filter-container">
					<select
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
						className="status-filter"
					>
						<option value="">All Statuses</option>
						<option value="available">Available</option>
						<option value="pending">Pending</option>
						<option value="adopted">Adopted</option>
					</select>
				</div>
			</div>

			<div className="pets-stats">
				<span>Total Pets: {filteredPets.length}</span>
				<span>Available: {filteredPets.filter(p => p.status === 'available').length}</span>
				<span>Pending: {filteredPets.filter(p => p.status === 'pending').length}</span>
				<span>Adopted: {filteredPets.filter(p => p.status === 'adopted').length}</span>
			</div>

			<div className="pets-grid">
				{filteredPets.map(pet => (
					<div key={pet._id} className="pet-card">
						<div className="pet-image">
							{pet.images && pet.images.length > 0 ? (
								<img src={getImageUrl(pet.images[0])} alt={pet.name} />
							) : (
								<div className="no-image">
									<span>{pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}</span>
								</div>
							)}
							<div 
								className="status-badge"
								style={{ backgroundColor: getStatusColor(pet.status) }}
							>
								{pet.status}
							</div>
						</div>

						<div className="pet-info">
							<div className="pet-header">
								<h3 className="pet-name">{pet.name}</h3>
								<div className="pet-species">{pet.species}</div>
							</div>

							<div className="pet-details">
								<div className="detail-item">
									<strong>Breed:</strong> {pet.breed}
								</div>
								<div className="detail-item">
									<strong>Age:</strong> {getAgeString(pet.age)}
								</div>
								<div className="detail-item">
									<strong>Gender:</strong> {pet.gender}
								</div>
								<div className="detail-item">
									<strong>Size:</strong> {pet.size}
								</div>
								{pet.shelterName && (
									<div className="detail-item">
										<strong>Shelter:</strong> {pet.shelterName}
									</div>
								)}
							</div>

							{pet.description && (
								<div className="pet-description">
									{pet.description.length > 100 
										? `${pet.description.substring(0, 100)}...` 
										: pet.description
									}
								</div>
							)}

							<div className="pet-actions">
								<button 
									className="delete-btn"
									onClick={() => handleDeleteClick(pet)}
								>
									Delete Pet
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{filteredPets.length === 0 && (
				<div className="no-pets">
					No pets found matching your search criteria.
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h3>Confirm Delete</h3>
						<p>
							Are you sure you want to delete{" "}
							<strong>{petToDelete?.name}</strong>?
						</p>
						<p className="warning">This action cannot be undone and will also delete all related adoption requests.</p>
						<div className="modal-actions">
							<button 
								className="cancel-btn"
								onClick={() => {
									setShowDeleteModal(false);
									setPetToDelete(null);
								}}
							>
								Cancel
							</button>
							<button 
								className="confirm-delete-btn"
								onClick={confirmDelete}
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminPets;