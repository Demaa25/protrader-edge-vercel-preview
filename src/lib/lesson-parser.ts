// src/lib/lesson-parser.ts

import mammoth from "mammoth";
import * as pdfParse from "pdf-parse";
import { putPublicBlob } from "@/lib/blob";

type Block = {
  type:
    | "HEADING"
    | "TEXT"
    | "IMAGE"
    | "BULLET_LIST"
    | "CALLOUT"
    | "SECTION";
  content?: string;
  imageUrl?: string;
};

export async function parseLessonDocument(
  file: File
): Promise<Block[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "docx") return parseDocx(file);
  if (ext === "pdf") return parsePdf(file);

  const text = await file.text();
  return textToBlocks(text);
}

async function parseDocx(
  file: File
): Promise<Block[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await mammoth.convertToHtml(
    { buffer },
    {
      convertImage: (mammoth.images as any).inline(
        async (image: { read: (encoding: "base64") => Promise<string>; contentType: string }) => {
          const imageData = await image.read(
            "base64"
          );
          const extension = image.contentType.split("/")[1] || "png";
          const imageFile = new File(
            [Buffer.from(imageData, "base64")],
            `lesson-image.${extension}`,
            { type: image.contentType }
          );
          const uploaded = await putPublicBlob("lesson-images", imageFile);

          return {
            src: uploaded.url,
          };
        }
      ),
    }
  );

  return htmlToBlocks(result.value);
}

async function parsePdf(
  file: File
): Promise<Block[]> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const data = await (pdfParse as any)(buffer);

  return textToBlocks(data.text);
}

function htmlToBlocks(html: string): Block[] {
  const blocks: Block[] = [];

  const lines = html
    .replace(/<\/p>/g, "\n")
    .replace(/<\/h[1-6]>/g, "\n")
    .replace(/<\/li>/g, "\n")
    .split("\n");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // IMAGE
    const img = line.match(
      /<img.*?src="(.*?)"/
    );

    if (img) {
      blocks.push({
        type: "IMAGE",
        imageUrl: img[1],
      });
      continue;
    }

    // HEADING
    if (line.match(/^<h[1-6]/)) {
      blocks.push({
        type: "HEADING",
        content: stripHtml(line),
      });
      continue;
    }

    // BULLET
    if (line.includes("<li")) {
      blocks.push({
        type: "BULLET_LIST",
        content: stripHtml(line),
      });
      continue;
    }

    blocks.push({
      type: "TEXT",
      content: stripHtml(line),
    });
  }

  return blocks;
}

function textToBlocks(text: string): Block[] {
  const blocks: Block[] = [];

  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;

    blocks.push({
      type: "TEXT",
      content: line,
    });
  }

  return blocks;
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}
