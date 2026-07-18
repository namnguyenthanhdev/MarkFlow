import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { Type } from "@google/genai";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    metadata: {
      type: Type.OBJECT,
      properties: {
        curriculum: { type: Type.STRING, description: "e.g. Cambridge International A-Level" },
        subject: { type: Type.STRING, description: "e.g. Biology" },
        year: { type: Type.INTEGER, description: "Exam year, e.g. 2024" },
        paperNumber: { type: Type.STRING, description: "e.g. Paper 4 (Extended)" },
        totalPoints: { type: Type.INTEGER, description: "Sum of all question points" },
        durationMinutes: { type: Type.INTEGER, description: "Exam duration in minutes" },
      },
      required: ["curriculum", "subject", "year", "paperNumber", "totalPoints", "durationMinutes"],
    },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique ID, e.g. q1, q2a, q3b" },
          questionNumber: { type: Type.STRING, description: "e.g. 1, 2a, 3b" },
          type: {
            type: Type.STRING,
            enum: ["multiple_choice", "short_answer", "long_form"],
            description: "Categorize the question type",
          },
          points: { type: Type.INTEGER, description: "Point value for this question" },
          prompt: { type: Type.STRING, description: "Full question text, including any tables or data" },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Only for multiple_choice — the list of answer choices",
          },
          markSchemeCriteria: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Distinct checklist items from the mark scheme for AI grading",
          },
        },
        required: ["id", "questionNumber", "type", "points", "prompt", "markSchemeCriteria"],
      },
    },
  },
  required: ["metadata", "questions"],
};

const SYSTEM_INSTRUCTION = `You are an elite academic parser. Analyze the provided exam text and extract its structure into JSON.

Rules:
1. Identify and extract every question exactly as written. Preserve the original wording, tables, and data.
2. Categorize the type accurately:
   - "multiple_choice": has discrete lettered/numbered options (A, B, C, D etc.)
   - "short_answer": expects a brief response, typically 1-3 sentences or a definition
   - "long_form": multi-part questions requiring extended writing, data analysis, or experimental reasoning
3. Calculate the point value from any [N marks] or (N) notation in the text.
4. Generate markSchemeCriteria as distinct atomic checklist items based on the marking guidance provided in the text or implied by the question. Each criterion should be one verifiable point.
5. For MCQ options, include the full option text including its label (e.g. "A. The cell membrane").
6. If totalPoints is not explicitly stated, sum the points from all questions.
7. If durationMinutes is not explicitly stated, estimate 90 minutes as a reasonable default.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Parse the following exam paper into the structured JSON format:\n\n${text}`,
      config: {
        responseMimeType: "application/json",
        responseSchema,
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    const rawJson = response.text;

    if (!rawJson) {
      return NextResponse.json(
        { error: "Gemini returned an empty response" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(rawJson);

    return NextResponse.json({ data: parsed }, { status: 200 });
  } catch (error) {
    console.error("POST /api/parse-paper error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse Gemini response as JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
