"use client";

import { useState, useRef } from "react";
import {
  Loader2,
  Sparkles,
  Eye,
  Copy,
  Check,
  Upload,
  FileText,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractTextFromPdf } from "@/lib/pdf-extractor";

interface DocInputProps {
  label: string;
  hint: string;
  text: string;
  onTextChange: (value: string) => void;
  placeholder: string;
  onError: (message: string | null) => void;
}

function DocInput({
  label,
  hint,
  text,
  onTextChange,
  placeholder,
  onError,
}: DocInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      onError("Please upload a PDF file");
      return;
    }

    setIsExtracting(true);
    onError(null);
    setFileName(file.name);

    try {
      const extractedText = await extractTextFromPdf(file);
      onTextChange(extractedText);
    } catch (err) {
      onError(
        err instanceof Error ? err.message : "Failed to extract text from PDF"
      );
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleClearFile() {
    setFileName(null);
    onTextChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div>
        <label className="text-xs font-medium text-muted-foreground">
          {label}
        </label>
        <p className="text-[11px] text-muted-foreground/70">{hint}</p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-colors ${
          isDragging
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />

        {isExtracting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Extracting text from PDF...
            </span>
          </>
        ) : fileName ? (
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">{fileName}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFile();
              }}
              className="text-muted-foreground transition-colors hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Drop a PDF here or click to browse
            </span>
          </>
        )}
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-0 flex-1 resize-none rounded-xl border-2 border-border bg-background p-4 text-sm leading-relaxed outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40"
      />
    </div>
  );
}

export default function AdminUploadPage() {
  const [text, setText] = useState("");
  const [markScheme, setMarkScheme] = useState("");
  const [parsedJson, setParsedJson] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleProcess() {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setParsedJson(null);

    try {
      const res = await fetch("/api/parse-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          markScheme: markScheme.trim() ? markScheme : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to parse paper");
        return;
      }

      setParsedJson(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsLoading(false);
    }
  }

  function handlePreview() {
    if (!parsedJson) return;
    sessionStorage.setItem("parsedPaper", JSON.stringify(parsedJson));
    window.location.href = "/";
  }

  async function handleCopy() {
    if (!parsedJson) return;
    await navigator.clipboard.writeText(JSON.stringify(parsedJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex h-dvh max-w-5xl flex-col p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Paper Parser</h1>
          <p className="text-sm text-muted-foreground">
            Upload the exam paper and its mark scheme &rarr; parse with Gemini
            &rarr; preview in Exam UI
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-6">
        <div className="flex w-1/2 flex-col gap-4">
          <DocInput
            label="Exam Paper"
            hint="The question paper (required)"
            text={text}
            onTextChange={setText}
            onError={setError}
            placeholder={`Paste the raw exam paper text here...\n\nExample:\nCambridge International A-Level Biology\nPaper 4 (Extended) - 2024\n\n1. Which of the following... [2 marks]\nA) ...\nB) ...\n\n2. Describe the role of... [4 marks]`}
          />

          <DocInput
            label="Mark Scheme"
            hint="Optional but recommended — grounds the AI grading criteria in the real mark scheme"
            text={markScheme}
            onTextChange={setMarkScheme}
            onError={setError}
            placeholder={`Paste the official mark scheme here...\n\nExample:\n1. B [1]\n2. stroma (1); RuBisCO / rubisco (1); RuBP + CO2 (1); ATP and NADPH used (1)`}
          />

          <Button
            size="lg"
            disabled={!text.trim() || isLoading}
            onClick={handleProcess}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Parsing with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Process Paper with AI
              </>
            )}
          </Button>
        </div>

        <div className="flex w-1/2 flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              {parsedJson ? "Parsed JSON Output" : "Output"}
            </label>
            {parsedJson ? (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="xs" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button size="xs" onClick={handlePreview}>
                  <Eye className="h-3.5 w-3.5" />
                  Preview in Exam UI
                </Button>
              </div>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-auto rounded-xl border-2 border-border bg-muted/30 p-4">
            {isLoading && (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="text-sm">Analyzing exam structure...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}

            {!isLoading && !error && !parsedJson && (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  Parsed JSON will appear here
                </p>
              </div>
            )}

            {parsedJson && !isLoading ? (
              <pre className="text-xs leading-relaxed">
                {JSON.stringify(parsedJson, null, 2)}
              </pre>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
