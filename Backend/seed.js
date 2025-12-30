import mongoose from "mongoose";
import dotenv from "dotenv";
import SkillUser from "./SkillUser.js";

dotenv.config();

const users = [
    {
        username: "Alice_Code",
        email: "alice@example.com",
        password: "hashedpassword123", // In real app, hash this. This is for dev.
        bio: "Full stack developer loving generic UI/UX.",
        skills: [
            { name: "React", type: "teach", level: 5 },
            { name: "Node.js", type: "teach", level: 4 },
            { name: "Python", type: "learn", level: 1 }
        ],
        credits: 10
    },
    {
        username: "Bob_Builder",
        email: "bob@example.com",
        password: "hashedpassword123",
        bio: "Civil engineer turned Python enthusiast.",
        skills: [
            { name: "Python", type: "teach", level: 2 },
            { name: "AutoCAD", type: "teach", level: 5 },
            { name: "React", type: "learn", level: 1 }
        ],
        credits: 5
    },
    {
        username: "Charlie_Design",
        email: "charlie@example.com",
        password: "hashedpassword123",
        bio: "I teach design principles and want to learn coding.",
        skills: [
            { name: "Figma", type: "teach", level: 5 },
            { name: "UI/UX", type: "teach", level: 5 },
            { name: "HTML", type: "learn", level: 2 }
        ],
        credits: 8
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Connected to DB");
        await SkillUser.deleteMany({ email: { $in: users.map(u => u.email) } });
        await SkillUser.insertMany(users);
        console.log("Seeded successfully");
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
