"use client";

import { useStore } from "@nanostores/react";
import { Badge } from "@/components/ui/badge";
import { $currentQuestionIndex } from "@/stores/exam";
import { $formatted } from "@/stores/timer";
import type { PastPaper } from "@/types";

interface TopNavbarProps {
  paper: PastPaper;
}

export function TopNavbar({ paper }: TopNavbarProps) {
  const currentIndex = useStore($currentQuestionIndex);
  const timerDisplay = useStore($formatted);
  const totalQuestions = paper.questions.length;
  const progressPct = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <header className="flex items-center gap-4 border-b bg-background px-6 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="truncate text-sm font-semibold">{paper.metadata.subject}</h1>
        <Badge variant="secondary" className="shrink-0">
          {paper.metadata.curriculum}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {paper.metadata.year} &middot; {paper.metadata.paperNumber}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Progress</span>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Time</span>
          <span className="min-w-[4.5rem] text-right font-mono text-sm tabular-nums">
            {timerDisplay}
          </span>
        </div>
      </div>
    </header>
  );
}
