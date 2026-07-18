"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MultipleChoiceProps {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
}

export function MultipleChoice({
  options,
  selected,
  onSelect,
}: MultipleChoiceProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = selected === option;
        const letter = option.charAt(0).toUpperCase();

        return (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={cn(
              "group relative flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left text-sm transition-all",
              isSelected
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {isSelected ? <Check className="h-4 w-4" /> : letter}
            </span>
            <span className="pt-1 leading-relaxed">{option.slice(2).trim()}</span>
          </button>
        );
      })}
    </div>
  );
}
