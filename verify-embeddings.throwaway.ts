import { generateEmbeddings, getEmbeddingDimensions } from "./src/lib/rag/embeddings";
import { RAG_EMBEDDING_MODEL } from "./src/lib/rag/constants";

async function main() {
  console.log("OPENAI_BASE_URL:", process.env.OPENAI_BASE_URL || "(unset -> official OpenAI)");
  console.log("RAG_EMBEDDING_MODEL:", RAG_EMBEDDING_MODEL);
  console.log("Configured vector size:", getEmbeddingDimensions());

  const [vector] = await generateEmbeddings(["hello"]);
  console.log("Returned vector length:", vector.length);
}

main().catch((error) => {
  console.error("FAILED:", error);
  process.exit(1);
});
