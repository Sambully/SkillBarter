import express from "express";
import SkillUser from "../SkillUser.js";

const router = express.Router();

router.post("/spend", async (req, res) => {
    const user = await SkillUser.findById(req.body.userId);
    if (user.credits <= 0) return res.status(403).send("No credits");
    user.credits--;
    await user.save();
    res.send("Spent");
});

router.post("/earn", async (req, res) => {
    const user = await SkillUser.findById(req.body.userId);
    user.credits++;
    await user.save();
    res.send("Earned");
});

export default router;
