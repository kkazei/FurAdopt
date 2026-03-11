import mongoose from "mongoose";

const adoptionRequestSchema = new mongoose.Schema(
	{
		pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
		user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		status: { type: String, enum: ["pending", "visit_scheduled", "approved", "rejected"], default: "pending" },
		visitDate: { type: Date },
		note: { type: String },
	},
	{ timestamps: true }
);

export const AdoptionRequest = mongoose.model("AdoptionRequest", adoptionRequestSchema);
