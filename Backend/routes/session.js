import express from "express";
import SkillUser from "../SkillUser.js";

const router = express.Router();

/**
 * Start a learning session
 * Rules:
 * - Learner must have ≥ 1 credit
 * - Credit is deducted
 * - Meet link is generated
 */
router.post("/start", async (req, res) => {
    const { learnerId, teacherId } = req.body;

    const learner = await SkillUser.findById(learnerId);
    if (!learner) return res.status(404).send("Learner not found");

    if (learner.credits <= 0) {
        return res.status(403).send("Insufficient credits");
    }

    // Deduct credit
    learner.credits -= 1;
    await learner.save();

    // Generate Meet link (MVP)
    const meetLink = "https://meet.google.com/new";

    res.json({
        message: "Session started",
        meetLink
    });
});

export default router;
