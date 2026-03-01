const express = require("express");
const cors = require("cors");
const chatRouter = require("./routes/chat");

const app = express();

app.use(cors()); // Fix CORS errors
app.use(express.json());

app.use("/api/chat", chatRouter);

app.listen(5000, () => console.log("Server running on port 5000"));
