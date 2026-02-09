import webpush from "web-push";
import { User } from "../models/user.model.js";

const {
	VAPID_PUBLIC_KEY,
	VAPID_PRIVATE_KEY,
	VAPID_SUBJECT = "mailto:admin@furadopt.local",
} = process.env;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

const removeInvalidSubscription = async (userId, endpoint) => {
	try {
		await User.findByIdAndUpdate(userId, {
			$pull: { pushSubscriptions: { endpoint } },
		});
	} catch (error) {
		console.error("Failed cleaning invalid subscription", error);
	}
};

export const sendPushToSubscriptions = async (userId, payload) => {
	if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
		console.warn("VAPID keys missing; push notifications disabled");
		return;
	}

	try {
		const user = await User.findById(userId).select("pushSubscriptions");
		if (!user || !user.pushSubscriptions?.length) return;

		const sendPromises = user.pushSubscriptions.map(async (sub) => {
			try {
				await webpush.sendNotification(sub, JSON.stringify(payload));
			} catch (error) {
				// Remove subscriptions that are gone or invalid
				if (error.statusCode === 404 || error.statusCode === 410) {
					await removeInvalidSubscription(userId, sub.endpoint);
				} else {
					console.error("Error sending push notification", error);
				}
			}
		});

		await Promise.all(sendPromises);
	} catch (error) {
		console.error("Failed to send push notifications", error);
	}
};
