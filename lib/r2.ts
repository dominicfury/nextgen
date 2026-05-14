import { randomBytes } from "node:crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Lazy R2 client — same pattern as lib/db. Module load must not touch env so
// the build still succeeds when secrets aren't wired up yet.

let _client: S3Client | null = null;

function getS3(): S3Client {
  if (_client) return _client;

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "R2 credentials are not set. Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
        "and R2_SECRET_ACCESS_KEY to .env.local / Vercel env (see .env.example).",
    );
  }

  _client = new S3Client({
    region: "auto",
    endpoint:
      process.env.R2_ENDPOINT ||
      `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _client;
}

function bucket(): string {
  const b = process.env.R2_BUCKET;
  if (!b) throw new Error("R2_BUCKET is not set.");
  return b;
}

/**
 * Build a deterministic-but-collision-safe storage key for a product file.
 * Pattern: products/<productId>/<8-byte hex>-<safe-filename>
 */
export function makeStorageKey(
  productId: number,
  originalFilename: string,
): string {
  const safe = originalFilename
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120) || "file";
  const id = randomBytes(8).toString("hex");
  return `products/${productId}/${id}-${safe}`;
}

/** Presigned PUT URL for a browser to upload a file directly to R2. */
export async function presignPut(opts: {
  key: string;
  contentType?: string;
  contentLength?: number;
  expiresInSec?: number;
}): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: bucket(),
    Key: opts.key,
    ContentType: opts.contentType,
    ContentLength: opts.contentLength,
  });
  return getSignedUrl(getS3(), cmd, {
    expiresIn: opts.expiresInSec ?? 60 * 10, // 10 min
  });
}

/**
 * Presigned GET URL with a filename hint, so the browser downloads as the
 * original filename rather than the opaque storage key.
 */
export async function presignGet(opts: {
  key: string;
  filename?: string;
  expiresInSec?: number;
}): Promise<string> {
  const headers = opts.filename
    ? {
        ResponseContentDisposition: `attachment; filename="${opts.filename.replace(/"/g, "")}"`,
      }
    : {};
  const cmd = new GetObjectCommand({
    Bucket: bucket(),
    Key: opts.key,
    ...headers,
  });
  return getSignedUrl(getS3(), cmd, {
    expiresIn: opts.expiresInSec ?? 60 * 10, // 10 min
  });
}

export async function deleteObject(key: string): Promise<void> {
  await getS3().send(
    new DeleteObjectCommand({ Bucket: bucket(), Key: key }),
  );
}
