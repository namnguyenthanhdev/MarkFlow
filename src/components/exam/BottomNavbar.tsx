"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

interface BottomNavbarProps {
  currentQuestion: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function BottomNavbar({
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
}: BottomNavbarProps) {
  const isFirst = currentQuestion === 0;
  const isLast = currentQuestion === totalQuestions - 1;

  return (
    <footer className="flex items-center justify-between border-t bg-background px-6 py-3">
      <Button
        variant="outline"
        size="sm"
        disabled={isFirst}
        onClick={onPrevious}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </Button>

      <span className="text-xs text-muted-foreground">
        Question {currentQuestion + 1} of {totalQuestions}
      </span>

      {isLast ? (
        <Button size="sm" onClick={onSubmit}>
          <Send className="h-4 w-4" />
          Submit Exam
        </Button>
      ) : (
        <Button size="sm" onClick={onNext}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </footer>
  );
}
