import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/documents/[id] - Deletes a document by ID and cascades down to remove all its chunks.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params?.id;

  if (!id) {
    return NextResponse.json({ error: 'Document ID is required.' }, { status: 400 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found.' }, { status: 404 });
    }

    // Delete document; Prisma cascading rules will purge associated DocumentChunks
    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Document and associated chunks deleted successfully.' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(`Error deleting document with ID ${id}:`, error);
    return NextResponse.json(
      { error: 'An error occurred while attempting to delete the document.' },
      { status: 500 }
    );
  }
}
