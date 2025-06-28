import fs from "fs-extra";
import path from "path";
import { generatePdfFromText } from "../utils/generatePdf.js";
import { supabase } from "../supabaseConfig.js";

export const generatePdfDoc = async (req, res) => {
  const { filename } = req.params;
  const docPath = path.join("generated_docs", filename);

  if (!(await fs.pathExists(docPath))) {
    return res.status(404).json({ message: "File not found" });
  }

  const content = await fs.readFile(docPath, "utf-8");
  const pdfPath = path.join("generated_pdfs", filename.replace(".md", ".pdf"));

  await generatePdfFromText(content, pdfPath);

  const pdfBuffer = await fs.readFile(pdfPath);
  const fileName = `${Date.now()}-${filename.replace(".md", ".pdf")}`;

  const { data, error } = await supabase.storage
    .from("pdfs")
    .upload(fileName, pdfBuffer, {
      contentType: "application/pdf",
    });

  if (error) {
    return res.status(500).json({ message: "Upload failed", error });
  }

  const { data: urlData } = supabase.storage
    .from("pdfs")
    .getPublicUrl(fileName);

  // Optionally clean up local file
  await fs.remove(pdfPath);

  res.status(200).json({
    message: "PDF generated and uploaded",
    url: urlData.publicUrl,
  });
};
