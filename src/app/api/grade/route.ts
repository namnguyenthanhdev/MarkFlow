import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { Type } from "@google/genai";
import type { Question, QuestionGrade } from "@/types";

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    grades: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.STRING, description: "The id of the question being graded" },
          awardedPoints: {
            type: Type.NUMBER,
            description: "Marks awarded, between 0 and the question's points",
          },
          criteria: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                criterion: { type: Type.STRING, description: "The mark scheme criterion, copied verbatim" },
                met: { type: Type.BOOLEAN, description: "Whether the student's answer satisfies this criterion" },
                note: { type: Type.STRING, description: "One short sentence justifying the decision" },
              },
              required: ["criterion", "met", "note"],
            },
          },
          feedback: {
            type: Type.STRING,
            description: "Concise, constructive feedback for the student on this question",
          },
        },
        required: ["questionId", "awardedPoints", "criteria", "feedback"],
      },
    },
  },
  required: ["grades"],
};

const SYSTEM_INSTRUCTION = `You are a strict but fair examiner grading student answers against an official mark scheme.

Rules:
1. Grade EACH question independently and ONLY against its provided markSchemeCriteria — do not invent new criteria.
2. For every criterion, decide whether the student's answer satisfies it (met = true/false) and give a one-sentence justification.
3. Award marks proportional to the criteria met, never exceeding the question's maximum points. Do not award marks for content not requested by the mark scheme.
4. For multiple_choice, award full marks only if the selected option matches the correct answer; otherwise award zero.
5. If the student did not answer, award zero and mark all criteria as not met.
6. Be objective and consistent; ignore spelling/grammar unless the criterion is about terminology.
7. Return exactly one grade object per question, echoing its questionId.`;

interface GradeRequestQuestion extends Question {
  studentAnswer: string;
}

interface RawCriterion {
  criterion: string;
  met: boolean;
  note: string;
}

interface RawGrade {
  questionId: string;
  awardedPoints: number;
  criteria: RawCriterion[];
  feedback: string;
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const questions = body.questions as GradeRequestQuestion[] | undefined;

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "questions array is required" },
        { status: 400 }
      );
    }

    const gradingInput = questions.map((q) => ({
      id: q.id,
      questionNumber: q.questionNumber,
      type: q.type,
      points: q.points,
      prompt: q.prompt,
      options: q.options,
      correctAnswer: q.correctAnswer,
      markSchemeCriteria: q.markSchemeCriteria,
      studentAnswer: q.studentAnswer ?? "",
    }));

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Grade the student's answers against the mark scheme. Here are the questions with their mark scheme criteria and the student's answers:\n\n${JSON.stringify(
        gradingInput,
        null,
        2
      )}`,
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

    const parsed = JSON.parse(rawJson) as { grades: RawGrade[] };
    const rawGrades = Array.isArray(parsed.grades) ? parsed.grades : [];
    const gradeById = new Map(rawGrades.map((g) => [g.questionId, g]));

    const grades: QuestionGrade[] = questions.map((q) => {
      const g = gradeById.get(q.id);
      return {
        questionId: q.id,
        maxPoints: q.points,
        awardedPoints: clamp(Math.round((g?.awardedPoints ?? 0) * 2) / 2, 0, q.points),
        criteria: (g?.criteria ?? q.markSchemeCriteria.map((criterion) => ({
          criterion,
          met: false,
          note: "Not graded.",
        }))).map((c) => ({
          criterion: c.criterion,
          met: Boolean(c.met),
          note: c.note ?? "",
        })),
        feedback: g?.feedback ?? "",
      };
    });

    const totalAwarded = grades.reduce((sum, g) => sum + g.awardedPoints, 0);
    const totalPoints = grades.reduce((sum, g) => sum + g.maxPoints, 0);

    return NextResponse.json(
      { data: { grades, totalAwarded, totalPoints } },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/grade error:", error);

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
