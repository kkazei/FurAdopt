import { useState, useEffect } from "react";
import { X } from "lucide-react";
import PropTypes from "prop-types";
import "./PetModal.css";

const PetModal = ({ isOpen, onClose, onSubmit, pet, isLoading }) => {
	const [formData, setFormData] = useState({
		name: "",
		type: "dog",
		breed: "",
		age: "",
		size: "medium",
		healthStatus: "",
		description: "",
		petFriendly: false,
		childFriendly: false,
	});

	useEffect(() => {
		if (isOpen) {
			if (pet) {
				setFormData({
					name: pet.name || "",
					type: pet.type || "dog",
					breed: pet.breed || "",
					age: pet.age || "",
					size: pet.size || "medium",
					healthStatus: pet.healthStatus || "",
					description: pet.description || "",
					petFriendly: pet.petFriendly || false,
					childFriendly: pet.childFriendly || false,
				});
			} else {
				setFormData({
					name: "",
					type: "dog",
					breed: "",
					age: "",
					size: "medium",
					healthStatus: "",
					description: "",
					petFriendly: false,
					childFriendly: false,
				});
			}
		}
	}, [pet, isOpen]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({ 
			...prev, 
			[name]: type === 'checkbox' ? checked : value 
		}));
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		onSubmit({ ...formData, age: Number(formData.age) });
	};

	if (!isOpen) return null;

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="modal-content" onClick={(e) => e.stopPropagation()}>
				<div className="modal-header">
					<h2>{pet ? "Edit Pet" : "Add New Pet"}</h2>
					<button className="modal-close" onClick={onClose} aria-label="Close">
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="pet-form">
					<div className="form-row">
						<div className="field">
							<label htmlFor="name">Pet Name *</label>
							<input
								id="name"
								name="name"
								type="text"
								required
								placeholder="e.g., Max, Bella"
								value={formData.name}
								onChange={handleChange}
							/>
						</div>

						<div className="field">
							<label htmlFor="type">Pet Type *</label>
							<select id="type" name="type" required value={formData.type} onChange={handleChange}>
								<option value="dog">Dog</option>
								<option value="cat">Cat</option>
							</select>
						</div>
					</div>

					<div className="form-row">
						<div className="field">
							<label htmlFor="breed">Breed *</label>
							<input
								id="breed"
								name="breed"
								type="text"
								required
								placeholder="e.g., Golden Retriever, Siamese"
								value={formData.breed}
								onChange={handleChange}
							/>
						</div>

						<div className="field">
							<label htmlFor="age">Age (years) *</label>
							<input
								id="age"
								name="age"
								type="number"
								min="0"
								max="30"
								required
								placeholder="e.g., 2"
								value={formData.age}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className="form-row">
						<div className="field">
							<label htmlFor="size">Size *</label>
							<select id="size" name="size" required value={formData.size} onChange={handleChange}>
								<option value="small">Small</option>
								<option value="medium">Medium</option>
								<option value="large">Large</option>
							</select>
						</div>

						<div className="field">
							<label htmlFor="healthStatus">Health Status *</label>
							<input
								id="healthStatus"
								name="healthStatus"
								type="text"
								required
								placeholder="e.g., Healthy, Vaccinated"
								value={formData.healthStatus}
								onChange={handleChange}
							/>
						</div>
					</div>

				<div className="form-row">
					<div className="field checkbox-field">
						<label className="checkbox-label">
							<input
								id="petFriendly"
								name="petFriendly"
								type="checkbox"
								checked={formData.petFriendly}
								onChange={handleChange}
							/>
							<span className="checkmark"></span>
							Pet Friendly
						</label>
						<small className="field-hint">Gets along well with other pets</small>
					</div>

					<div className="field checkbox-field">
						<label className="checkbox-label">
							<input
								id="childFriendly"
								name="childFriendly"
								type="checkbox"
								checked={formData.childFriendly}
								onChange={handleChange}
							/>
							<span className="checkmark"></span>
							Child Friendly
						</label>
						<small className="field-hint">Safe and gentle around children</small>
					</div>
				</div>
					<div className="modal-actions">
						<button type="button" onClick={onClose} className="btn-secondary" disabled={isLoading}>
							Cancel
						</button>
						<button type="submit" className="btn-primary" disabled={isLoading}>
							{isLoading ? "Saving..." : pet ? "Update Pet" : "Add Pet"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

PetModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	onSubmit: PropTypes.func.isRequired,
	pet: PropTypes.object,
	isLoading: PropTypes.bool,
};

export default PetModal;
