const express = require("express");
const multer = require("multer");
const Papa = require("papaparse"); // Import PapaParse
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: "https://data-mint.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const newFilename = `${Date.now()}-${file.originalname}`;
        cb(null, newFilename);
    },
});
const upload = multer({ storage });

// Endpoint to upload and process CSV
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const results = [];
    const filePath = path.join(__dirname, "uploads", req.file.filename);

    // Read file and use PapaParse to parse CSV
    const fileStream = fs.createReadStream(filePath);
    Papa.parse(fileStream, {
        header: true, // Use the first row as headers
        skipEmptyLines: true, // Skip empty lines
        complete: (parsedData) => {
            // Store parsed data
            results.push(...parsedData.data);
            // Delete the uploaded file after processing
            fs.unlinkSync(filePath);
            res.json({
                message: "File uploaded successfully",
                data: results,
                apiEndpoint: `/api/${req.file.filename}`,
            });
        },
        error: (err) => {
            console.error("Error parsing CSV file:", err);
            res.status(500).json({ error: "Error parsing CSV file" });
        }
    });
});

// Dynamic API Generator from CSV
app.get("/api/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const results = [];
    const fileStream = fs.createReadStream(filePath);

    // Parse the CSV file using PapaParse
    Papa.parse(fileStream, {
        header: true, // Use the first row as headers
        skipEmptyLines: true, // Skip empty lines
        complete: (parsedData) => {
            results.push(...parsedData.data);
            res.json(results);
        },
        error: (err) => {
            console.error("Error parsing CSV file:", err);
            res.status(500).json({ error: "Error parsing CSV file" });
        }
    });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
