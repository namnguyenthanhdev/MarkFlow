"use client";

import { useEffect } from "react";
import { useStore } from "@nanostores/react";
import type { PastPaper } from "@/types";
import { $submitted } from "@/stores/exam";
import { startTimer, stopTimer } from "@/stores/timer";
import { TopNavbar } from "./TopNavbar";
import { QuestionCard } from "./QuestionCard";
import { WorkspacePanel } from "./WorkspacePanel";
import { BottomNavbar } from "./BottomNavbar";
import { SubmissionSummary } from "./SubmissionSummary";

interface ExamViewProps {
  paper: PastPaper;
}

export function ExamView({ paper }: ExamViewProps) {
  const submitted = useStore($submitted);

  useEffect(() => {
    startTimer(paper.metadata.durationMinutes);
    return () => stopTimer();
  }, [paper.metadata.durationMinutes]);

  if (submitted) {
    return <SubmissionSummary paper={paper} />;
  }

  return (
    <div className="flex h-dvh flex-col">
      <TopNavbar paper={paper} />

      <div className="flex min-h-0 flex-1">
        <div className="w-[45%] overflow-y-auto border-r bg-muted/20">
          <QuestionCard paper={paper} />
        </div>
        <div className="flex w-[55%] flex-col overflow-y-auto">
          <WorkspacePanel paper={paper} />
        </div>
      </div>

      <BottomNavbar paper={paper} />
    </div>
  );
}
