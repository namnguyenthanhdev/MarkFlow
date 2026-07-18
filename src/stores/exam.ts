import { atom } from "nanostores";
import type { AnswerMap } from "@/types";

export const $currentQuestionIndex = atom(0);
export const $answers = atom<AnswerMap>({});
export const $submitted = atom(false);

export function setAnswer(questionId: string, value: string) {
  $answers.set({ ...$answers.get(), [questionId]: value });
}

export function goToNext(totalQuestions: number) {
  const i = $currentQuestionIndex.get();
  if (i < totalQuestions - 1) {
    $currentQuestionIndex.set(i + 1);
  }
}

export function goToPrevious() {
  const i = $currentQuestionIndex.get();
  if (i > 0) {
    $currentQuestionIndex.set(i - 1);
  }
}

export function submitExam() {
  $submitted.set(true);
}

export function resetExam() {
  $currentQuestionIndex.set(0);
  $answers.set({});
  $submitted.set(false);
}
