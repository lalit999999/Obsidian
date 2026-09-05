interface PlainPreviewProps {
  content: string;
  truncated: boolean;
}

export function PlainPreview({ content, truncated }: PlainPreviewProps) {
  return (
    <>
      <pre className="whitespace-pre-wrap font-mono text-xs leading-6 text-foreground">
        {content}
      </pre>
      {truncated ? (
        <p className="mt-6 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
          This preview was truncated to the first 1 MB of the file.
        </p>
      ) : null}
    </>
  );
}
