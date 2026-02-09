import { useEffect, useState } from "react";
import { useAdminStore } from "../../store/adminStore";
import "./AdminUsers.css";

const AdminUsers = () => {
	const { 
		users, 
		getAllUsers, 
		deleteUser, 
		updateUserRole,
		createShelter, 
		isLoading, 
		error, 
		clearError 
	} = useAdminStore();
	
	const [selectedRole, setSelectedRole] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showCreateShelterModal, setShowCreateShelterModal] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);
	const [shelterForm, setShelterForm] = useState({
		email: "",
		password: "",
		shelterName: "",
		shelterAddress: "",
		shelterPhone: "",
		shelterDescription: ""
	});
	const [createError, setCreateError] = useState(null);
	const [createSuccess, setCreateSuccess] = useState(null);

	useEffect(() => {
		getAllUsers();
	}, [getAllUsers]);

	const filteredUsers = users.filter(user => {
		const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
			user.shelterName?.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesRole = selectedRole === "" || user.role === selectedRole;
		
		return matchesSearch && matchesRole;
	});

	const handleRoleChange = async (userId, newRole) => {
		try {
			await updateUserRole(userId, newRole);
		} catch (error) {
			console.error("Failed to update user role:", error);
		}
	};

	const handleDeleteClick = (user) => {
		setUserToDelete(user);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (userToDelete) {
			try {
				await deleteUser(userToDelete._id);
				setShowDeleteModal(false);
				setUserToDelete(null);
			} catch (error) {
				console.error("Failed to delete user:", error);
			}
		}
	};

	const handleCreateShelter = async (e) => {
		e.preventDefault();
		setCreateError(null);
		setCreateSuccess(null);

		if (!shelterForm.email || !shelterForm.password || !shelterForm.shelterName) {
			setCreateError("Email, password, and shelter name are required");
			return;
		}

		try {
			await createShelter(shelterForm);
			setCreateSuccess("Shelter account created successfully! Verification email sent.");
			setShelterForm({
				email: "",
				password: "",
				shelterName: "",
				shelterAddress: "",
				shelterPhone: "",
				shelterDescription: ""
			});
			setTimeout(() => {
				setShowCreateShelterModal(false);
				setCreateSuccess(null);
			}, 2000);
		} catch (error) {
			setCreateError(error.message || "Failed to create shelter account");
		}
	};

	const handleShelterFormChange = (e) => {
		setShelterForm({ ...shelterForm, [e.target.name]: e.target.value });
	};

	const getRoleColor = (role) => {
		switch (role) {
			case "admin": return "#e74c3c";
			case "shelter": return "#3498db";
			case "user": return "#2ecc71";
			default: return "#95a5a6";
		}
	};

	if (isLoading) {
		return <div className="loader">Loading users...</div>;
	}

	return (
		<div className="admin-users">
			<div className="users-header">

				<button 
					className="create-shelter-btn"
					onClick={() => setShowCreateShelterModal(true)}
				>
					+ Create Shelter
				</button>
				<h1>User Management</h1>
				<p>Manage all platform users and their roles</p>
			</div>

			{error && (
				<div className="error-banner">
					{error}
					<button onClick={clearError} className="close-error">×</button>
				</div>
			)}

			<div className="users-controls">
				<div className="search-container">
					<input
						type="text"
						placeholder="Search users by name or email..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
					/>
				</div>
				
				<div className="filter-container">
					<select
						value={selectedRole}
						onChange={(e) => setSelectedRole(e.target.value)}
						className="role-filter"
					>
						<option value="">All Roles</option>
						<option value="user">Users</option>
						<option value="shelter">Shelters</option>
						<option value="admin">Admins</option>
					</select>
				</div>
			</div>

			<div className="users-stats">
				<span>Total Users: {filteredUsers.length}</span>
				<span>Regular Users: {filteredUsers.filter(u => u.role === 'user').length}</span>
				<span>Shelters: {filteredUsers.filter(u => u.role === 'shelter').length}</span>
				<span>Admins: {filteredUsers.filter(u => u.role === 'admin').length}</span>
			</div>

			<div className="users-table-container">
				<table className="users-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Email</th>
							<th>Role</th>
							<th>Joined</th>
							<th>Verified</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{filteredUsers.map(user => (
							<tr key={user._id}>
								<td>
									<div className="user-info">
										<div className="user-avatar">
											{(user.name || user.shelterName || user.email)[0].toUpperCase()}
										</div>
										<div>
											<div className="user-name">
												{user.role === 'shelter' ? user.shelterName : user.name}
											</div>
											{user.role === 'shelter' && user.shelterAddress && (
												<div className="user-location">{user.shelterAddress}</div>
											)}
										</div>
									</div>
								</td>
								<td>{user.email}</td>
								<td>
									<select
										value={user.role}
										onChange={(e) => handleRoleChange(user._id, e.target.value)}
										className="role-selector"
										style={{ color: getRoleColor(user.role) }}
									>
										<option value="user">User</option>
										<option value="shelter">Shelter</option>
										<option value="admin">Admin</option>
									</select>
								</td>
								<td>{new Date(user.createdAt).toLocaleDateString()}</td>
								<td>
									<span className={`verification-badge ${user.isVerified ? 'verified' : 'unverified'}`}>
										{user.isVerified ? '✓ Verified' : '⚠ Unverified'}
									</span>
								</td>
								<td>
									<div className="action-buttons">
										<button 
											className="delete-btn"
											onClick={() => handleDeleteClick(user)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{filteredUsers.length === 0 && (
				<div className="no-users">
					No users found matching your search criteria.
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{showDeleteModal && (
				<div className="modal-overlay">
					<div className="modal">
						<h3>Confirm Delete</h3>
						<p>
							Are you sure you want to delete{" "}
							<strong>
								{userToDelete?.role === 'shelter' 
									? userToDelete?.shelterName 
									: userToDelete?.name}
							</strong>?
						</p>
						<p className="warning">This action cannot be undone.</p>
						<div className="modal-actions">
							<button 
								className="cancel-btn"
								onClick={() => {
									setShowDeleteModal(false);
									setUserToDelete(null);
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

			{/* Create Shelter Modal */}
			{showCreateShelterModal && (
				<div className="modal-overlay">
					<div className="modal create-shelter-modal">
						<h3>Create Shelter Account</h3>
						<p className="modal-description">
							Add a new shelter to the platform. A verification email will be sent.
						</p>

						{createError && (
							<div className="error-alert">
								{createError}
							</div>
						)}

						{createSuccess && (
							<div className="success-alert">
								{createSuccess}
							</div>
						)}

						<form onSubmit={handleCreateShelter}>
							<div className="form-group">
								<label htmlFor="shelterName">Shelter Name *</label>
								<input
									type="text"
									id="shelterName"
									name="shelterName"
									value={shelterForm.shelterName}
									onChange={handleShelterFormChange}
									placeholder="Happy Paws Shelter"
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="email">Email *</label>
								<input
									type="email"
									id="email"
									name="email"
									value={shelterForm.email}
									onChange={handleShelterFormChange}
									placeholder="contact@shelter.com"
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="password">Password *</label>
								<input
									type="password"
									id="password"
									name="password"
									value={shelterForm.password}
									onChange={handleShelterFormChange}
									placeholder="Min. 6 characters"
									minLength={6}
									required
								/>
							</div>

							<div className="form-group">
								<label htmlFor="shelterAddress">Address</label>
								<input
									type="text"
									id="shelterAddress"
									name="shelterAddress"
									value={shelterForm.shelterAddress}
									onChange={handleShelterFormChange}
									placeholder="123 Main Street, City, State"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="shelterPhone">Phone</label>
								<input
									type="tel"
									id="shelterPhone"
									name="shelterPhone"
									value={shelterForm.shelterPhone}
									onChange={handleShelterFormChange}
									placeholder="(555) 123-4567"
								/>
							</div>

							<div className="form-group">
								<label htmlFor="shelterDescription">Description</label>
								<textarea
									id="shelterDescription"
									name="shelterDescription"
									value={shelterForm.shelterDescription}
									onChange={handleShelterFormChange}
									placeholder="Tell us about the shelter..."
									rows="3"
									style={{ resize: "vertical" }}
								/>
							</div>

							<div className="modal-actions">
								<button 
									type="button"
									className="cancel-btn"
									onClick={() => {
										setShowCreateShelterModal(false);
										setShelterForm({
											email: "",
											password: "",
											shelterName: "",
											shelterAddress: "",
											shelterPhone: "",
											shelterDescription: ""
										});
										setCreateError(null);
										setCreateSuccess(null);
									}}
								>
									Cancel
								</button>
								<button 
									type="submit"
									className="create-btn"
									disabled={isLoading}
								>
									{isLoading ? "Creating..." : "Create Shelter"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminUsers;