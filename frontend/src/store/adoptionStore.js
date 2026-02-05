import { create } from "zustand";
import axios from "axios";

const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
axios.defaults.withCredentials = true;

export const useAdoptionStore = create((set) => ({
	requests: [],
	adoptedPets: [],
	isLoading: false,
	error: null,
	message: null,

	createRequest: async (petId, note) => {
		set({ isLoading: true, error: null, message: null });
		try {
			const response = await axios.post(`${API_BASE}/adoption-requests`, { petId, note });
			set({ isLoading: false, message: "Request submitted" });
			return response.data.request;
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Failed to submit request",
			});
			throw error;
		}
	},

	fetchRequests: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_BASE}/adoption-requests/my`);
			set({ requests: response.data.requests, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Failed to load requests",
			});
		}
	},

	fetchAdoptedPets: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_BASE}/adoption-requests/my/adopted`);
			set({ adoptedPets: response.data.pets, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Failed to load adopted pets",
			});
		}
	},
}));
