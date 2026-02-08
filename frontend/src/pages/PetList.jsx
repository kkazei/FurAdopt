import { useEffect, useMemo, useState } from "react";
import { usePetStore } from "../store/petStore";
import { useAdoptionStore } from "../store/adoptionStore";

const defaultFilters = { type: "", breed: "", size: "", healthStatus: "", ageMin: "", ageMax: "", petFriendly: "", childFriendly: "" };

const PetList = () => {
	const { pets, fetchPets, isLoading, error } = usePetStore();
	const { createRequest, message, error: requestError, isLoading: requestLoading } = useAdoptionStore();
	const [filters, setFilters] = useState(defaultFilters);

	useEffect(() => {
		fetchPets();
	}, [fetchPets]);

	const handleFilterChange = (e) => {
		setFilters({ ...filters, [e.target.name]: e.target.value });
	};

	const applyFilters = (e) => {
		e.preventDefault();
		const cleaned = Object.fromEntries(
			Object.entries(filters).filter(([, value]) => value !== "" && value !== undefined)
		);
		fetchPets(cleaned);
	};

	const clearFilters = () => {
		setFilters(defaultFilters);
		fetchPets();
	};

	const handleRequest = async (petId) => {
		try {
			await createRequest(petId);
			// refresh requests handled elsewhere; keep UX simple
		} catch (error) {
			console.error(error);
		}
	};

	const availablePets = useMemo(() => pets.filter((p) => p.status === "available"), [pets]);

	return (
		<section className="dashboard">
			<div className="card list-hero">
				<div>
					<p className="eyebrow">Find a friend</p>
					<h1>Pets ready for adoption</h1>
					<p className="muted">Filter by breed, size, age, and health needs.</p>
				</div>
				<div className="hero-actions">
					<button className="ghost" type="button" onClick={clearFilters}>
						Reset filters
					</button>
					<button className="primary" type="button" onClick={applyFilters} disabled={isLoading}>
						{isLoading ? "Filtering..." : "Apply filters"}
					</button>
				</div>
			</div>

			<form className="card filters split" onSubmit={applyFilters}>
				<div className="filters-grid">
					<label>
						<span>Type</span>
						<select name="type" value={filters.type} onChange={handleFilterChange}>
							<option value="">Any</option>
							<option value="cat">Cat</option>
							<option value="dog">Dog</option>
						</select>
					</label>
					<label>
						<span>Breed</span>
						<input name="breed" value={filters.breed} onChange={handleFilterChange} placeholder="Husky" />
					</label>
					<label>
						<span>Size</span>
						<select name="size" value={filters.size} onChange={handleFilterChange}>
							<option value="">Any</option>
							<option value="small">Small</option>
							<option value="medium">Medium</option>
							<option value="large">Large</option>
						</select>
					</label>
					<label>
						<span>Health</span>
						<input
							name="healthStatus"
							value={filters.healthStatus}
							onChange={handleFilterChange}
							placeholder="Vaccinated"
						/>
					</label>
					<label>
						<span>Age min</span>
						<input name="ageMin" value={filters.ageMin} onChange={handleFilterChange} type="number" min="0" />
					</label>
					<label>
						<span>Age max</span>
						<input name="ageMax" value={filters.ageMax} onChange={handleFilterChange} type="number" min="0" />
					</label>
					<label>
						<span>Pet Friendly</span>
						<select name="petFriendly" value={filters.petFriendly} onChange={handleFilterChange}>
							<option value="">Any</option>
							<option value="true">Yes</option>
							<option value="false">No</option>
						</select>
					</label>
					<label>
						<span>Child Friendly</span>
						<select name="childFriendly" value={filters.childFriendly} onChange={handleFilterChange}>
							<option value="">Any</option>
							<option value="true">Yes</option>
							<option value="false">No</option>
						</select>
					</label>
				</div>
				<div className="filters-actions">
					<button className="ghost" type="button" onClick={clearFilters}>
						Clear
					</button>
					<button className="primary" type="submit" disabled={isLoading}>
						{isLoading ? "Filtering..." : "Apply filters"}
					</button>
				</div>
			</form>

			{error && <p className="error">{error}</p>}
			{requestError && <p className="error">{requestError}</p>}
			{message && <p className="success">{message}</p>}

			<div className="card pet-grid showcase-grid">
				{availablePets.length === 0 && <p className="muted">No pets match your filters yet.</p>}
				{availablePets.map((pet) => (
					<div key={pet._id} className="pet-card showcase enhanced">
						<div className="pet-pill-row">
							<span className="pill subtle">{pet.size}</span>
							<span className="pill subtle">{pet.type}</span>
						</div>
						<h3>{pet.name || pet.breed}</h3>
						{pet.name && <p className="breed-subtitle">{pet.breed}</p>}
						<p className="muted small">Age: {pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
						<p className="muted small">Health: {pet.healthStatus}</p>
						<div className="pet-traits">
							{pet.petFriendly && (
								<span className="trait-badge small">🐾 Pet Friendly</span>
							)}
							{pet.childFriendly && (
								<span className="trait-badge small">👶 Child Friendly</span>
							)}
						</div>
						<p className="muted small clamp">{pet.description}</p>
						{pet.owner?.shelterName && (
							<p className="shelter-info muted extra-small">From: {pet.owner.shelterName}</p>
						)}
						<button
							className="primary"
							onClick={() => handleRequest(pet._id)}
							disabled={requestLoading}
						>
							{requestLoading ? "Requesting..." : "Request adoption"}
						</button>
					</div>
				))}
			</div>
		</section>
	);
};

export default PetList;
