import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', required: true },
    content: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String }, // 'image', 'video', 'raw'
    timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", MessageSchema);
