"use client";

import { useEffect, useState } from "react";
import type { PastPaper, AnswerMap, GradeResult, QuestionGrade } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  ListChecks,
  Loader2,
  Sparkles,
} from "lucide-react";

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
  const totalAnswered = Object.keys(answers).filter((k) => answers[k]?.trim())
    .length;
  const totalQuestions = paper.questions.length;

  const [grading, setGrading] = useState(true);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function grade() {
      setGrading(true);
      setGradeError(null);
      try {
        const res = await fetch("/api/grade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: paper.questions.map((q) => ({
              ...q,
              studentAnswer: answers[q.id] ?? "",
            })),
          }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setGradeError(json.error || "Failed to grade answers");
          return;
        }
        setResult(json.data as GradeResult);
      } catch (err) {
        if (!cancelled) {
          setGradeError(err instanceof Error ? err.message : "Network error");
        }
      } finally {
        if (!cancelled) setGrading(false);
      }
    }

    grade();
    return () => {
      cancelled = true;
    };
  }, [paper, answers]);

  const gradeByQuestion = new Map<string, QuestionGrade>(
    result?.grades.map((g) => [g.questionId, g]) ?? []
  );

  const scorePct =
    result && result.totalPoints > 0
      ? Math.round((result.totalAwarded / result.totalPoints) * 100)
      : 0;

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
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            {grading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : result ? (
              <p className="text-2xl font-bold">
                {result.totalAwarded}
                <span className="text-base font-normal text-muted-foreground">
                  /{result.totalPoints} ({scorePct}%)
                </span>
              </p>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">&mdash;</p>
            )}
          </CardContent>
        </Card>
      </div>

      {grading && (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Grading your answers against the mark scheme with AI...
        </div>
      )}

      {gradeError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          AI grading failed: {gradeError}
        </div>
      )}

      <div className="space-y-6">
        {paper.questions.map((q) => {
          const answer = answers[q.id];
          const hasAnswer = !!answer?.trim();
          const grade = gradeByQuestion.get(q.id);

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
                  {grade ? (
                    <Badge
                      variant={
                        grade.awardedPoints >= grade.maxPoints
                          ? "default"
                          : grade.awardedPoints > 0
                            ? "secondary"
                            : "destructive"
                      }
                      className="text-[10px]"
                    >
                      {grade.awardedPoints}/{grade.maxPoints} marks
                    </Badge>
                  ) : hasAnswer ? (
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

                {grade?.feedback && (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs font-medium text-muted-foreground">
                        AI Feedback
                      </p>
                    </div>
                    <p className="mt-1 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                      {grade.feedback}
                    </p>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5">
                    <ListChecks className="h-3.5 w-3.5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground">
                      Mark Scheme Criteria
                    </p>
                  </div>
                  <ul className="mt-1.5 space-y-1.5">
                    {(grade
                      ? grade.criteria
                      : q.markSchemeCriteria.map((criterion) => ({
                          criterion,
                          met: false,
                          note: "",
                        }))
                    ).map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        {grade ? (
                          c.met ? (
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />
                          ) : (
                            <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
                          )
                        ) : (
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                        )}
                        <span>
                          {c.criterion}
                          {grade && c.note ? (
                            <span className="text-muted-foreground/70">
                              {" "}
                              &mdash; {c.note}
                            </span>
                          ) : null}
                        </span>
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
