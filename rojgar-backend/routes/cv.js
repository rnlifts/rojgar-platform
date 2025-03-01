const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
require("dotenv").config();

// Configure multer to store the file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST endpoint to upload and process a CV
router.post("/upload", upload.single("cv"), async (req, res) => {
    try {
        console.log("📥 Received file upload request.");

        // Check if a file is uploaded
        if (!req.file) {
            console.error("❌ No file received.");
            return res.status(400).json({ error: "No file uploaded" });
        }

        // Extract text from the uploaded PDF
        const pdfBuffer = req.file.buffer;
        const data = await pdfParse(pdfBuffer);
        console.log("✅ PDF parsing successful. Extracted text (first 100 chars):", data.text.substring(0, 100));

        // Ensure the API key is available
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) {
            console.error("❌ Missing Claude API Key.");
            return res.status(500).json({ error: "Server configuration error: Missing API Key" });
        }

        // Create a prompt for Claude to extract structured info
        const prompt = `
        Extract the following details from the CV text:
        - Name
        - Email
        - Contact number
        - Short bio (max 2 lines)
        - Education history (brief)
        - Skills (comma-separated)
        - Experience (brief, max 3 points)
        - Any other details should be summarized in one short sentence.

        Ensure the response is in JSON format and does not exceed 1000 words.
        CV Text:
        """${data.text}"""
        `;

        // Prepare the payload for the Anthropic (Claude) API
        const payload = {
            model: "claude-3-5-sonnet-20241022", 
            max_tokens: 1024,
            messages: [{ role: "user", content: prompt }],
        };

        console.log("🔍 Sending extracted text to Anthropic API...");
        
        // Make request to Claude API
        const response = await axios.post("https://api.anthropic.com/v1/messages", payload, {
            headers: {
                "x-api-key": apiKey,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
        });

        console.log("✅ Received response from Anthropic API:", response.data);

        // Handle JSON Parsing safely
        let structuredData = {};
        try {
            if (!response.data || !response.data.content || !Array.isArray(response.data.content) || response.data.content.length === 0) {
                throw new Error("Claude API response format is invalid.");
            }
            
            structuredData = JSON.parse(response.data.content[0].text);
        } catch (err) {
            console.error("❌ JSON Parsing Error:", err.message);
            return res.status(500).json({ error: "Failed to parse AI response", details: err.message });
        }

        // Send structured CV data as response
        return res.json({ result: structuredData });

    } catch (error) {
        console.error("❌ Error processing CV upload:", error.message);
        return res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

module.exports = router;
