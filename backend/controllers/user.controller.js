import { User } from "../models/user.model.js";

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
		const { name, location, age, bio } = req.body;
		const update = {};
		if (name !== undefined) update.name = name;
		if (location !== undefined) update.location = location;
		if (age !== undefined) update.age = age;
		if (bio !== undefined) update.bio = bio;

		const user = await User.findByIdAndUpdate(req.userId, update, { new: true }).select("-password");
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		res.status(200).json({ success: true, user });
	} catch (error) {
		console.error("Error updating profile", error);
		res.status(500).json({ success: false, message: "Failed to update profile" });
	}
};
