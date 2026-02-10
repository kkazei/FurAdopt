import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

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
			const updatedUser = response.data.user;
			const { setUser } = useAuthStore.getState();
			if (setUser) setUser(updatedUser);
			set({ profile: updatedUser, isLoading: false, message: "Profile updated" });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Failed to update profile",
			});
			throw error;
		}
	},

	uploadProfilePicture: async (file) => {
		set({ isLoading: true, error: null, message: null });
		try {
			const formData = new FormData();
			formData.append("profilePicture", file);

			const response = await axios.post(`${API_BASE}/profile/profile-picture`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			const updatedUser = response.data.user;
			const { setUser } = useAuthStore.getState();
			if (setUser) setUser(updatedUser);
			set({ profile: updatedUser, isLoading: false, message: "Profile picture updated" });
			return response.data.profilePicture;
		} catch (error) {
			set({
				isLoading: false,
				error: error.response?.data?.message || "Failed to upload profile picture",
			});
			throw error;
		}
	},
}));
