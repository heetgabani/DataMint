const express = require("express");
const multer = require("multer");
const firebaseAdmin = require("firebase-admin");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { bucket } = require('./firebaseConfig'); // Import the bucket

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ CORS Configuration for Production
app.use(cors({
    origin: "https://data-mint.vercel.app", // Allow frontend requests
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("🚀 Firebase Storage for CSV Files is Running!");
});

// ✅ Multer Configuration (for File Upload)
const upload = multer({ storage: multer.memoryStorage() }); // Store file in memory

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;

    try {
        // Upload file to Firebase Storage
        await bucket.upload(req.file.buffer, {
            destination: fileName, // The file will be stored in Firebase with the unique file name
            public: true, // Make the file public for access
        });

        // Respond with the file URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

        res.json({
            message: "File uploaded successfully",
            apiEndpoint: `/api/${fileName}`,
            fileUrl: publicUrl, // Return file URL after upload
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ error: "Failed to upload file" });
    }
});

// ✅ Fetch CSV File Data (from Firebase Storage)
app.get("/api/:filename", async (req, res) => {
    const fileName = req.params.filename;

    try {
        const file = bucket.file(fileName);
        const [exists] = await file.exists();

        if (!exists) {
            return res.status(404).json({ error: "File not found" });
        }

        // Get a signed URL to download the file
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491', // URL expiration date (very far future)
        });

        res.json({ downloadURL: url });
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({ error: "Error fetching file from Firebase" });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
