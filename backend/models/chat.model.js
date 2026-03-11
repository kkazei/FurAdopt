import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
	{
		participants: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		}],
		messages: [{
			sender: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true
			},
			content: {
				type: String,
				required: true
			},
			timestamp: {
				type: Date,
				default: Date.now
			},
			read: {
				type: Boolean,
				default: false
			},
			readAt: {
				type: Date,
				default: null
			},
			readBy: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				default: null
			}
		}],
		adoptionRequest: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "AdoptionRequest"
		},
		pet: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Pet"
		},
		lastMessage: {
			content: String,
			timestamp: { type: Date, default: Date.now },
			sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
		}
	},
	{ timestamps: true }
);

// Index for faster queries
chatSchema.index({ participants: 1 });
chatSchema.index({ "messages.timestamp": -1 });

export const Chat = mongoose.model("Chat", chatSchema);