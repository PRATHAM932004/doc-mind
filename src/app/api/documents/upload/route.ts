import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { extractPdf } from '@/lib/documents/extract-pdf';
import { extractDocx } from '@/lib/documents/extract-docx';
import { extractText } from '@/lib/documents/extract-text';
import { extractMarkdown } from '@/lib/documents/extract-markdown';
import { chunkText } from '@/lib/documents/chunk';
import { generateEmbedding } from '@/lib/embeddings/generate';
import { documentUploadSchema, isValidExtension } from '@/schemas/document';
import { ExtractedDocument } from '@/types/document';

export async function POST(request: Request) {
  let createdDocId: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const filename = file.name;
    const mimeType = file.type;
    const size = file.size;

    const validationResult = documentUploadSchema.safeParse({
      name: filename,
      size,
      mimeType,
    });

    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    if (!isValidExtension(filename)) {
      return NextResponse.json(
        { error: 'Unsupported file extension. Allowed formats: PDF, DOCX, TXT, MD' },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        name: filename,
        originalName: filename,
        mimeType,
        size,
        status: 'UPLOADING',
      },
    });

    createdDocId = document.id;

    await prisma.document.update({
      where: { id: createdDocId },
      data: { status: 'PROCESSING' },
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
    let extractedDoc: ExtractedDocument;

    if (extension === '.pdf') {
      extractedDoc = await extractPdf(buffer);
    } else if (extension === '.docx') {
      extractedDoc = await extractDocx(buffer);
    } else if (extension === '.md') {
      extractedDoc = await extractMarkdown(buffer);
    } else {
      extractedDoc = await extractText(buffer);
    }

    if (!extractedDoc.text.trim()) {
      throw new Error('Extracted text content is empty.');
    }

    const chunks = chunkText(extractedDoc.text);

    for (const chunk of chunks) {
      const embedding = await generateEmbedding(chunk.content);
      const embeddingStr = `[${embedding.join(',')}]`;

      const dbChunk = await prisma.documentChunk.create({
        data: {
          documentId: createdDocId,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          tokenCount: chunk.tokenCount,
        },
      });

      await prisma.$executeRawUnsafe(
        `UPDATE "DocumentChunk" SET embedding = cast($1 as vector) WHERE id = $2`,
        embeddingStr,
        dbChunk.id
      );
    }

    const updatedDocument = await prisma.document.update({
      where: { id: createdDocId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({
      success: true,
      document: updatedDocument,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in Document Ingestion Pipeline:', error);

    if (createdDocId) {
      try {
        await prisma.documentChunk.deleteMany({
          where: { documentId: createdDocId },
        });

        await prisma.document.update({
          where: { id: createdDocId },
          data: { status: 'FAILED' },
        });
      } catch (cleanupError) {
        console.error('Error cleaning up failed document:', cleanupError);
      }
    }

    return NextResponse.json(
      { error: error.message || 'An internal error occurred during document processing.' },
      { status: 500 }
    );
  }
}
