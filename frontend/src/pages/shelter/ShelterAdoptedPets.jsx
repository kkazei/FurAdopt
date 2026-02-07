import { useEffect } from "react";
import { useShelterAdoptionStore } from "../../store/shelterAdoptionStore";
import { Heart, User, Mail, Calendar } from "lucide-react";
import "./ShelterAdoptedPets.css";

const ShelterAdoptedPets = () => {
	const { adoptedPets, isLoading, error, fetchShelterAdoptedPets, clearError } =
		useShelterAdoptionStore();

	useEffect(() => {
		fetchShelterAdoptedPets();
	}, [fetchShelterAdoptedPets]);

	return (
		<div className="shelter-adopted-pets">
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
				<div className="adopted-pets-grid">
					{adoptedPets.map((pet) => (
						<div key={pet._id} className="adopted-pet-card">
							<div className="card-header">
								<div className="pet-badge">
									<Heart size={20} className="heart-icon" />
									<span>Adopted</span>
								</div>
								<span className="adoption-date">
									{new Date(pet.updatedAt).toLocaleDateString()}
								</span>
							</div>

							<div className="pet-details">
								<h3>{pet.name}</h3>
								<p className="pet-breed">{pet.breed}</p>
								<div className="pet-meta">
									<span>{pet.age} {pet.age === 1 ? 'year' : 'years'}</span>
									<span>•</span>
									<span className="capitalize">{pet.size}</span>
									<span>•</span>
									<span className="capitalize">{pet.type}</span>
								</div>

								{pet.description && (
									<p className="pet-description">{pet.description}</p>
								)}

								<div className="health-status">
									<strong>Health:</strong> {pet.healthStatus}
								</div>
							</div>

							{pet.adoptedBy && (
								<div className="adopter-details">
									<div className="adopter-header">
										<strong>Adopted by</strong>
									</div>
									<div className="adopter-info">
										<div className="info-item">
											<User size={16} className="info-icon" />
											<span>{pet.adoptedBy.name}</span>
										</div>
										<div className="info-item">
											<Mail size={16} className="info-icon" />
											<span>{pet.adoptedBy.email}</span>
										</div>
									</div>
								</div>
							)}
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
		</div>
	);
};

export default ShelterAdoptedPets;
