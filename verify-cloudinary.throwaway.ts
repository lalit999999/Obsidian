import { uploadDocumentToCloudinary } from "./src/lib/cloudinary";

async function main() {
  const result = await uploadDocumentToCloudinary({
    content: "hello world, this is a throwaway verification upload.",
    fileName: "verify-upload.txt",
    mimeType: "text/plain",
  });
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
