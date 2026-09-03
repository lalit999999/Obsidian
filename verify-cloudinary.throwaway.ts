import {
  uploadDocumentToCloudinary,
  deleteCloudinaryAsset,
} from "./src/lib/cloudinary";

async function main() {
  const result = await uploadDocumentToCloudinary({
    content: "hello world, this is a throwaway verification upload.",
    fileName: "verify-upload.txt",
    mimeType: "text/plain",
  });
  console.log("UPLOAD OK:", JSON.stringify(result, null, 2));

  const deleted = await deleteCloudinaryAsset(result.publicId);
  console.log("DELETE OK:", deleted);
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
