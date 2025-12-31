import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Configure Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    console.error("❌ CRITICAL ERROR: Missing Cloudinary Credentials in Backend/.env");
    console.error("CLOUDINARY_CLOUD_NAME:", cloudName ? "SET" : "MISSING");
    console.error("CLOUDINARY_API_KEY:", apiKey ? "SET" : "MISSING");
    console.error("CLOUDINARY_API_SECRET:", apiSecret ? "SET" : "MISSING");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "skillbarter_chat",
        allowed_formats: ["jpg", "png", "jpeg", "pdf", "docx", "mp4"], // Adjust as needed
        resource_type: "auto" // Detects image/video/raw
    }
});

const upload = multer({ storage });

router.post("/", upload.single("file"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        // Return the Cloudinary URL and resource type
        res.json({
            fileUrl: req.file.path,
            fileType: req.file.resource_type // 'image', 'video', 'raw'
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed" });
    }
});

export default router;
