export interface Question {
  id: string;
  questionNumber: string;
  type: "multiple_choice" | "short_answer" | "long_form";
  points: number;
  prompt: string;
  contextImages?: string[];
  options?: string[];
  markSchemeCriteria: string[];
}

export interface PaperMetadata {
  curriculum: string;
  subject: string;
  year: number;
  paperNumber: string;
  totalPoints: number;
  durationMinutes: number;
}

export interface PastPaper {
  id: string;
  metadata: PaperMetadata;
  questions: Question[];
}

export type AnswerMap = Record<string, string>;
