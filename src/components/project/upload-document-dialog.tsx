// TODO:
// Create the document upload dialog.
//
// Requirements:
// - Use shadcn Dialog.
// - Add a file input.
// - Accept only:
//   .md
//   .txt
//
// UI states:
// - No file selected.
// - File selected.
// - Invalid file type.
// - Mock uploading/processing.
//
// Behavior:
// - Validate the selected file type on the frontend.
// - On successful mock upload, call a callback with
//   the document information.
// - Simulate PROCESSING and optionally transition to READY.
//
// Important:
// - Do not perform a real upload.
// - No Cloudinary/backend integration in Part 1.