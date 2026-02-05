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
					<div key={pet._id} className="pet-card">
						<div className="pet-head">
							<div>
								<p className="eyebrow">{pet.type}</p>
								<h3>{pet.breed}</h3>
							</div>
							<span className="pill positive">Adopted</span>
						</div>
						<p className="muted small">Age: {pet.age}</p>
						<p className="muted small">Health: {pet.healthStatus}</p>
						<p className="muted small clamp">{pet.description}</p>
					</div>
				))}
				{isLoading && <p className="muted">Loading...</p>}
			</div>
		</section>
	);
};

export default AdoptedPets;
