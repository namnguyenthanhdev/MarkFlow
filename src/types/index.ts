export interface Question {
  id: string;
  questionNumber: string;
  type: "multiple_choice" | "short_answer" | "long_form";
  points: number;
  prompt: string;
  contextImages?: string[];
  options?: string[];
  markSchemeCriteria: string[];
  correctAnswer?: string;
}

export interface CriterionResult {
  criterion: string;
  met: boolean;
  note: string;
}

export interface QuestionGrade {
  questionId: string;
  awardedPoints: number;
  maxPoints: number;
  criteria: CriterionResult[];
  feedback: string;
}

export interface GradeResult {
  grades: QuestionGrade[];
  totalAwarded: number;
  totalPoints: number;
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
