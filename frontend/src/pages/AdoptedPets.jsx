import { useEffect } from "react";
import { useAdoptionStore } from "../store/adoptionStore";

const AdoptedPets = () => {
	const { adoptedPets, fetchAdoptedPets, isLoading, error } = useAdoptionStore();

	useEffect(() => {
		fetchAdoptedPets();
	}, [fetchAdoptedPets]);

	return (
		<section className="dashboard">
			<div className="panel-header">
				<p className="eyebrow">Happy tails</p>
				<h1>Adopted pets</h1>
				<p className="muted">Pets successfully adopted by you.</p>
			</div>
			<div className="card pet-grid">
				{error && <p className="error">{error}</p>}
				{adoptedPets.length === 0 && !isLoading && <p className="muted">No adopted pets yet.</p>}
				{adoptedPets.map((pet) => (
					<div key={pet._id} className="pet-card enhanced">
						<div className="pet-head">
							<div>
								<p className="eyebrow">{pet.type}</p>
								<h3>{pet.name || pet.breed}</h3>
								<p className="breed-info">{pet.breed}</p>
							</div>
							<span className="pill positive">Adopted</span>
						</div>
						<div className="pet-meta">
							<span className="pill-small">{pet.size}</span>
							<span className="pill-small">{pet.age} {pet.age === 1 ? 'yr' : 'yrs'}</span>
						</div>
						<p className="muted small">Health: {pet.healthStatus}</p>
						<div className="pet-traits">
							{pet.petFriendly && (
								<span className="trait-badge">🐾 Pet Friendly</span>
							)}
							{pet.childFriendly && (
								<span className="trait-badge">👶 Child Friendly</span>
							)}
						</div>
						<p className="muted small clamp">{pet.description}</p>
						<div className="adoption-info">
							<p className="muted extra-small">Adopted: {new Date(pet.updatedAt).toLocaleDateString()}</p>
						</div>
					</div>
				))}
				{isLoading && <p className="muted">Loading...</p>}
			</div>
		</section>
	);
};

export default AdoptedPets;
