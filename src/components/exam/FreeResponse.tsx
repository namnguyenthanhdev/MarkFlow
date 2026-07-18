"use client";

interface FreeResponseProps {
  value: string;
  onChange: (value: string) => void;
  minChars?: number;
  placeholder?: string;
}

export function FreeResponse({
  value,
  onChange,
  minChars,
  placeholder = "Type your answer here...",
}: FreeResponseProps) {
  const charCount = value.length;

  return (
    <div className="flex h-full flex-col">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-0 flex-1 resize-none rounded-xl border-2 border-border bg-background p-5 text-sm leading-relaxed outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {charCount} character{charCount !== 1 ? "s" : ""}
        </span>
        {minChars && (
          <span className={charCount < minChars ? "text-destructive" : "text-muted-foreground"}>
            Minimum {minChars} characters
          </span>
        )}
      </div>
    </div>
  );
}
