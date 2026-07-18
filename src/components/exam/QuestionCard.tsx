"use client";

import Image from "next/image";
import { useStore } from "@nanostores/react";
import { $currentQuestionIndex } from "@/stores/exam";
import type { PastPaper } from "@/types";

interface QuestionCardProps {
  paper: PastPaper;
}

export function QuestionCard({ paper }: QuestionCardProps) {
  const currentIndex = useStore($currentQuestionIndex);
  const question = paper.questions[currentIndex];

  return (
    <section className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs font-medium text-muted-foreground">
            Question {question.questionNumber}
          </span>
          <h2 className="mt-0.5 text-sm text-muted-foreground">
            {question.points} point{question.points > 1 ? "s" : ""}
          </h2>
        </div>
        <span className="shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {question.type === "multiple_choice"
            ? "Multiple Choice"
            : question.type === "short_answer"
              ? "Short Answer"
              : "Long Form"}
        </span>
      </div>

      <div className="prose prose-sm max-w-none text-foreground">
        {question.prompt.split("\n").map((line, i) => (
          <p key={i} className={line.startsWith("|") ? "font-mono text-xs" : ""}>
            {line}
          </p>
        ))}
      </div>

      {question.contextImages && question.contextImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {question.contextImages.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt={`Diagram for question ${question.questionNumber}`}
              width={400}
              height={300}
              className="max-h-64 w-auto rounded-lg border object-contain"
              unoptimized
            />
          ))}
        </div>
      )}
    </section>
  );
}
