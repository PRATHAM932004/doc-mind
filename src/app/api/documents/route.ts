import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/documents - Returns a list of all uploaded documents with chunk counts.
 */
export async function GET() {
  try {
    const documents = await prisma.document.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { chunks: true },
        },
      },
    });

    // Format output to return a clean flat object structure
    const formattedDocs = documents.map((doc) => ({
      id: doc.id,
      name: doc.name,
      originalName: doc.originalName,
      mimeType: doc.mimeType,
      size: doc.size,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      chunksCount: doc._count.chunks,
    }));

    return NextResponse.json({ documents: formattedDocs }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching documents list:', error);
    return NextResponse.json(
      { error: 'An error occurred while retrieving the document list.' },
      { status: 500 }
    );
  }
}
