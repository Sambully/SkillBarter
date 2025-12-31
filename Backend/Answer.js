import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', required: true },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    content: { type: String, required: true },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser' }],
    replies: [{
        content: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Answer", AnswerSchema);
