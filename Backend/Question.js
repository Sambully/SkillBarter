import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillUser', required: true },
    content: { type: String, required: true },
    answers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Answer' }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Question", QuestionSchema);
