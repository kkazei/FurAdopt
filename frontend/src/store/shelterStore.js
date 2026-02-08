import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/pets" : "/api/pets";

axios.defaults.withCredentials = true;

export const useShelterStore = create((set) => ({
	pets: [],
	stats: {},
	isLoading: false,
	error: null,
	message: null,

	fetchMyPets: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/my-pets`);
			set({ pets: response.data.pets, isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching pets", isLoading: false });
		}
	},

	fetchShelterStats: async (options = {}) => {
		set({ isLoading: true, error: null });
		try {
			const params = new URLSearchParams();
			if (options.startDate) params.append('startDate', options.startDate);
			if (options.endDate) params.append('endDate', options.endDate);
			if (options.period) params.append('period', options.period);

			const response = await axios.get(`${API_URL}/shelter/stats?${params}`);
			set({ stats: response.data.stats, isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching stats", isLoading: false });
		}
	},

	createPet: async (petData) => {
		set({ isLoading: true, error: null });
		try {
			const config = {
				headers: {
					'Content-Type': petData instanceof FormData ? 'multipart/form-data' : 'application/json'
				}
			};
			
			const response = await axios.post(`${API_URL}`, petData, config);
			set((state) => ({
				pets: [response.data.pet, ...state.pets],
				isLoading: false,
				message: response.data.message,
			}));
			return response.data.pet;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error creating pet", isLoading: false });
			throw error;
		}
	},

	updatePet: async (id, petData) => {
		set({ isLoading: true, error: null });
		try {
			const config = {
				headers: {
					'Content-Type': petData instanceof FormData ? 'multipart/form-data' : 'application/json'
				}
			};
			
			const response = await axios.put(`${API_URL}/${id}`, petData, config);
			set((state) => ({
				pets: state.pets.map((pet) => (pet._id === id ? response.data.pet : pet)),
				isLoading: false,
				message: response.data.message,
			}));
			return response.data.pet;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error updating pet", isLoading: false });
			throw error;
		}
	},

	deletePet: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axios.delete(`${API_URL}/${id}`);
			set((state) => ({
				pets: state.pets.filter((pet) => pet._id !== id),
				isLoading: false,
				message: "Pet deleted successfully",
			}));
		} catch (error) {
			set({ error: error.response?.data?.message || "Error deleting pet", isLoading: false });
			throw error;
		}
	},

	fetchShelterStats: async (params = {}) => {
		set({ isLoading: true, error: null });
		try {
			const queryString = new URLSearchParams(params).toString();
			const response = await axios.get(`${API_URL}/shelter/stats?${queryString}`);
			set({ stats: response.data.stats, isLoading: false });
			return response.data.stats;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching stats", isLoading: false });
		}
	},

	clearMessage: () => set({ message: null }),
	clearError: () => set({ error: null }),
}));
