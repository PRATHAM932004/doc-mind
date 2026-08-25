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

    // Validate using Zod and our custom extension checker
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

    // 1. Create Document record in UPLOADING state
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

    // 2. Transition to PROCESSING state
    await prisma.document.update({
      where: { id: createdDocId },
      data: { status: 'PROCESSING' },
    });

    // 3. Read file buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Extract text content based on file extension
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

    // 5. Chunk the text
    const chunks = chunkText(extractedDoc.text);

    // 6. Generate embeddings and store chunks
    for (const chunk of chunks) {
      // Generate the embedding vector
      const embedding = await generateEmbedding(chunk.content);
      const embeddingStr = `[${embedding.join(',')}]`;

      // Create Chunk in database (without embedding first)
      const dbChunk = await prisma.documentChunk.create({
        data: {
          documentId: createdDocId,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          tokenCount: chunk.tokenCount,
        },
      });

      // Update the vector column using raw SQL cast
      await prisma.$executeRawUnsafe(
        `UPDATE "DocumentChunk" SET embedding = cast($1 as vector) WHERE id = $2`,
        embeddingStr,
        dbChunk.id
      );
    }

    // 7. Transition to COMPLETED state
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

    // Rollback / Cleanup if document was created
    if (createdDocId) {
      try {
        // Delete all chunks created for this document
        await prisma.documentChunk.deleteMany({
          where: { documentId: createdDocId },
        });

        // Set status to FAILED
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
