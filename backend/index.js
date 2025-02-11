const express = require("express");
const multer = require("multer");
const Papa = require("papaparse"); // Import PapaParse
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

// ✅ CORS Configuration for Production
app.use(cors({
    origin: "https://data-mint.vercel.app", // Allow frontend requests
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

// ✅ Configure Multer (File Upload with Size Limit)
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const newFilename = `${Date.now()}-${file.originalname}`;
        cb(null, newFilename);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10MB
});

app.get("/", (req, res) => {
    res.send("🚀 CSV to API Backend is Running!");
});

// ✅ Upload & Process CSV
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = path.join(__dirname, "uploads", req.file.filename);
    const results = [];

    // ✅ Read file and parse CSV using PapaParse
    const fileStream = fs.createReadStream(filePath);
    Papa.parse(fileStream, {
        header: true, // Use first row as headers
        skipEmptyLines: true, // Ignore empty lines
        complete: (parsedData) => {
            results.push(...parsedData.data);

            // ✅ Delete file after processing to save space
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

// ✅ Dynamic API Generator from CSV
app.get("/api/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const results = [];
    const fileStream = fs.createReadStream(filePath);

    // ✅ Parse CSV using PapaParse
    Papa.parse(fileStream, {
        header: true,
        skipEmptyLines: true,
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




// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
