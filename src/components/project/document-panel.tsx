/**
 * DOCUMENT PANEL
 *
 * Connect the existing document UI to backend endpoints.
 *
 * Responsibilities:
 *
 * - Fetch/display project documents.
 * - Upload .md and .txt files.
 * - Show document processing status.
 * - Delete documents.
 * - Refresh the document list after mutations.
 *
 * Supported status UI:
 *
 * PENDING
 * PROCESSING
 * READY
 * FAILED
 *
 * Upload flow:
 *
 * Select file
 *      ↓
 * Validate basic client-side constraints
 *      ↓
 * Send multipart request
 *      ↓
 * Show upload/loading state
 *      ↓
 * Refresh document data
 *
 * The server remains the source of truth for validation.
 *
 * Do not implement RAG logic inside this component.
 */