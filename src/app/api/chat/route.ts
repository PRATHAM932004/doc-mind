import { NextResponse } from "next/server";
import { generateAnswer } from "@/lib/rag/answer";
import { chatRequestSchema } from "@/schemas/chat";

/**
 * POST /api/chat - Entry point for RAG chatbot.
 * Accepts { "message": "query content" }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors
        .map((e) => e.message)
        .join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { message } = validationResult.data;
    const result = await generateAnswer(message);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error in Chat API Route Handler:", error);
    return NextResponse.json(
      {
        error:
          error.message || "An error occurred while generating the response.",
      },
      { status: 500 },
    );
  }
}
