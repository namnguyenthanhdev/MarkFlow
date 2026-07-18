"use client";

import { useStore } from "@nanostores/react";
import { $currentQuestionIndex, $answers, setAnswer } from "@/stores/exam";
import { MultipleChoice } from "./MultipleChoice";
import { FreeResponse } from "./FreeResponse";
import type { PastPaper } from "@/types";

interface WorkspacePanelProps {
  paper: PastPaper;
}

export function WorkspacePanel({ paper }: WorkspacePanelProps) {
  const currentIndex = useStore($currentQuestionIndex);
  const answers = useStore($answers);
  const question = paper.questions[currentIndex];
  const answer = answers[question.id] || "";

  if (question.type === "multiple_choice" && question.options) {
    return (
      <div className="p-6">
        <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Select one answer
        </h3>
        <MultipleChoice
          options={question.options}
          selected={answer || null}
          onSelect={(value) => setAnswer(question.id, value)}
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
        onChange={(value) => setAnswer(question.id, value)}
        minChars={question.type === "long_form" ? 50 : undefined}
      />
    </div>
  );
}
