"use client";

import { useStore } from "@nanostores/react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { $currentQuestionIndex, goToNext, goToPrevious, submitExam } from "@/stores/exam";
import { stopTimer } from "@/stores/timer";
import type { PastPaper } from "@/types";

interface BottomNavbarProps {
  paper: PastPaper;
}

export function BottomNavbar({ paper }: BottomNavbarProps) {
  const currentIndex = useStore($currentQuestionIndex);
  const totalQuestions = paper.questions.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;

  function handleSubmit() {
    stopTimer();
    submitExam();
  }

  return (
    <footer className="flex items-center justify-between border-t bg-background px-6 py-3">
      <Button
        variant="outline"
        size="sm"
        disabled={isFirst}
        onClick={goToPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-xs text-muted-foreground">
        Question {currentIndex + 1} of {totalQuestions}
      </span>

      {isLast ? (
        <Button size="sm" onClick={handleSubmit}>
          <Send className="h-4 w-4" />
          Submit Exam
        </Button>
      ) : (
        <Button size="sm" onClick={() => goToNext(totalQuestions)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </footer>
  );
}
