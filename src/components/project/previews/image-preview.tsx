interface ImagePreviewProps {
  documentId: string;
  fileName: string;
}

export function ImagePreview({ documentId, fileName }: ImagePreviewProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- raw bytes are streamed through our own authenticated API route, not optimizable by next/image
    <img
      src={`/api/documents/${documentId}/raw`}
      alt={fileName}
      className="mx-auto max-h-full w-auto rounded-md border"
    />
  );
}
