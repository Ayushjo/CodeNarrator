import fs from "fs-extra";
import unzipper from "unzipper";
import path from "path";
import axios from "axios";


async function extractZip(filePath, extractTo) {
  await fs.ensureDir(extractTo);
  await fs
    .createReadStream(filePath)
    .pipe(unzipper.Extract({ path: extractTo }))
    .promise();
  console.log("Extracted files:", fs.readdirSync(extractTo));
  return extractTo;
}

function parseFiles(dir) {
  const results = [];
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...parseFiles(fullPath));
    } else if (file.endsWith(".js") || file.endsWith(".ts")) {
      const code = fs.readFileSync(fullPath, "utf-8");
      results.push({ file: fullPath, content: code });
    }
  }
  return results;
}

export const handleUploadAndGenerateDocs = async (req, res) => {
  try {
    console.log("🚀 Starting documentation generation...");

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const zipPath = req.file.path;
    const extractTo = `parsed_code/${Date.now()}`;
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ message: "Missing OpenRouter API key" });
    }

    console.log("📂 Extracting ZIP file...");
    await extractZip(zipPath, extractTo);

    console.log("📄 Parsing files...");
    const files = parseFiles(extractTo);

    if (files.length === 0) {
      return res.status(400).json({ message: "No JS/TS files found." });
    }

    console.log(`Found ${files.length} files to process`);
    const docs = [];

    for (const file of files) {
      const prompt = `Generate clean, readable, and well-structured documentation for the following JavaScript/TypeScript code. Include:
- Purpose
- Functionality
- Parameters and return values
- Example usages
- Any dependencies

Format the response in clean markdown.

Code:
\`\`\`
${file.content}
\`\`\``;

      try {
        console.log(`🔁 Processing file: ${path.basename(file.file)}`);

        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "anthropic/claude-3-haiku",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 2000,
            temperature: 0.7,
          },
          {
            headers: {
              Authorization: `Bearer ${OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "http://localhost:5000",
              "X-Title": "ZenDocs Generator",
            },
            timeout: 60000,
          }
        );

        const summary =
          response.data?.choices?.[0]?.message?.content ||
          "No summary returned";

        docs.push({
          file: path.basename(file.file),
          fullPath: file.file,
          summary,
          status: "success",
        });

        console.log(`✅ Documented: ${path.basename(file.file)}`);
      } catch (err) {
        console.error(`❌ Failed for ${file.file}:`, err.message);

        if (err.response) {
          console.error(`Status: ${err.response.status}`);
          console.error(`Response:`, err.response.data);
        }

        docs.push({
          file: path.basename(file.file),
          fullPath: file.file,
          summary: `⚠️ Failed to generate documentation: ${err.message}`,
          status: "error",
        });
      }

   
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const fullDocumentation = docs
      .map(
        (d) =>
          `## ${d.file}\n\n**File Path:** \`${d.fullPath}\`\n\n${d.summary}`
      )
      .join("\n\n" + "---".repeat(20) + "\n\n");

    const docPath = `generated_docs/docs-${Date.now()}.md`;
    await fs.outputFile(docPath, fullDocumentation);

    console.log("📄 Documentation generated successfully!");

    try {
      await fs.remove(zipPath);
      await fs.remove(extractTo);
    } catch (cleanupErr) {
      console.warn(
        "Warning: Failed to clean up temporary files:",
        cleanupErr.message
      );
    }

    res.status(200).json({
      message: "Documentation generated successfully",
      processedFiles: files.length,
      successfulFiles: docs.filter((d) => d.status === "success").length,
      documentation: fullDocumentation,
      files: docs.map((d) => ({
        file: d.file,
        fullPath: d.fullPath,
        hasDocumentation: d.status === "success",
        summary: d.summary,
      })),
    });
  } catch (err) {
    console.error("❌ Fatal error:", err.message);
    res.status(500).json({
      message: "Unexpected error occurred",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};
