import { marked } from "marked";
import puppeteer from "puppeteer";
import fs from "fs-extra";

export const generatePdfFromText = async (markdownText, outputPath) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Generated Docs</title>
      <style>
        body {
          font-family: "Segoe UI", sans-serif;
          padding: 40px;
          background-color: #fdfdfd;
          color: #333;
          line-height: 1.6;
        }
        h1, h2, h3 {
          color: #2c3e50;
        }
        pre {
          background-color: #f4f4f4;
          padding: 10px;
          border-radius: 6px;
          overflow-x: auto;
        }
        code {
          background-color: #eee;
          padding: 2px 4px;
          border-radius: 4px;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      ${marked.parse(markdownText)}
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: "new", // avoids certain Chromium issues
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "40px", bottom: "40px", left: "30px", right: "30px" },
  });

  await browser.close();
};
