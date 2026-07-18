import { atom, computed } from "nanostores";

export const $timeRemaining = atom(0);
export const $isRunning = atom(false);

export const $formatted = computed($timeRemaining, (t) => {
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
});

let intervalId: ReturnType<typeof setInterval> | null = null;

function clearTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function startTimer(initialMinutes: number) {
  clearTimer();
  $timeRemaining.set(initialMinutes * 60);
  $isRunning.set(true);

  intervalId = setInterval(() => {
    const prev = $timeRemaining.get();
    if (prev <= 1) {
      clearTimer();
      $isRunning.set(false);
      $timeRemaining.set(0);
      return;
    }
    $timeRemaining.set(prev - 1);
  }, 1000);
}

export function stopTimer() {
  clearTimer();
  $isRunning.set(false);
}
