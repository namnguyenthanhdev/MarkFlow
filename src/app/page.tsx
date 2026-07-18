"use client";

import { useMemo } from "react";
import { mockPaper } from "@/data/mockPaper";
import { ExamView } from "@/components/exam/ExamView";
import type { PastPaper } from "@/types";

function getPaper(): PastPaper {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("parsedPaper");
    if (stored) {
      try {
        return JSON.parse(stored) as PastPaper;
      } catch {
        // fall through to mock
      }
    }
  }
  return mockPaper;
}

export default function Home() {
  const paper = useMemo(() => getPaper(), []);

  return <ExamView key={paper.id} paper={paper} />;
}
