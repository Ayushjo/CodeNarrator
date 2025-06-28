import express from "express";
import multer from "multer";
import { handleUploadAndGenerateDocs } from "../controllers/docController.js";
import { generatePdfDoc } from "../controllers/pdfController.js";
import axios from "axios";

const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

router.post(
  "/generate",
  upload.single("projectZip"),
  handleUploadAndGenerateDocs
);


router.get("/download/:filename", generatePdfDoc);



export default router;
