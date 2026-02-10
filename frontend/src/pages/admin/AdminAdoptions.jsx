import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAdminStore } from "../../store/adminStore";
import "./AdminAdoptions.css";

const AdminAdoptions = () => {
	const { 
		adoptionRequests, 
		getAllAdoptionRequests, 
		isLoading, 
		error, 
		clearError 
	} = useAdminStore();
	
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStatus, setSelectedStatus] = useState("");

	useEffect(() => {
		getAllAdoptionRequests();
	}, [getAllAdoptionRequests]);

	const filteredRequests = adoptionRequests.filter(request => {
		const matchesSearch = request.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			request.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			request.shelterName?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesStatus = selectedStatus === "" || request.status === selectedStatus;
		
		return matchesSearch && matchesStatus;
	});

	const getStatusColor = (status) => {
		switch (status) {
			case "approved": return "#059669";
			case "rejected": return "#dc2626";
			case "pending": return "#f5a623";
			default: return "#6b7280";
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	if (isLoading) {
		return <div className="loader">Loading adoption requests...</div>;
	}

	return (
		<motion.div className="admin-adoptions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
			<div className="adoptions-header">
				<h1>Adoption Management</h1>
				<p>Monitor and overview all adoption requests</p>
			</div>

			{error && (
				<div className="error-banner">
					{error}
					<button onClick={clearError} className="close-error">×</button>
				</div>
			)}

			<div className="adoptions-controls">
				<div className="search-container">
					<input
						type="text"
						placeholder="Search by applicant, pet, or shelter name..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
					/>
				</div>
				
				<div className="filter-container">
					<select
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
						className="status-filter"
					>
						<option value="">All Statuses</option>
						<option value="pending">Pending</option>
						<option value="approved">Approved</option>
						<option value="rejected">Rejected</option>
					</select>
				</div>
			</div>

			<div className="adoptions-stats">
				<span>Total Requests: {filteredRequests.length}</span>
				<span>Pending: {filteredRequests.filter(r => r.status === 'pending').length}</span>
				<span>Approved: {filteredRequests.filter(r => r.status === 'approved').length}</span>
				<span>Rejected: {filteredRequests.filter(r => r.status === 'rejected').length}</span>
			</div>

			<div className="adoptions-table-container">
				<table className="adoptions-table">
					<thead>
						<tr>
							<th>Pet</th>
							<th>Applicant</th>
							<th>Shelter</th>
							<th>Status</th>
							<th>Applied</th>
							<th>Experience</th>
							<th>Living Situation</th>
						</tr>
					</thead>
					<tbody>
						{filteredRequests.map(request => (
							<tr key={request._id}>
								<td>
									<div className="pet-info">
										{request.petImage && (
											<img 
												src={request.petImage} 
												alt={request.petName}
												className="pet-thumbnail" 
											/>
										)}
										<div>
											<div className="pet-name">{request.petName}</div>
											<div className="pet-details">{request.petBreed}</div>
										</div>
									</div>
								</td>
								<td>
									<div className="applicant-info">
										<div className="applicant-name">{request.applicantName}</div>
										<div className="applicant-email">{request.applicantEmail}</div>
										{request.applicantPhone && (
											<div className="applicant-phone">{request.applicantPhone}</div>
										)}
									</div>
								</td>
								<td>
									<div className="shelter-name">{request.shelterName}</div>
								</td>
								<td>
									<span 
										className="status-badge"
										style={{ backgroundColor: getStatusColor(request.status) }}
									>
										{request.status}
									</span>
								</td>
								<td>{formatDate(request.createdAt)}</td>
								<td>
									<div className="experience-info">
										<strong>Experience:</strong> {request.experience || 'Not specified'}
									</div>
									{request.previousPets && (
										<div className="previous-pets">
											<strong>Previous pets:</strong> {request.previousPets}
										</div>
									)}
								</td>
								<td>
									<div className="living-info">
										<div><strong>Type:</strong> {request.livingType || 'Not specified'}</div>
										{request.hasYard && (
											<div><strong>Yard:</strong> Yes</div>
										)}
										{request.children && (
											<div><strong>Children:</strong> Yes</div>
										)}
										{request.otherPets && (
											<div><strong>Other pets:</strong> Yes</div>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredRequests.length === 0 && (
				<div className="no-requests">
					No adoption requests found matching your search criteria.
				</div>
			)}
		</motion.div>
	);
};

export default AdminAdoptions;