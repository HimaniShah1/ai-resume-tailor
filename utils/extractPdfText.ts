/* eslint-disable @typescript-eslint/no-explicit-any */

import PDFParser from "pdf2json";

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    const bufferNode = Buffer.from(buffer);

    const safeDecode = (text: string): string => {
      try {
        return decodeURIComponent(text);
      } catch {
        return text; // fallback without crashing
      }
    };

    pdfParser.on("pdfParser_dataError", (err: any) => {
      reject(err?.parserError || "PDF parsing failed");
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      let text = "";

      pdfData.Pages.forEach((page: any) => {
        page.Texts.forEach((t: any) => {
          t.R.forEach((r: any) => {
            text += safeDecode(r.T) + " ";
          });
        });
        text += "\n";
      });

      resolve(text.trim());
    });

    pdfParser.parseBuffer(bufferNode);
  });
}