import { User } from "../models/user.model.js";
import { sendPushToSubscriptions } from "../utils/push.js";

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		res.status(200).json({ success: true, user });
	} catch (error) {
		console.error("Error fetching profile", error);
		res.status(500).json({ success: false, message: "Failed to fetch profile" });
	}
};

export const updateProfile = async (req, res) => {
	try {
		const {
			name,
			location,
			age,
			bio,
			shelterName,
			shelterAddress,
			shelterPhone,
			shelterDescription,
			profilePicture,
		} = req.body;

		const update = {};
		if (name !== undefined) update.name = name;
		if (location !== undefined) update.location = location;
		if (age !== undefined) update.age = Number.isNaN(Number(age)) ? undefined : Number(age);
		if (bio !== undefined) update.bio = bio;
		if (shelterName !== undefined) update.shelterName = shelterName;
		if (shelterAddress !== undefined) update.shelterAddress = shelterAddress;
		if (shelterPhone !== undefined) update.shelterPhone = shelterPhone;
		if (shelterDescription !== undefined) update.shelterDescription = shelterDescription;
		if (profilePicture !== undefined) update.profilePicture = profilePicture;

		const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password");
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		res.status(200).json({ success: true, user });
	} catch (error) {
		console.error("Error updating profile", error);
		res.status(500).json({ success: false, message: "Failed to update profile" });
	}
};

export const uploadProfilePicture = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ success: false, message: "No file uploaded" });
		}

		const profilePictureUrl = req.file?.path || req.file?.secure_url || req.file?.url;

		const user = await User.findByIdAndUpdate(
			req.userId,
			{ profilePicture: profilePictureUrl },
			{ new: true }
		).select("-password");

		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		res.status(200).json({ success: true, user, profilePicture: profilePictureUrl });
	} catch (error) {
		console.error("Error uploading profile picture", error);
		res.status(500).json({ success: false, message: "Failed to upload profile picture" });
	}
};

export const savePushSubscription = async (req, res) => {
	try {
		const { subscription } = req.body;
		if (!subscription?.endpoint) {
			return res.status(400).json({ success: false, message: "Subscription endpoint is required" });
		}

		const user = await User.findById(req.userId).select("pushSubscriptions");
		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		const exists = user.pushSubscriptions?.some((sub) => sub.endpoint === subscription.endpoint);
		if (!exists) {
			user.pushSubscriptions = [...(user.pushSubscriptions || []), subscription];
			await user.save();
		}

		res.status(200).json({ success: true, message: "Subscription saved" });
	} catch (error) {
		console.error("Error saving subscription", error);
		res.status(500).json({ success: false, message: "Failed to save subscription" });
	}
};

export const removePushSubscription = async (req, res) => {
	try {
		const { endpoint } = req.body;
		if (!endpoint) return res.status(400).json({ success: false, message: "Endpoint is required" });

		await User.findByIdAndUpdate(req.userId, {
			$pull: { pushSubscriptions: { endpoint } },
		});

		res.status(200).json({ success: true, message: "Subscription removed" });
	} catch (error) {
		console.error("Error removing subscription", error);
		res.status(500).json({ success: false, message: "Failed to remove subscription" });
	}
};

// Helper endpoint to test push notifications for the authenticated user
export const sendTestPush = async (req, res) => {
	try {
		await sendPushToSubscriptions(req.userId, {
			title: "FurAdopt Notifications Enabled",
			body: "You will receive adoption updates on this device.",
			icon: "/icons/icon-192x192.png",
			badge: "/icons/icon-192x192.png",
		});
		res.status(200).json({ success: true, message: "Test notification queued" });
	} catch (error) {
		console.error("Error sending test push", error);
		res.status(500).json({ success: false, message: "Failed to send test notification" });
	}
};
