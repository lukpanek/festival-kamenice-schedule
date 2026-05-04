import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "artists");

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  if (!filename || filename.includes("..") || filename.includes("/")) {
    return new NextResponse(null, { status: 400 });
  }

  const abs = path.resolve(path.join(UPLOADS_DIR, filename));
  if (!abs.startsWith(path.resolve(UPLOADS_DIR) + path.sep)) {
    return new NextResponse(null, { status: 400 });
  }

  let data: Buffer;
  try {
    data = await fs.readFile(abs);
  } catch {
    return new NextResponse(null, { status: 404 });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = MIME_TYPES[ext] ?? "application/octet-stream";

  return new NextResponse(data, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
