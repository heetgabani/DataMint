const express = require("express");
const multer = require("multer");
const csvParser = require("csv-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: "http://localhost:3000",
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

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (data) => results.push(data))
        .on("end", () => {
            res.json({
                message: "File uploaded successfully",
                data: results,
                apiEndpoint: `/api/${req.file.filename}`,
            });
        });
});

// Dynamic API Generator from CSV
app.get("/api/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }

    const results = [];
    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (data) => results.push(data))
        .on("end", () => {
            res.json(results);
        });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
