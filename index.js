import express from "express";

import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import docRoutes from "./routes/docRoutes.js";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use("/api/docs", docRoutes);

connectDB()
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () => {
      console.log("Server running on port", process.env.PORT);
    });
  })
  .catch((err) => console.error(err));


