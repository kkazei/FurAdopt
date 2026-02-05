import mongoose from "mongoose";

const petSchema = new mongoose.Schema(
	{
		type: { type: String, enum: ["cat", "dog"], required: true },
		breed: { type: String, required: true },
		age: { type: Number, required: true },
		size: { type: String, enum: ["small", "medium", "large"], required: true },
		healthStatus: { type: String, required: true },
		description: { type: String, default: "" },
		status: { type: String, enum: ["available", "adopted"], default: "available" },
		adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
		images: [{ type: String }],
	},
	{ timestamps: true }
);

export const Pet = mongoose.model("Pet", petSchema);
