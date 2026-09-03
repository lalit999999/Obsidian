"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";

const question = "What did I note about cache invalidation?";

const sources = [
  {
    id: 1,
    doc: "redis-notes.md",
    snippet: "Invalidate on write, not on read — event-driven expiry avoids stale reads.",
    cited: true,
  },
  {
    id: 2,
    doc: "system-design.txt",
    snippet: "Short TTLs beat manual purge logic for anything derived from a source table.",
    cited: true,
  },
  {
    id: 3,
    doc: "caching-101.md",
    snippet: "LRU eviction handles memory pressure, not correctness.",
    cited: false,
  },
];

const answerParts: Array<{ text: string; cite?: 1 | 2 }> = [
  { text: "Cache invalidation should be event-driven: expire keys the moment the source record changes" },
  { text: "", cite: 1 },
  { text: ", and prefer short TTLs over manual purges for anything derived" },
  { text: "", cite: 2 },
  { text: "." },
];
const fullAnswer = answerParts.map((p) => p.text).join("");

type Stage = "asking" | "retrieving" | "answering" | "done";

export function HeroDemo() {
  const reduceMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>(reduceMotion ? "done" : "asking");
  const [charCount, setCharCount] = useState(reduceMotion ? fullAnswer.length : 0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (reduceMotion) return;

    timers.current.push(setTimeout(() => setStage("retrieving"), 900));
    timers.current.push(setTimeout(() => setStage("answering"), 2000));

    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (stage !== "answering") return;

    const interval = setInterval(() => {
      setCharCount((count) => {
        if (count >= fullAnswer.length) {
          clearInterval(interval);
          setStage("done");
          return count;
        }
        return count + 1;
      });
    }, 22);

    return () => clearInterval(interval);
  }, [stage]);

  let consumed = 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <p className="text-sm font-medium text-muted-foreground">Physics 201 · Chats</p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span
            className={cn(
              "size-1.5 rounded-full",
              stage === "done" ? "bg-success" : "bg-primary",
              stage !== "done" && !reduceMotion && "animate-pulse",
            )}
          />
          {stage === "done" ? "Answered" : "Thinking"}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Sources</p>
          {sources.map((source) => {
            const highlighted =
              source.cited && (stage === "retrieving" || stage === "answering" || stage === "done");
            return (
              <div
                key={source.id}
                className={cn(
                  "rounded-md border px-3 py-2 transition-colors duration-500",
                  highlighted
                    ? "border-primary/50 bg-primary/5"
                    : "border-border bg-background",
                )}
              >
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <FileText className="size-3.5 text-muted-foreground" />
                  {source.doc}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {source.snippet}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 rounded-md border border-border bg-background p-3.5">
          <div className="ml-auto max-w-[90%] rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground">
            {question}
          </div>

          <div className="min-h-24 rounded-md bg-muted/40 p-3 text-sm leading-relaxed text-foreground">
            {stage === "asking" ? (
              <span className="text-muted-foreground">Searching your documents…</span>
            ) : (
              <p>
                {answerParts.map((part, i) => {
                  const start = consumed;
                  consumed += part.text.length;
                  const visibleLen = Math.max(0, Math.min(part.text.length, charCount - start));
                  const visible = part.text.slice(0, visibleLen);

                  return (
                    <span key={i}>
                      {visible}
                      {part.cite && charCount >= start ? (
                        <motion.sup
                          initial={reduceMotion ? false : { opacity: 0, y: -2 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-sm bg-primary/15 text-[0.6rem] font-semibold text-primary"
                        >
                          {part.cite}
                        </motion.sup>
                      ) : null}
                    </span>
                  );
                })}
                {stage === "answering" ? (
                  <span
                    aria-hidden
                    className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-primary"
                  />
                ) : null}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
