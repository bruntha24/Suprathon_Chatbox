const express = require("express");
const { spawn } = require("child_process");
const router = express.Router();
const path = require("path");

router.post("/", (req, res) => {
  const userQuestion = req.body.message;

  if (!userQuestion) {
    return res.status(400).json({ reply: "No question provided." });
  }

  console.log("User asked:", userQuestion);

  // Call Python script
  const pythonScript = path.join(__dirname, "../python/query.py");
  const python = spawn("python", [pythonScript, userQuestion]);

  let result = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("Python Error:", data.toString());
    errorOutput += data.toString();
  });

  python.on("close", (code) => {
    if (errorOutput) {
      return res.status(500).json({
        reply: "Error running AI model. Check backend terminal.",
      });
    }

    res.json({ reply: result.trim() || "Sorry, I couldn’t find an answer." });
  });
});

module.exports = router;
