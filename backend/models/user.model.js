import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		role: {
			type: String,
			enum: ["user", "shelter"],
			default: "user",
		},
		// User fields
		name: {
			type: String,
			required: function() {
				return this.role === "user";
			},
		},
		location: {
			type: String,
			default: "",
		},
		age: {
			type: Number,
		},
		bio: {
			type: String,
			default: "",
			maxlength: 400,
		},
		// Shelter fields
		shelterName: {
			type: String,
			required: function() {
				return this.role === "shelter";
			},
		},
		shelterAddress: {
			type: String,
			default: "",
		},
		shelterPhone: {
			type: String,
			default: "",
		},
		shelterDescription: {
			type: String,
			default: "",
			maxlength: 1000,
		},
		// Common fields
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
	},
	{ timestamps: true }
);

export const User = mongoose.model("User", userSchema);