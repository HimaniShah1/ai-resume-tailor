/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { extractPdfText } from "../../../utils/extractPdfText";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get("resume") as File | null;
    const jobDescription = formData.get("jobDescription") as string;

    if (!resumeFile) {
      return NextResponse.json({ error: "Missing resume" }, { status: 400 });
    }

    const buffer = await resumeFile.arrayBuffer();
    const resumeText = await extractPdfText(buffer);

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You tailor resumes without adding new skills or fake experience.
Only rewrite or reorganize existing resume content.
`
        },
        {
          role: "user",
          content: `
Resume:
${resumeText}

Job Description:
${jobDescription}

Return tailored resume in markdown format.
`
        }
      ]
    });

    return NextResponse.json({
      tailoredResume: response.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("API ERROR →", error);
    return NextResponse.json(
      { error: "Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
