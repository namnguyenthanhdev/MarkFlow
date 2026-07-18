"use client";

import type { Question } from "@/types";
import { MultipleChoice } from "./MultipleChoice";
import { FreeResponse } from "./FreeResponse";

interface WorkspacePanelProps {
  question: Question;
  answer: string;
  onAnswerChange: (value: string) => void;
}

export function WorkspacePanel({
  question,
  answer,
  onAnswerChange,
}: WorkspacePanelProps) {
  if (question.type === "multiple_choice" && question.options) {
    return (
      <div className="p-6">
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Select one answer
        </h3>
        <MultipleChoice
          options={question.options}
          selected={answer || null}
          onSelect={onAnswerChange}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-6">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {question.type === "short_answer" ? "Write your answer" : "Write your detailed answer"}
      </h3>
      <FreeResponse
        value={answer || ""}
        onChange={onAnswerChange}
        minChars={question.type === "long_form" ? 50 : undefined}
      />
    </div>
  );
}
