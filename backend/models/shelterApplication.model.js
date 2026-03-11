import mongoose from "mongoose";

const shelterApplicationSchema = new mongoose.Schema(
	{
		applicantName: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true }, // hashed, used when account is created on approval
		shelterName: { type: String, required: true },
		shelterAddress: { type: String, default: "" },
		shelterPhone: { type: String, default: "" },
		shelterDescription: { type: String, default: "", maxlength: 1000 },
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		},
		rejectionReason: { type: String, default: "" },
		reviewedAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

export const ShelterApplication = mongoose.model("ShelterApplication", shelterApplicationSchema);
