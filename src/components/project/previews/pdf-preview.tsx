interface PdfPreviewProps {
  documentId: string;
  fileName: string;
}

export function PdfPreview({ documentId, fileName }: PdfPreviewProps) {
  return (
    <iframe
      src={`/api/documents/${documentId}/raw#view=FitH`}
      className="h-full w-full rounded-md border"
      title={fileName}
    />
  );
}
