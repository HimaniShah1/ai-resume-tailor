/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { extractPdfText } from "@/utils/extractPdfText";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export async function POST(req: NextRequest) {

  try {
    const form = await req.formData();

    const resumeFile = form.get("resume") as File | null;
    const jobDescription = (form.get("jobDescription") as string) || "";

    if (!resumeFile) {
      return NextResponse.json({ error: "Missing resume" }, { status: 400 });
    }

    const buffer = await resumeFile.arrayBuffer();

    const resumeText = await extractPdfText(buffer);

    // MOCK toggle
    if (process.env.MOCK_OPENAI === "true") {
      console.log("Returning MOCK RESPONSE");
      return NextResponse.json({
        mocked: true,
        extractedResume: resumeText.slice(0, 500),
        tailoredResume: "--MOCK--\n" + resumeText.slice(0, 400),
      });
    }

    // Real OpenAI call
    const key = process.env.OPENAI_API_KEY;

    if (!key) {
      return NextResponse.json({ error: "Missing key" }, { status: 500 });
    }

    const body = {
      model: "gpt-4o-mini",
      temperature: 0,
      messages: [
        {
          role: "system",
          content:
            `You are a resume tailoring engine. Follow these rules:

1. Do NOT add fake skills or experiences that do not exist in the resume.
2. You MAY strengthen, rewrite, reorganize, or highlight existing experience to match the job description.
3. You MAY rephrase bullet points using terminology in the JD, as long as the meaning stays true.
4. You MAY change the order of skills and sections to emphasize relevance.
5. You MUST keep the content factually correct.`,
        },
        {
          role: "user",
          content: `Resume:\n${resumeText}\n\nJD:\n${jobDescription}\n\nReturn tailored resume in markdown format.`,
        },
      ],
    };


    const openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });


    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      return NextResponse.json({ error: "OpenAI error", details: err }, { status: 500 });
    }

    const json = await openaiRes.json();

    const content = json?.choices?.[0]?.message?.content;
    return NextResponse.json({ tailoredResume: content });
  } catch (err: any) {
    return NextResponse.json({ error: "Server Error", details: String(err) }, { status: 500 });
  }
}
