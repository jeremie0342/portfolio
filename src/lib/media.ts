import "server-only";

import { randomBytes } from "node:crypto";
import { Client } from "minio";
import sharp from "sharp";

/**
 * Media, stored in MinIO.
 *
 * The bucket holds the file and the database holds everything said about it:
 * dimensions, placeholder, alternative text in both languages. Neither is
 * derivable from the other, and putting the description in object metadata
 * would mean a query per image to render a page.
 *
 * Optional, like mail. Without the variables the console says so plainly and
 * refuses the upload rather than failing halfway and leaving a row pointing at
 * a file that was never written.
 */

export type Configured = { ok: true; client: Client; bucket: string };
export type Unconfigured = { ok: false };

function connect(): Configured | Unconfigured {
  const endPoint = process.env.MINIO_ENDPOINT;
  const accessKey = process.env.MINIO_ACCESS_KEY;
  const secretKey = process.env.MINIO_SECRET_KEY;
  const bucket = process.env.MINIO_BUCKET;

  if (!endPoint || !accessKey || !secretKey || !bucket) {
    return { ok: false };
  }

  return {
    ok: true,
    bucket,
    client: new Client({
      endPoint,
      port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : undefined,
      useSSL: process.env.MINIO_USE_SSL !== "false",
      accessKey,
      secretKey,
    }),
  };
}

export function isConfigured() {
  return connect().ok;
}

/** The address a browser fetches the object from. */
export function publicUrl(path: string) {
  const base = process.env.MINIO_PUBLIC_URL;

  return base ? `${base.replace(/\/$/, "")}/${path}` : path;
}

export type Stored = {
  path: string;
  width: number;
  height: number;
  blurData: string;
};

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_BYTES = 12 * 1024 * 1024;

/**
 * Reads the image, records what the page will need, and writes the object.
 *
 * The name is generated rather than taken from the upload. A filename chosen by
 * whoever made the file carries their folder structure, their language and
 * sometimes their client's name, and it has to be sanitised against traversal
 * anyway; generating one removes the whole class of problem and costs nothing,
 * since the description lives in the database.
 *
 * The placeholder is produced here rather than in the browser: it is twenty
 * pixels wide and inlined into the page, so it must be small and it must be the
 * same image, which only the server can guarantee.
 */
export async function store(file: File): Promise<Stored | null> {
  const store = connect();

  if (!store.ok || file.size === 0 || file.size > MAX_BYTES) {
    return null;
  }

  if (!ALLOWED.has(file.type)) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const image = sharp(buffer);
  const meta = await image.metadata();

  if (!meta.width || !meta.height) {
    return null;
  }

  const placeholder = await image
    .clone()
    .resize(20, null, { fit: "inside" })
    .webp({ quality: 40 })
    .toBuffer();

  const extension = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `media/${randomBytes(12).toString("hex")}.${extension}`;

  await store.client.putObject(store.bucket, path, buffer, buffer.length, {
    "Content-Type": file.type,
    /* A generated name never collides and never changes, so the object can be
       cached for as long as anyone is willing to keep it. */
    "Cache-Control": "public, max-age=31536000, immutable",
  });

  return {
    path,
    width: meta.width,
    height: meta.height,
    blurData: `data:image/webp;base64,${placeholder.toString("base64")}`,
  };
}

export async function discard(path: string) {
  const store = connect();

  if (!store.ok) {
    return;
  }

  try {
    await store.client.removeObject(store.bucket, path);
  } catch {
    /* The row is going either way. An object left behind is a few kilobytes in
       a bucket; a row pointing at nothing is a broken image on a page. */
  }
}
