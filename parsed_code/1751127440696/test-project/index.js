const express = require("express");
const app = express();
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
app.listen(3000, () => console.log("Server running on 3000"));
