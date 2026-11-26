"use client";

export interface ImportedFile {
  name: string;
  kind: "java" | "pdf" | "text";
  text: string;
}

export async function readImportedFile(file: File): Promise<ImportedFile> {
  const lower = file.name.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return { name: file.name, kind: "pdf", text: await extractPdfText(file) };
  }
  const text = (await file.text()).replace(/\r\n/g, "\n");
  return { name: file.name, kind: lower.endsWith(".java") ? "java" : "text", text };
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    let line = "";
    const lines: string[] = [];
    for (const item of content.items) {
      if (!("str" in item)) continue;
      line += item.str;
      if (item.hasEOL) {
        lines.push(line);
        line = "";
      }
    }
    if (line) lines.push(line);
    pages.push(lines.join("\n").trim());
  }
  return pages.filter(Boolean).join("\n\n");
}
