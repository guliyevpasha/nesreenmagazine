/** Yalnız lokal test: saytdakı ilə eyni render (markdown → sanitize → TOC). Production-da 404. */
import { NextResponse } from "next/server";
import { addHeadingIds, sanitizeArticleHtml } from "@/lib/content/sanitize-article";
import { markdownToHtml } from "@/lib/markdown";

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });
  const body = await request.text();
  return NextResponse.json(addHeadingIds(sanitizeArticleHtml(markdownToHtml(body))));
}
