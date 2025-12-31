import express from "express";
import Question from "../Question.js";
import Answer from "../Answer.js";
import SkillUser from "../SkillUser.js";

const router = express.Router();

// Create a new question
router.post("/create", async (req, res) => {
    try {
        const { userId, content } = req.body;
        const question = await Question.create({ author: userId, content });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: "Failed to create question", error: error.message });
    }
});

// Get all questions with answers
router.get("/all", async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('author', 'username')
            .populate({
                path: 'answers',
                populate: [
                    { path: 'author', select: 'username' },
                    { path: 'replies.author', select: 'username' }
                ]
            })
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch questions", error: error.message });
    }
});

// Post an answer
router.post("/answer/:questionId", async (req, res) => {
    try {
        const { questionId } = req.params;
        const { userId, content } = req.body;

        const answer = await Answer.create({ author: userId, question: questionId, content });

        await Question.findByIdAndUpdate(questionId, { $push: { answers: answer._id } });

        // populate author for immediate display
        await answer.populate('author', 'username');

        res.status(201).json(answer);
    } catch (error) {
        res.status(500).json({ message: "Failed to post answer", error: error.message });
    }
});

// Reply to an answer
router.post("/reply/:answerId", async (req, res) => {
    try {
        const { answerId } = req.params;
        const { userId, content } = req.body;

        const answer = await Answer.findByIdAndUpdate(
            answerId,
            { $push: { replies: { author: userId, content } } },
            { new: true }
        ).populate('replies.author', 'username');

        res.json(answer);
    } catch (error) {
        res.status(500).json({ message: "Failed to reply", error: error.message });
    }
});

// Upvote an answer
router.post("/upvote/:answerId", async (req, res) => {
    try {
        const { answerId } = req.params;
        const { userId } = req.body;

        const answer = await Answer.findById(answerId);
        if (!answer) return res.status(404).json({ message: "Answer not found" });

        if (answer.upvotedBy.includes(userId)) {
            return res.status(400).json({ message: "Already upvoted" });
        }

        answer.upvotedBy.push(userId);
        await answer.save();

        // Check for credit reward (every 10 upvotes)
        if (answer.upvotedBy.length % 10 === 0) {
            await SkillUser.findByIdAndUpdate(answer.author, { $inc: { credits: 1 } });
        }

        res.json({ upvotedBy: answer.upvotedBy });
    } catch (error) {
        res.status(500).json({ message: "Failed to upvote", error: error.message });
    }
});

export default router;
