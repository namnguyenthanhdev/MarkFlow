"use client";

import { useState, useRef, type DragEvent } from "react";
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

export default function AdminUploadPage() {
  const [text, setText] = useState("");
  const [parsedJson, setParsedJson] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setFileName(file.name);

    try {
      const extractedText = await extractTextFromPdf(file);
      setText(extractedText);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to extract text from PDF"
      );
      setFileName(null);
    } finally {
      setIsExtracting(false);
    }
  }

  function handleClearFile() {
    setFileName(null);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleProcess() {
    if (!text.trim()) return;

    setIsLoading(true);
    setError(null);
    setParsedJson(null);

    try {
      const res = await fetch("/api/parse-paper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
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
            Upload a PDF or paste raw exam text &rarr; parse with Gemini &rarr;
            preview in Exam UI
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 gap-6">
        <div className="flex w-1/2 flex-col gap-3">
          <label className="text-xs font-medium text-muted-foreground">
            Input
          </label>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 transition-colors ${
              isDragging
                ? "border-primary/50 bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isExtracting ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Extracting text from PDF...
                </span>
              </>
            ) : fileName ? (
              <>
                <FileText className="h-6 w-6 text-primary" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{fileName}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearFile();
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  Text extracted &mdash; you can edit below
                </span>
              </>
            ) : (
              <>
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Drop a PDF here or click to browse
                </span>
              </>
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Paste the raw exam paper text here...\n\nExample:\nCambridge International A-Level Biology\nPaper 4 (Extended) - 2024\n\n1. Which of the following... [2 marks]\nA) ...\nB) ...\n\n2. Describe the role of... [4 marks]`}
            className="min-h-0 flex-1 resize-none rounded-xl border-2 border-border bg-background p-4 text-sm leading-relaxed outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/40"
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
