import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/adoption-requests" : "/api/adoption-requests";

axios.defaults.withCredentials = true;

export const useShelterAdoptionStore = create((set) => ({
	requests: [],
	adoptedPets: [],
	isLoading: false,
	error: null,
	message: null,

	fetchShelterRequests: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/shelter/requests`);
			set({ requests: response.data.requests, isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching requests", isLoading: false });
		}
	},

	updateRequestStatus: async (requestId, status) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/shelter/requests/${requestId}`, { status });
			set((state) => ({
				requests: state.requests.map((req) =>
					req._id === requestId ? response.data.request : req
				),
				isLoading: false,
				message: response.data.message,
			}));
			return response.data.request;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error updating request", isLoading: false });
			throw error;
		}
	},

	scheduleVisit: async (requestId, visitDate) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/shelter/requests/${requestId}/schedule`, { visitDate });
			set((state) => ({
				requests: state.requests.map((req) =>
					req._id === requestId ? response.data.request : req
				),
				isLoading: false,
				message: response.data.message,
			}));
			return response.data.request;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error scheduling visit", isLoading: false });
			throw error;
		}
	},

	fetchShelterAdoptedPets: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/shelter/adopted`);
			set({ adoptedPets: response.data.pets, isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching adopted pets", isLoading: false });
		}
	},

	clearMessage: () => set({ message: null }),
	clearError: () => set({ error: null }),
}));
