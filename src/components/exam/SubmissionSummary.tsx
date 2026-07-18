"use client";

import type { PastPaper, AnswerMap } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ListChecks } from "lucide-react";

interface SubmissionSummaryProps {
  paper: PastPaper;
  answers: AnswerMap;
  onReset: () => void;
}

export function SubmissionSummary({
  paper,
  answers,
  onReset,
}: SubmissionSummaryProps) {
  const totalAnswered = Object.keys(answers).length;
  const totalQuestions = paper.questions.length;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exam Summary</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {paper.metadata.subject} &middot; {paper.metadata.curriculum} &middot;{" "}
            {paper.metadata.year} {paper.metadata.paperNumber}
          </p>
        </div>
        <Badge variant={totalAnswered === totalQuestions ? "default" : "secondary"}>
          {totalAnswered}/{totalQuestions} answered
        </Badge>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalQuestions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{totalAnswered}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Points</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{paper.metadata.totalPoints}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {paper.questions.map((q) => {
          const answer = answers[q.id];
          const hasAnswer = !!answer;

          return (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm">
                      Question {q.questionNumber}
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px]">
                      {q.points} pt{q.points > 1 ? "s" : ""}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {q.type === "multiple_choice"
                        ? "MCQ"
                        : q.type === "short_answer"
                          ? "Short"
                          : "Long Form"}
                    </Badge>
                  </div>
                  {hasAnswer ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Your Answer
                  </p>
                  <div className="mt-1 rounded-lg bg-muted/50 p-3 text-sm">
                    {hasAnswer ? (
                      answer
                    ) : (
                      <span className="italic text-muted-foreground">
                        Not answered
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Mark Scheme Criteria{/* (AI grading placeholder) */}
                    </p>
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {q.markSchemeCriteria.map((criterion, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border px-6 py-2 text-sm font-medium transition-colors hover:bg-muted"
        >
          Start New Practice
        </button>
      </div>
    </div>
  );
}
