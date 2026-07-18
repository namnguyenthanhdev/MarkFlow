"use client";

import { useState, useCallback } from "react";
import type { PastPaper, AnswerMap } from "@/types";
import { useTimer } from "@/hooks/useTimer";
import { TopNavbar } from "./TopNavbar";
import { QuestionCard } from "./QuestionCard";
import { WorkspacePanel } from "./WorkspacePanel";
import { BottomNavbar } from "./BottomNavbar";
import { SubmissionSummary } from "./SubmissionSummary";

interface ExamViewProps {
  paper: PastPaper;
}

export function ExamView({ paper }: ExamViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const { formatted, stop } = useTimer(paper.metadata.durationMinutes);

  const currentQuestion = paper.questions[currentQuestionIndex];

  const handleAnswerChange = useCallback((value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }, [currentQuestion.id]);

  const goToNext = useCallback(() => {
    if (currentQuestionIndex < paper.questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  }, [currentQuestionIndex, paper.questions.length]);

  const goToPrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    stop();
    setSubmitted(true);
  }, [stop]);

  const handleReset = useCallback(() => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSubmitted(false);
  }, []);

  if (submitted) {
    return <SubmissionSummary paper={paper} answers={answers} onReset={handleReset} />;
  }

  return (
    <div className="flex h-dvh flex-col">
      <TopNavbar
        metadata={paper.metadata}
        currentQuestion={currentQuestionIndex}
        totalQuestions={paper.questions.length}
        timerDisplay={formatted}
      />

      <div className="flex min-h-0 flex-1">
        <div className="w-[45%] overflow-y-auto border-r bg-muted/20">
          <QuestionCard question={currentQuestion} />
        </div>
        <div className="flex w-[55%] flex-col overflow-y-auto">
          <WorkspacePanel
            question={currentQuestion}
            answer={answers[currentQuestion.id] || ""}
            onAnswerChange={handleAnswerChange}
          />
        </div>
      </div>

      <BottomNavbar
        currentQuestion={currentQuestionIndex}
        totalQuestions={paper.questions.length}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
