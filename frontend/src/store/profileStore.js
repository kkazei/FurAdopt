import { create } from "zustand";
import axios from "axios";

const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";
axios.defaults.withCredentials = true;

export const useProfileStore = create((set) => ({
	profile: null,
	isLoading: false,
	error: null,
	message: null,

	fetchProfile: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_BASE}/profile`);
			set({ profile: response.data.user, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Failed to load profile",
			});
		}
	},

	updateProfile: async (payload) => {
		set({ isLoading: true, error: null, message: null });
		try {
			const response = await axios.put(`${API_BASE}/profile`, payload);
			set({ profile: response.data.user, isLoading: false, message: "Profile updated" });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Failed to update profile",
			});
			throw error;
		}
	},
}));
