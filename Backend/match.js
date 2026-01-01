import express from "express";
import SkillUser from "./SkillUser.js";
import { embed } from "./gemini.js";

const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { query, filterType = 'skill' } = req.body;

        // Fetch all users first (needed for both logic paths)
        const users = await SkillUser.find();

        // If no query, return all users (random sort or latest)
        if (!query || query.trim() === "") {
            return res.json(users.map(u => ({ ...u.toObject(), score: 0 })));
        }

        let results = [];

        if (filterType === 'name') {
            // Simple Regex Search for Username
            const regex = new RegExp(query, 'i');
            results = users
                .filter(u => regex.test(u.username))
                .map(u => ({ ...u.toObject(), score: 1 })); // High score for direct name match
        } else {
            // Default: Skill Search (Semantic + Keyword)
            let scored = [];
            try {
                const queryVec = await embed(query);
                // Semantic Search
                if (queryVec) {
                    scored = users.map(u => {
                        if (!u.embedding || u.embedding.length === 0) return { user: u, score: 0 };
                        const dotProduct = queryVec.reduce((s, v, i) => s + v * u.embedding[i], 0);
                        return { user: u, score: dotProduct };
                    });
                }
            } catch (err) {
                console.warn("Embedding failed, falling back to keyword search", err.message);
            }

            // Fallback: Keyword Search if semantic score is low or failed
            const regex = new RegExp(query, 'i');

            // If scored is empty (embedding failed), map users to default score
            if (scored.length === 0) {
                scored = users.map(u => ({ user: u, score: 0 }));
            }

            // Boost score if keyword matches skill or username
            scored = scored.map(item => {
                let boost = 0;
                const u = item.user;
                // Check skills (ONLY TEACH SKILLS)
                if (u.skills.some(s => s.type === 'teach' && regex.test(s.name))) boost += 0.5;
                // Check bio
                if (regex.test(u.bio)) boost += 0.2;

                return { ...item, score: item.score + boost };
            });

            results = scored
                .filter(item => item.score > 0.1) // Lower threshold to include keyword matches
                .sort((a, b) => b.score - a.score)
                .map(item => ({ ...item.user.toObject(), score: item.score }));
        }

        res.json(results);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

export default router;
