import { create } from "zustand";
import axios from "axios";

const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

axios.defaults.withCredentials = true;

export const usePetStore = create((set) => ({
	pets: [],
	stats: { totalAvailable: 0 },
	isLoading: false,
	error: null,

	fetchPets: async (filters = {}) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_BASE}/pets`, { params: filters });
			set({ pets: response.data.pets, isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to load pets", isLoading: false });
		}
	},

	fetchStats: async () => {
		try {
			const response = await axios.get(`${API_BASE}/pets/stats`);
			set({ stats: response.data.stats });
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to load stats" });
		}
	},
}));
