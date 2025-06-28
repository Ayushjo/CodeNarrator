import fs from "fs-extra";
import path from "path";

export const getMarkdownDoc = async (req, res) => {
  try {
    const { filename } = req.params;
    const docPath = path.join("generated_docs", filename);

    if (!(await fs.pathExists(docPath))) {
      return res.status(404).json({ message: "Documentation file not found" });
    }

    const content = await fs.readFile(docPath, "utf-8");

    res.status(200).json({
      message: "Documentation retrieved successfully",
      filename: filename,
      content: content,
      contentType: "markdown",
    });
  } catch (error) {
    console.error("Error retrieving documentation:", error);
    res.status(500).json({
      message: "Failed to retrieve documentation",
      error: error.message,
    });
  }
};
