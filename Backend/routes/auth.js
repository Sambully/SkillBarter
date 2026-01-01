import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SkillUser from "../SkillUser.js";
import { embed, generateBio } from "../gemini.js";

const router = express.Router();

// Helper to generate embedding text from skills
const generateSkillText = (skills) => {
    const teaches = skills.filter(s => s.type === 'teach').map(s => s.name).join(", ");
    const learns = skills.filter(s => s.type === 'learn').map(s => s.name).join(", ");
    return `Can teach: ${teaches}. Wants to learn: ${learns}. Bio: ${skills.bio || ''}`;
};

router.post("/signup", async (req, res) => {
    try {
        const { username, email, password, bio, skills } = req.body;

        const existingUser = await SkillUser.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);

        // Calculate bio if not provided
        if (!bio || bio.trim() === "") {
            console.log("Bio is empty, attempting to generate one...");
            try {
                const generatedBio = await generateBio(skills || []);
                console.log("Received generated bio in auth:", generatedBio);
                if (generatedBio) {
                    req.body.bio = generatedBio; // Update bio in request body or just use local var
                }
            } catch (error) {
                console.error("Failed to generate bio:", error);
            }
        } else {
            console.log("Bio provided:", bio);
        }

        // Use the potentially updated bio
        const finalBio = req.body.bio || bio;

        // Generate embedding based on skills
        // We assume skills is an array of { name, type, level }
        let embedding = [];
        try {
            const skillText = generateSkillText(skills || []);
            embedding = await embed(skillText);
        } catch (error) {
            console.error("Embedding generation failed:", error);
            // Proceed without embedding, can be computed later
        }

        const result = await SkillUser.create({
            username,
            email,
            password: hashedPassword,
            bio: finalBio,
            skills,
            embedding,
            credits: 5 // Initial credits
        });

        console.log("User Created:", result); // Debug log

        const token = jwt.sign({ email: result.email, id: result._id }, "test", { expiresIn: "1h" });

        res.status(200).json({ result, token });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await SkillUser.findOne({ email });
        if (!existingUser) return res.status(404).json({ message: "User not found" });

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, "test", { expiresIn: "1h" });

        res.status(200).json({ result: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Get current user details
router.get("/me", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, "test");
        const user = await SkillUser.findById(decoded.id);

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
});

// Update Profile
router.put("/update", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, "test");
        const userId = decoded.id;

        const { username, bio, skills, gender, phone } = req.body;

        const user = await SkillUser.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Update basic fields
        if (username) user.username = username;
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (phone) user.phone = phone;
        if (skills) user.skills = skills;

        // Re-generate embedding if skills or bio changed
        // For simplicity, we regenerate if skills are provided
        if (skills || bio) {
            try {
                const skillText = generateSkillText(user.skills || []);
                const embedding = await embed(skillText);
                if (embedding) user.embedding = embedding;
            } catch (error) {
                console.error("Embedding update failed:", error);
            }
        }

        await user.save();

        res.json(user);
    } catch (error) {
        console.error("Update failed", error);
        res.status(500).json({ message: "Update failed" });
    }
});

export default router;
