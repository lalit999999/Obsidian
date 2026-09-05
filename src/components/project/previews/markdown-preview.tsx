import { Markdown } from "@/components/ui/markdown";

interface MarkdownPreviewProps {
  content: string;
  truncated: boolean;
}

export function MarkdownPreview({ content, truncated }: MarkdownPreviewProps) {
  return (
    <>
      <Markdown content={content} scale="comfortable" className="max-w-none" />
      {truncated ? (
        <p className="mt-6 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
          This preview was truncated to the first 1 MB of the file.
        </p>
      ) : null}
    </>
  );
}
