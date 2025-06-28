import express from "express";
import multer from "multer";
import { handleUploadAndGenerateDocs } from "../controllers/docController.js";
import { getMarkdownDoc } from "../controllers/pdfController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Generate documentation from uploaded ZIP
router.post(
  "/generate",
  upload.single("projectZip"),
  handleUploadAndGenerateDocs
);

// Get markdown documentation
router.get("/docs/:filename", getMarkdownDoc);

export default router;
