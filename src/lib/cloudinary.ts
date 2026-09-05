import crypto from "node:crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export function getResourceType(mimeType?: string): "image" | "raw" {
  if (!mimeType) {
    return "raw";
  }

  return mimeType.startsWith("image/") ? "image" : "raw";
}

function extensionFromFileName(fileName: string): string {
  const match = /\.([a-zA-Z0-9]+)$/.exec(fileName);
  return match ? match[1].toLowerCase() : "";
}

export async function uploadFileToCloudinary({
  bytes,
  fileName,
  mimeType,
}: {
  bytes: Uint8Array | ArrayBuffer;
  fileName: string;
  mimeType: string;
}): Promise<CloudinaryUploadResult> {
  if (!cloudName || !apiKey || !apiSecret) {
    return {
      secureUrl: `local://documents/${encodeURIComponent(fileName)}`,
      publicId: `local-${crypto.randomUUID()}`,
    };
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = "obsidian/documents";
  const resourceType = getResourceType(mimeType);

  // Cloudinary `raw` assets are served at exactly `public_id` with no
  // extension inference, so the real extension must live in the public_id
  // itself or the delivery URL 404s / serves the wrong content type.
  const extension = extensionFromFileName(fileName);
  const baseName = fileName.replace(/\.[^.]+$/, "").slice(0, 80) || "document";
  const publicId = `${folder}/${baseName}-${crypto.randomUUID()}${
    extension ? `.${extension}` : ""
  }`;

  const signedParams: Record<string, string> = {
    public_id: publicId,
    timestamp,
  };

  const signatureBase = Object.keys(signedParams)
    .sort()
    .map((key) => `${key}=${signedParams[key]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(`${signatureBase}${apiSecret}`)
    .digest("hex");

  const body = new FormData();
  const uint8Bytes =
    bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  body.set(
    "file",
    new Blob([new Uint8Array(uint8Bytes)], { type: mimeType }),
    fileName,
  );
  body.set("public_id", publicId);
  body.set("timestamp", timestamp);
  body.set("api_key", apiKey);
  body.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    {
      method: "POST",
      body,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[cloudinary] upload failed (${response.status}): ${errorText}`,
    );
    throw new Error(
      `Cloudinary upload failed: ${response.status} ${errorText}`,
    );
  }

  const result = (await response.json()) as {
    secure_url?: string;
    public_id?: string;
  };

  if (!result.secure_url || !result.public_id) {
    throw new Error("Cloudinary upload did not return an asset reference.");
  }

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}

export async function deleteCloudinaryAsset(
  publicId: string,
  mimeType?: string,
): Promise<boolean> {
  if (!cloudName || !apiKey || !apiSecret || !publicId) {
    return false;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const resourceType = getResourceType(mimeType);
  const signatureBase = `public_id=${publicId}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(`${signatureBase}${apiSecret}`)
    .digest("hex");

  const body = new URLSearchParams();
  body.set("public_id", publicId);
  body.set("timestamp", timestamp);
  body.set("api_key", apiKey);
  body.set("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
    {
      method: "POST",
      body,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[cloudinary] delete failed (${response.status}): ${errorText}`,
    );
    return false;
  }

  return true;
}
