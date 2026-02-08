import { useEffect, useMemo, useState } from "react";
import { usePetStore } from "../store/petStore";
import { useAdoptionStore } from "../store/adoptionStore";
import { ChevronDown, ChevronUp, Filter, Heart, MapPin } from "lucide-react";

const defaultFilters = { type: "", breed: "", size: "", healthStatus: "", ageMin: "", ageMax: "", petFriendly: "", childFriendly: "" };

const PetList = () => {
	const { pets, fetchPets, isLoading, error } = usePetStore();
	const { createRequest, message, error: requestError, isLoading: requestLoading } = useAdoptionStore();
	const [filters, setFilters] = useState(defaultFilters);
	const [showFilters, setShowFilters] = useState(false);

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
		setShowFilters(false); // Hide filters after applying
	};

	const clearFilters = () => {
		setFilters(defaultFilters);
		fetchPets();
		setShowFilters(false); // Hide filters after clearing
	};

	const handleRequest = async (petId) => {
		try {
			await createRequest(petId);
			// refresh requests handled elsewhere; keep UX simple
		} catch (error) {
			console.error(error);
		}
	};

	const hasActiveFilters = Object.values(filters).some(value => value !== "");

	const availablePets = useMemo(() => pets.filter((p) => p.status === "available"), [pets]);

		return (
		<section className="dashboard">
			<div className="card list-hero">
				<div>
					<p className="eyebrow">Find a friend</p>
					<h1>Pets ready for adoption</h1>
					<p className="muted">Discover your perfect companion from our loving shelter partners.</p>
				</div>
				<div className="hero-actions">
					<button 
						className={`filters-toggle ${showFilters ? 'active' : ''}`} 
						type="button" 
						onClick={() => setShowFilters(!showFilters)}
					>
						<Filter size={18} />
						{showFilters ? 'Hide Filters' : 'Show Filters'}
						{showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
						{hasActiveFilters && <span className="active-filters-indicator"></span>}
					</button>
				</div>
			</div>

			{showFilters && (
				<form className="card filters-panel" onSubmit={applyFilters}>
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
							Clear All
						</button>
						<button className="primary" type="submit" disabled={isLoading}>
							{isLoading ? "Applying..." : "Apply Filters"}
						</button>
					</div>
				</form>
			)}

			{error && <div className="alert error">{error}</div>}
			{requestError && <div className="alert error">{requestError}</div>}
			{message && <div className="alert success">{message}</div>}

			<div className="pets-section">
				{availablePets.length === 0 ? (
					<div className="empty-state">
						<Heart size={64} className="empty-icon" />
						<h3>No pets found</h3>
						<p className="muted">Try adjusting your filters or check back later for new arrivals.</p>
					</div>
				) : (
					<>
						
						<div className="pets-grid modern">
							{availablePets.map((pet) => (
								<div key={pet._id} className="pet-card modern">
									<div className="pet-card-image">
										{pet.images && pet.images.length > 0 ? (
											<img src={`http://localhost:5000${pet.images[0]}`} alt={pet.name} />
										) : (
											<div className="pet-placeholder">
												<Heart size={48} />
											</div>
										)}
										<div className="pet-badges">
											<span className={`pet-type-badge ${pet.type}`}>{pet.type}</span>
											<span className={`pet-size-badge ${pet.size}`}>{pet.size}</span>
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
                  
										{pet.owner?.shelterName && (
											<div className="shelter-info">
												<MapPin size={14} />
												<span>From: {pet.owner.shelterName}</span>
											</div>
										)}
                  
										<button
											className="adopt-button"
											onClick={() => handleRequest(pet._id)}
											disabled={requestLoading}
										>
											<Heart size={18} />
											{requestLoading ? "Requesting..." : "Request Adoption"}
										</button>
									</div>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</section>
	);
};

export default PetList;
