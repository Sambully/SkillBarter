import mongoose from "mongoose";

const MessageRequestSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    scheduledTime: { type: Date }, // Optional: when they want to chat
    note: { type: String }, // Optional: why they want to connect
    isCompleted: { type: Boolean, default: false },
    activeSessionInitiator: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', default: null }, // Tracks who started the video call
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("MessageRequest", MessageRequestSchema);
