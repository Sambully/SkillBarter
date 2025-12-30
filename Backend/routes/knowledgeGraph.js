import express from "express";
import SkillUser from "../SkillUser.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const users = await SkillUser.find({}, 'username skills bio embedding');

        // Prepare nodes (users)
        const nodes = users.map(u => ({
            id: u._id,
            name: u.username,
            group: u.skills.some(s => s.type === 'teach') ? 1 : 2 // 1: Teacher, 2: Learner (simplistic)
        }));

        // Prepare links (matches based on simple skill name overlap or high semantic similarity)
        // For performance, we'll do simple name matching here for now.
        const links = [];
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                const u1 = users[i];
                const u2 = users[j];

                // Check if u1 teaches what u2 needs
                const u1Teaches = u1.skills.filter(s => s.type === 'teach').map(s => s.name);
                const u2Learns = u2.skills.filter(s => s.type === 'learn').map(s => s.name);

                const match1 = u1Teaches.some(skill => u2Learns.includes(skill));

                // Check if u2 teaches what u1 needs
                const u2Teaches = u2.skills.filter(s => s.type === 'teach').map(s => s.name);
                const u1Learns = u1.skills.filter(s => s.type === 'learn').map(s => s.name);

                const match2 = u2Teaches.some(skill => u1Learns.includes(skill));

                if (match1 || match2) {
                    links.push({ source: u1._id, target: u2._id, value: 1 });
                }
            }
        }

        res.json({ nodes, links });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default router;
