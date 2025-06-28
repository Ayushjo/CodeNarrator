// utils/generatePdf.js
import { marked } from "marked";
import puppeteer from "puppeteer";
import fs from "fs-extra";

export const generatePdfFromText = async (markdownText, outputPath) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.7;
          color: #2c3e50;
          background: #ffffff;
          font-size: 14px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .container {
          max-width: 100%;
          margin: 0 auto;
          padding: 0;
        }

        /* Typography */
        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
          margin-bottom: 1rem;
          margin-top: 2rem;
          color: #1a202c;
          letter-spacing: -0.02em;
        }

        h1 {
          font-size: 2.5rem;
          margin-top: 0;
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 3px solid #3b82f6;
          color: #1e40af;
        }

        h2 {
          font-size: 1.875rem;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
          color: #2563eb;
        }

        h3 {
          font-size: 1.5rem;
          color: #374151;
        }

        h4 {
          font-size: 1.25rem;
          color: #4b5563;
        }

        h5, h6 {
          font-size: 1.125rem;
          color: #6b7280;
        }

        p {
          margin-bottom: 1.25rem;
          text-align: justify;
          hyphens: auto;
        }

        /* Lists */
        ul, ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }

        li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        ul li {
          list-style-type: none;
          position: relative;
        }

        ul li::before {
          content: "•";
          color: #3b82f6;
          font-weight: bold;
          position: absolute;
          left: -1.5rem;
          font-size: 1.2em;
        }

        ol li {
          counter-increment: item;
        }

        /* Code blocks */
        pre {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        code {
          background: #f1f5f9;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
          color: #e11d48;
          border: 1px solid #e2e8f0;
        }

        pre code {
          background: none;
          padding: 0;
          border: none;
          color: #374151;
        }

        /* Blockquotes */
        blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #4b5563;
          background: #f8fafc;
          padding: 1rem 1.5rem;
          border-radius: 0 8px 8px 0;
          position: relative;
        }

        blockquote::before {
          content: """;
          font-size: 4rem;
          color: #3b82f6;
          position: absolute;
          left: 0.5rem;
          top: -0.5rem;
          opacity: 0.3;
        }

        /* Tables */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          font-size: 0.95rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          border-radius: 8px;
          overflow: hidden;
        }

        th {
          background: #3b82f6;
          color: white;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        tr:nth-child(even) {
          background: #f8fafc;
        }

        tr:hover {
          background: #f1f5f9;
        }

        /* Links */
        a {
          color: #3b82f6;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: all 0.2s ease;
        }

        a:hover {
          border-bottom-color: #3b82f6;
        }

        /* Horizontal rules */
        hr {
          border: none;
          height: 2px;
          background: linear-gradient(to right, #3b82f6, #8b5cf6, #3b82f6);
          margin: 2rem 0;
          border-radius: 1px;
        }

        /* Images */
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          margin: 1rem 0;
        }

        /* Strong and emphasis */
        strong {
          font-weight: 700;
          color: #1f2937;
        }

        em {
          font-style: italic;
          color: #4b5563;
        }

        /* Page breaks */
        @page {
          margin: 0;
          size: A4;
        }

        @media print {
          body {
            margin: 40px 30px;
          }
          
          h1, h2, h3, h4, h5, h6 {
            page-break-after: avoid;
          }
          
          pre, blockquote, table {
            page-break-inside: avoid;
          }
          
          img {
            page-break-inside: avoid;
          }
        }

        /* Custom classes for enhanced styling */
        .highlight {
          background: linear-gradient(120deg, #fef3c7 0%, #fef3c7 100%);
          background-repeat: no-repeat;
          background-size: 100% 0.2em;
          background-position: 0 88%;
          padding: 0.125rem 0;
        }

        .badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          color: #1e40af;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0.25rem 0.25rem 0.25rem 0;
        }

        /* Print optimizations */
        .page-break {
          page-break-before: always;
        }

        .no-break {
          page-break-inside: avoid;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${marked.parse(markdownText)}
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? "/opt/render/.cache/puppeteer/chrome/linux-*/chrome-linux*/chrome"
        : undefined,
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "load" });

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: { top: "40px", bottom: "40px", left: "30px", right: "30px" },
    preferCSSPageSize: true,
  });

  await browser.close();
};
