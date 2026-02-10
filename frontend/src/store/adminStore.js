import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/admin" : "/api/admin";

axios.defaults.withCredentials = true;

export const useAdminStore = create((set, get) => ({
	users: [],
	pets: [],
	adoptionRequests: [],
	stats: {
		totalUsers: 0,
		totalShelters: 0,
		totalPets: 0,
		totalAdoptions: 0,
	},
	isLoading: false,
	error: null,

	// Get dashboard statistics
	getDashboardStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/dashboard-stats`);
			set({ stats: response.data.stats, isLoading: false });
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error fetching dashboard stats", 
				isLoading: false 
			});
		}
	},

	// Get all users
	getAllUsers: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/users`);
			set({ users: response.data.users, isLoading: false });
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error fetching users", 
				isLoading: false 
			});
		}
	},

	// Get all pets
	getAllPets: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/pets`);
			set({ pets: response.data.pets, isLoading: false });
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error fetching pets", 
				isLoading: false 
			});
		}
	},

	// Get all adoption requests
	getAllAdoptionRequests: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/adoption-requests`);
			set({ adoptionRequests: response.data.requests, isLoading: false });
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error fetching adoption requests", 
				isLoading: false 
			});
		}
	},

	// Delete a user
	deleteUser: async (userId) => {
		set({ isLoading: true, error: null });
		try {
			await axios.delete(`${API_URL}/users/${userId}`);
			const currentUsers = get().users;
			set({ 
				users: currentUsers.filter(user => user._id !== userId), 
				isLoading: false 
			});
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error deleting user", 
				isLoading: false 
			});
			throw error;
		}
	},

	// Delete a pet
	deletePet: async (petId) => {
		set({ isLoading: true, error: null });
		try {
			await axios.delete(`${API_URL}/pets/${petId}`);
			const currentPets = get().pets;
			set({ 
				pets: currentPets.filter(pet => pet._id !== petId), 
				isLoading: false 
			});
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error deleting pet", 
				isLoading: false 
			});
			throw error;
		}
	},

	// Update user role
	updateUserRole: async (userId, newRole) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/users/${userId}/role`, { role: newRole });
			const currentUsers = get().users;
			set({ 
				users: currentUsers.map(user => 
					user._id === userId ? { ...user, role: newRole } : user
				), 
				isLoading: false 
			});
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error updating user role", 
				isLoading: false 
			});
			throw error;
		}
	},

	// Create a shelter (admin)
	createShelter: async (payload) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/users/shelter`, payload);
			const currentUsers = get().users;
			set({ users: [response.data.user, ...currentUsers], isLoading: false });
			return response.data.user;
		} catch (error) {
			set({ 
				error: error.response?.data?.message || "Error creating shelter", 
				isLoading: false 
			});
			throw error;
		}
	},

	// Clear error
	clearError: () => set({ error: null }),
}));