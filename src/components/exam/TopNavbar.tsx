"use client";

import { Badge } from "@/components/ui/badge";
import type { PaperMetadata } from "@/types";

interface TopNavbarProps {
  metadata: PaperMetadata;
  currentQuestion: number;
  totalQuestions: number;
  timerDisplay: string;
}

export function TopNavbar({
  metadata,
  currentQuestion,
  totalQuestions,
  timerDisplay,
}: TopNavbarProps) {
  const progressPct = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <header className="flex items-center gap-4 border-b bg-background px-6 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="truncate text-sm font-semibold">{metadata.subject}</h1>
        <Badge variant="secondary" className="shrink-0">
          {metadata.curriculum}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {metadata.year} &middot; {metadata.paperNumber}
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
            {currentQuestion + 1}/{totalQuestions}
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
