const REQUIRED_VARS = [
  "DATABASE_URL",
  "QDRANT_URL",
  "OPENAI_API_KEY",
  "AUTH_SECRET",
  "AUTH_URL",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

const OPTIONAL_VARS = [
  "QDRANT_API_KEY",
  "OPENAI_BASE_URL",
  "OPENAI_CHAT_MODEL",
  "OPENAI_EMBEDDING_MODEL",
] as const;

type RequiredVar = (typeof REQUIRED_VARS)[number];
type OptionalVar = (typeof OPTIONAL_VARS)[number];

function requireEnv(name: RequiredVar): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env and fill it in.`,
    );
  }

  return value;
}

function optionalEnv(name: OptionalVar): string | undefined {
  return process.env[name] || undefined;
}

/**
 * Typed, validated access to process.env. Each property is validated lazily
 * (on first access, not at module import), because Next.js has no single
 * process "startup" moment across route handlers, middleware, and server
 * components. Required vars throw a readable error naming themselves the
 * first time a code path that needs them actually reads them, instead of
 * every module eagerly demanding vars (e.g. Google OAuth) that unrelated
 * code paths never touch.
 */
export const env = {
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL");
  },
  get QDRANT_URL() {
    return requireEnv("QDRANT_URL");
  },
  get QDRANT_API_KEY() {
    return optionalEnv("QDRANT_API_KEY");
  },
  get OPENAI_API_KEY() {
    return requireEnv("OPENAI_API_KEY");
  },
  get OPENAI_BASE_URL() {
    return optionalEnv("OPENAI_BASE_URL");
  },
  get OPENAI_CHAT_MODEL() {
    return optionalEnv("OPENAI_CHAT_MODEL");
  },
  get OPENAI_EMBEDDING_MODEL() {
    return optionalEnv("OPENAI_EMBEDDING_MODEL");
  },
  get AUTH_SECRET() {
    return requireEnv("AUTH_SECRET");
  },
  get AUTH_URL() {
    return requireEnv("AUTH_URL");
  },
  get AUTH_GOOGLE_ID() {
    return requireEnv("AUTH_GOOGLE_ID");
  },
  get AUTH_GOOGLE_SECRET() {
    return requireEnv("AUTH_GOOGLE_SECRET");
  },
  get CLOUDINARY_CLOUD_NAME() {
    return requireEnv("CLOUDINARY_CLOUD_NAME");
  },
  get CLOUDINARY_API_KEY() {
    return requireEnv("CLOUDINARY_API_KEY");
  },
  get CLOUDINARY_API_SECRET() {
    return requireEnv("CLOUDINARY_API_SECRET");
  },
} as const;
