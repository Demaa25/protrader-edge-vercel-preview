import { get, put } from "@vercel/blob";

function requiredToken(name: "PUBLIC_BLOB_READ_WRITE_TOKEN" | "PRIVATE_BLOB_READ_WRITE_TOKEN") {
  const token = process.env[name];
  if (!token) {
    throw new Error(`${name} is not configured.`);
  }
  return token;
}

export function publicBlobToken() {
  return requiredToken("PUBLIC_BLOB_READ_WRITE_TOKEN");
}

function safeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "upload";
}

export async function putPublicBlob(prefix: string, file: File) {
  return put(`${prefix}/${safeFileName(file.name)}`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: file.type || undefined,
    token: requiredToken("PUBLIC_BLOB_READ_WRITE_TOKEN"),
  });
}

export async function putPrivateBlob(prefix: string, file: File) {
  return put(`${prefix}/${safeFileName(file.name)}`, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || undefined,
    token: requiredToken("PRIVATE_BLOB_READ_WRITE_TOKEN"),
  });
}

export async function getPrivateBlob(pathname: string, ifNoneMatch?: string) {
  return get(pathname, {
    access: "private",
    ifNoneMatch,
    token: requiredToken("PRIVATE_BLOB_READ_WRITE_TOKEN"),
  });
}
