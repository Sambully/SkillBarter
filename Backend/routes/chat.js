import express from "express";
import Message from "../Message.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get chat history with specific user
router.get("/:userId", auth, async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, recipient: userId },
                { sender: userId, recipient: currentUserId }
            ]
        }).sort({ timestamp: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default router;
