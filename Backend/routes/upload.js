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
    params: async (req, file) => {
        const isRaw = ["pdf", "docx", "doc", "txt"].includes(file.mimetype.split("/")[1]) || file.mimetype === "application/pdf";
        return {
            folder: "skillbarter_chat",
            allowed_formats: ["jpg", "png", "jpeg", "webp", "gif", "pdf", "docx", "doc", "txt", "mp4", "mov"],
            resource_type: isRaw ? "raw" : "auto"
        };
    }
});

const upload = multer({ storage });

// Wrapper to handle Multer errors
const uploadMiddleware = upload.single("file");

router.post("/", (req, res) => {
    uploadMiddleware(req, res, (err) => {
        if (err) {
            console.error("❌ Multer/Cloudinary Error:", err);
            // Check for specific Cloudinary errors
            if (err.message && err.message.includes("Cloudinary")) {
                return res.status(500).json({ message: "Cloudinary Upload Failed: " + err.message });
            }
            return res.status(500).json({ message: "File upload failed: " + err.message });
        }

        try {
            if (!req.file) {
                console.error("No file received in upload request");
                return res.status(400).json({ message: "No file uploaded" });
            }

            console.log("File uploaded successfully:", req.file);

            // Return the Cloudinary URL and resource type
            const fileType = req.file.mimetype || req.file.resource_type || "unknown";

            res.json({
                fileUrl: req.file.path || req.file.secure_url,
                fileType: fileType
            });
        } catch (error) {
            console.error("Result processing error:", error);
            res.status(500).json({ message: "Processing failed" });
        }
    });
});

// Test route
router.get("/test", (req, res) => {
    res.json({
        message: "Upload route is working",
        cloudNameConfigured: !!process.env.CLOUDINARY_CLOUD_NAME
    });
});

export default router;
