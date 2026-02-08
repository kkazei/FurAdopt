import { useState, useEffect } from "react";
import { X, Upload, Trash2 } from "lucide-react";
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
		images: [],
	});
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [previewUrls, setPreviewUrls] = useState([]);

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
					images: pet.images || [],
				});
				setPreviewUrls(pet.images || []);
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
					images: [],
				});
				setPreviewUrls([]);
			}
			setSelectedFiles([]);
		}
	}, [pet, isOpen]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({ 
			...prev, 
			[name]: type === 'checkbox' ? checked : value 
		}));
	};

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		if (files.length > 0) {
			setSelectedFiles((prev) => [...prev, ...files]);
			
			// Create preview URLs
			files.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					setPreviewUrls((prev) => [...prev, e.target.result]);
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const removeImage = (index) => {
		setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
		
		// If it's an existing image (from pet.images), remove from formData.images
		if (index < formData.images.length) {
			setFormData((prev) => ({
				...prev,
				images: prev.images.filter((_, i) => i !== index),
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		// Create FormData for file upload
		const submitData = new FormData();
		Object.keys(formData).forEach((key) => {
			if (key !== 'images') {
				submitData.append(key, key === 'age' ? Number(formData[key]) : formData[key]);
			}
		});
		
		// Add existing images
		formData.images.forEach((imageUrl) => {
			submitData.append('existingImages', imageUrl);
		});
		
		// Add new image files
		selectedFiles.forEach((file) => {
			submitData.append('images', file);
		});

		onSubmit(submitData);
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

					<div className="field">
						<label htmlFor="description">Description</label>
						<textarea
							id="description"
							name="description"
							rows="3"
							placeholder="Tell us more about this pet..."
							value={formData.description}
							onChange={handleChange}
						/>
					</div>

					<div className="field">
						<label htmlFor="images">Pet Images</label>
						<div className="image-upload-section">
							<input
								id="images"
								type="file"
								accept="image/*"
								multiple
								onChange={handleImageChange}
								className="image-upload-input"
							/>
							<label htmlFor="images" className="image-upload-button">
								<Upload size={20} />
								Upload Images
							</label>
							<small className="field-hint">You can upload multiple images (max 5)</small>
						</div>
						
						{previewUrls.length > 0 && (
							<div className="image-preview-grid">
								{previewUrls.map((url, index) => (
									<div key={index} className="image-preview-item">
										<img src={url} alt={`Pet preview ${index + 1}`} />
										<button
											type="button"
											className="image-remove-button"
											onClick={() => removeImage(index)}
											aria-label="Remove image"
										>
											<Trash2 size={16} />
										</button>
									</div>
								))}
							</div>
						)}
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
