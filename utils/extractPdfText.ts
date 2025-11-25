/* eslint-disable @typescript-eslint/no-explicit-any */

import PDFParser from "pdf2json";

function safeDecode(s: string): string {
  try {
    return decodeURIComponent(s);
  } catch (err) {
    try {
      // fallback: replace percent sequences safely
      return s.replace(/%([0-9A-Fa-f]{2})/g, (match) => {
        try {
          return String.fromCharCode(parseInt(match.slice(1), 16));
        } catch {
          return match;
        }
      });
    } catch {
      return s;
    }
  }
}

export async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    // Convert browser ArrayBuffer -> Node Buffer
    const nodeBuffer = Buffer.from(buffer);

    pdfParser.on("pdfParser_dataError", (err: any) => {
      reject(err?.parserError || err);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
      try {
        let text = "";

        (pdfData?.Pages || []).forEach((page: any) => {
          (page.Texts || []).forEach((t: any) => {
            // t.R array contains pieces
            (t.R || []).forEach((r: any) => {
              const encoded = r?.T ?? "";
              const decoded = safeDecode(encoded);
              text += decoded + " ";
            });
          });
          text += "\n";
        });

        resolve(text.trim());
      } catch (err) {
        reject(err);
      }
    });

    pdfParser.parseBuffer(nodeBuffer);
  });
}
