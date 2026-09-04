"use client";

import { memo, useState } from "react";
import type { ComponentProps } from "react";
import type { Element } from "hast";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

function nodeToText(node: Element | undefined): string {
  if (!node) {
    return "";
  }

  return node.children
    .map((child) => {
      if (child.type === "text") {
        return child.value;
      }
      if (child.type === "element") {
        return nodeToText(child);
      }
      return "";
    })
    .join("");
}

function CodeBlock({
  node,
  className,
  children,
  ...props
}: ComponentProps<"pre"> & { node?: Element }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = nodeToText(node);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  return (
    <pre
      className={cn(
        "group relative my-3 overflow-x-auto rounded-md border bg-muted/40 p-3 text-[0.8125rem] leading-6 [&>code]:bg-transparent [&>code]:p-0",
        className,
      )}
      {...props}
    >
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy code"
        className="absolute top-2 right-2 flex items-center gap-1 rounded-md border bg-background/80 px-1.5 py-1 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      </button>
      {children}
    </pre>
  );
}

function createComponents(scale: "compact" | "comfortable"): Components {
  const isComfortable = scale === "comfortable";

  return {
    h1: ({ className, ...props }) => (
      <h1
        className={cn(
          isComfortable
            ? "mt-6 mb-2 text-2xl font-semibold first:mt-0"
            : "mt-4 mb-1.5 text-sm font-semibold first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    h2: ({ className, ...props }) => (
      <h2
        className={cn(
          isComfortable
            ? "mt-5 mb-2 text-xl font-semibold first:mt-0"
            : "mt-4 mb-1.5 text-sm font-semibold first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    h3: ({ className, ...props }) => (
      <h3
        className={cn(
          isComfortable
            ? "mt-4 mb-1.5 text-lg font-semibold first:mt-0"
            : "mt-4 mb-1.5 text-sm font-semibold first:mt-0",
          className,
        )}
        {...props}
      />
    ),
    p: ({ className, ...props }) => (
      <p
        className={cn(
          isComfortable
            ? "text-[15px] leading-7 [&:not(:first-child)]:mt-4"
            : "text-sm leading-6 [&:not(:first-child)]:mt-3",
          className,
        )}
        {...props}
      />
    ),
    ul: ({ className, ...props }) => (
      <ul
        className={cn(
          "mt-3 list-disc space-y-1.5 pl-5",
          isComfortable && "text-[15px]",
          className,
        )}
        {...props}
      />
    ),
    ol: ({ className, ...props }) => (
      <ol
        className={cn(
          "mt-3 list-decimal space-y-1.5 pl-5",
          isComfortable && "text-[15px]",
          className,
        )}
        {...props}
      />
    ),
    li: ({ className, ...props }) => (
      <li
        className={cn(
          isComfortable ? "pl-1 leading-7" : "pl-1 text-sm leading-6",
          className,
        )}
        {...props}
      />
    ),
    code: ({ className, ...props }) => (
      <code
        className={cn(
          "rounded bg-muted px-1.5 py-0.5 font-mono text-[0.8125rem]",
          className,
        )}
        {...props}
      />
    ),
    pre: CodeBlock,
    table: ({ className, children, ...props }) => (
      <div className="mt-3 overflow-x-auto rounded-md border">
        <table
          className={cn("w-full text-xs", className)}
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ className, ...props }) => (
      <thead className={cn("bg-muted/60", className)} {...props} />
    ),
    tr: ({ className, ...props }) => (
      <tr
        className={cn("border-b last:border-0 odd:bg-transparent even:bg-muted/20", className)}
        {...props}
      />
    ),
    th: ({ className, ...props }) => (
      <th
        className={cn("px-3 py-2 text-left font-medium", className)}
        {...props}
      />
    ),
    td: ({ className, ...props }) => (
      <td className={cn("px-3 py-2", className)} {...props} />
    ),
    a: ({ className, ...props }) => (
      <a
        className={cn(
          "text-primary underline underline-offset-2",
          className,
        )}
        target="_blank"
        rel="noreferrer"
        {...props}
      />
    ),
    blockquote: ({ className, ...props }) => (
      <blockquote
        className={cn(
          "mt-3 border-l-2 border-primary/40 pl-3 text-muted-foreground",
          className,
        )}
        {...props}
      />
    ),
    hr: ({ className, ...props }) => (
      <hr className={cn("my-4 border-border", className)} {...props} />
    ),
  };
}

const compactComponents = createComponents("compact");
const comfortableComponents = createComponents("comfortable");

interface MarkdownProps {
  content: string;
  scale?: "compact" | "comfortable";
  className?: string;
}

function MarkdownImpl({ content, scale = "compact", className }: MarkdownProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={scale === "comfortable" ? comfortableComponents : compactComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export const Markdown = memo(MarkdownImpl);
