import { useState } from "react";
import { X, Heart, MessageCircle, MapPin, Calendar, Stethoscope, Info, Users, Baby } from "lucide-react";
import PropTypes from "prop-types";
import { useChatStore } from "../store/chatStore";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/imageUrl";
import "./PetDetailsModal.css";

const PetDetailsModal = ({ isOpen, onClose, pet }) => {
	const { createChatByPet } = useChatStore();
	const [chatLoading, setChatLoading] = useState(false);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const navigate = useNavigate();

	if (!isOpen || !pet) return null;

	const handleChat = async () => {
		setChatLoading(true);
		try {
			const chat = await createChatByPet(pet._id);
			navigate(`/chat/${chat._id}`);
			onClose();
		} catch (error) {
			console.error("Failed to open chat:", error);
		} finally {
			setChatLoading(false);
		}
	};

	const nextImage = () => {
		if (pet.images && pet.images.length > 1) {
			setCurrentImageIndex((prev) => (prev + 1) % pet.images.length);
		}
	};

	const prevImage = () => {
		if (pet.images && pet.images.length > 1) {
			setCurrentImageIndex((prev) => (prev - 1 + pet.images.length) % pet.images.length);
		}
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div className="pet-details-modal" onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="pet-details-header">
					<div className="pet-details-title">
						<h2>{pet.name || "Unnamed Pet"}</h2>
						<p className="pet-breed">{pet.breed}</p>
					</div>
					<button className="modal-close" onClick={onClose} aria-label="Close">
						<X size={24} />
					</button>
				</div>

				{/* Image Gallery */}
				<div className="pet-image-gallery">
					{pet.images && pet.images.length > 0 ? (
						<>
							<div className="main-image-container">
								<img 
									src={getImageUrl(pet.images[currentImageIndex])} 
									alt={pet.name || "Pet"} 
									className="main-pet-image"
								/>
								{pet.images.length > 1 && (
									<>
										<button className="image-nav prev" onClick={prevImage}>‹</button>
										<button className="image-nav next" onClick={nextImage}>›</button>
									</>
								)}
								<div className="image-badges">
									<span className={`pet-type-badge ${pet.type}`}>{pet.type}</span>
									<span className={`pet-size-badge ${pet.size}`}>{pet.size}</span>
								</div>
							</div>
							{pet.images.length > 1 && (
								<div className="image-thumbnails">
									{pet.images.map((image, index) => (
										<img
											key={index}
											src={getImageUrl(image)}
											alt={`${pet.name || "Pet"} ${index + 1}`}
											className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
											onClick={() => setCurrentImageIndex(index)}
										/>
									))}
								</div>
							)}
						</>
					) : (
						<div className="pet-placeholder-large">
							<Heart size={64} />
						</div>
					)}
				</div>

				{/* Pet Information */}
				<div className="pet-details-content">
					{/* Basic Info */}
					<div className="info-section">
						<h3>Basic Information</h3>
						<div className="info-grid">
							<div className="info-item">
								<Calendar size={18} />
								<div>
									<span className="label">Age</span>
									<span className="value">{pet.age} {pet.age === 1 ? 'year' : 'years'} old</span>
								</div>
							</div>
							<div className="info-item">
								<Stethoscope size={18} />
								<div>
									<span className="label">Health Status</span>
									<span className="value">{pet.healthStatus}</span>
								</div>
							</div>
							{pet.owner?.shelterName && (
								<div className="info-item">
									<MapPin size={18} />
									<div>
										<span className="label">Shelter</span>
										<span className="value">{pet.owner.shelterName}</span>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Personality Traits */}
					{(pet.petFriendly || pet.childFriendly) && (
						<div className="info-section">
							<h3>Personality & Compatibility</h3>
							<div className="traits-grid">
								{pet.petFriendly && (
									<div className="trait-item good">
										<Users size={18} />
										<span>Pet Friendly</span>
									</div>
								)}
								{pet.childFriendly && (
									<div className="trait-item good">
										<Baby size={18} />
										<span>Child Friendly</span>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Description */}
					{pet.description && (
						<div className="info-section">
							<h3>About {pet.name || "This Pet"}</h3>
							<p className="pet-description-full">{pet.description}</p>
						</div>
					)}

					{/* Action Buttons */}
					<div className="pet-actions-modal">
						<button
							className="chat-button primary"
							onClick={handleChat}
							disabled={chatLoading}
						>
							<MessageCircle size={18} />
							{chatLoading ? "Opening..." : "Chat with Shelter"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

PetDetailsModal.propTypes = {
	isOpen: PropTypes.bool.isRequired,
	onClose: PropTypes.func.isRequired,
	pet: PropTypes.object
};

export default PetDetailsModal;