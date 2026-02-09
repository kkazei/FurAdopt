import axios from "axios";

// Ensure cookies (auth) are sent with push subscription calls
axios.defaults.withCredentials = true;

const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000" : "";
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
	const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = window.atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
};

export const registerServiceWorker = async () => {
	if (!("serviceWorker" in navigator)) return null;
	try {
		const registration = await navigator.serviceWorker.register("/sw.js");
		return registration;
	} catch (error) {
		console.error("Service worker registration failed", error);
		return null;
	}
};

export const ensurePushSubscription = async () => {
	if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
	if (!VAPID_PUBLIC_KEY) {
		console.warn("Missing VAPID public key; skipping push subscription");
		return null;
	}

	const permission = await Notification.requestPermission();
	if (permission !== "granted") {
		console.warn("Push permission not granted", permission);
		return null;
	}

	const registration = await navigator.serviceWorker.ready;
	let subscription = await registration.pushManager.getSubscription();

	if (!subscription) {
		subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
		});
	}

	// Persist subscription to backend (profile routes)
	await axios.post(`${API_BASE}/api/profile/push-subscribe`, { subscription });

	// Fire a lightweight test notification so the user sees it is enabled
	try {
		await axios.post(`${API_BASE}/api/profile/push-test`);
	} catch (err) {
		console.warn("Test push failed", err?.response?.data || err?.message || err);
	}
	return subscription;
};
