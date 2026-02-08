import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		type: { type: String, enum: ["cat", "dog"], required: true },
		breed: { type: String, required: true },
		age: { type: Number, required: true },
		size: { type: String, enum: ["small", "medium", "large"], required: true },
		healthStatus: { type: String, required: true },
		description: { type: String, default: "" },
		petFriendly: { type: Boolean, default: false },
		childFriendly: { type: Boolean, default: false },
		status: { type: String, enum: ["available", "adopted"], default: "available" },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		images: [{ type: String }],
	},
	{ timestamps: true }
);

export const Pet = mongoose.model("Pet", petSchema);
